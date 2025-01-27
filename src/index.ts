import type { Plugin } from "vite";
import fs from "fs/promises";
import path from "path";
import https from "https";

interface PluginOptions {
  accessToken: string;
  agentTypes?: string[];
  disallow?: string;
  cacheHours?: number;
  debug?: boolean;
  outputDir?: string;
}

interface ApiResponse {
  status: number;
  text: string;
}

interface CacheData {
  timestamp: number;
  content: string;
}

export const aiRobots = (options: PluginOptions): Plugin => {
  const CACHE_FILENAME = ".ai-robots-cache.json";
  const DEFAULT_DISALLOW = "/";
  const DEFAULT_CACHE_HOURS = 24;

  return {
    name: "vite-plugin-ai-robots",
    async configResolved(config) {
      try {
        const outputDir = options.outputDir || "static";
        const outputPath = path.join(config.root, outputDir, "robots.txt");

        // Read cache if available
        let cachedContent: string | null = null;
        try {
          const cacheFile = await fs.readFile(CACHE_FILENAME, "utf-8");
          const cacheData: CacheData = JSON.parse(cacheFile);

          if (
            Date.now() - cacheData.timestamp <
            (options.cacheHours || DEFAULT_CACHE_HOURS) * 3600 * 1000
          ) {
            cachedContent = cacheData.content;
          }
        } catch {}

        if (!cachedContent) {
          const response = await fetchRobotsTxt({
            accessToken: options.accessToken,
            agentTypes: options.agentTypes || [
              "AI Data Scraper",
              "Undocumented AI Agent",
            ],
            disallow: options.disallow || DEFAULT_DISALLOW,
          });

          if (response.status !== 200) {
            throw new Error(
              `API request failed: ${response.status} - ${response.text}`
            );
          }

          cachedContent = response.text;

          // Update cache
          await fs.writeFile(
            CACHE_FILENAME,
            JSON.stringify({
              timestamp: Date.now(),
              content: cachedContent,
            })
          );
        }

        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Write robots.txt
        await fs.writeFile(outputPath, cachedContent);

        if (options.debug) {
          console.log(`Generated robots.txt at: ${outputPath}`);
          console.log(`Content:\n${cachedContent}`);
        }
      } catch (error) {
        console.error("AI Robots.txt plugin error:");
        console.error(error);
      }
    },
  };
};

async function fetchRobotsTxt(params: {
  accessToken: string;
  agentTypes: string[];
  disallow: string;
}): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      agent_types: params.agentTypes,
      disallow: params.disallow,
    });

    const req = https.request(
      "https://api.darkvisitors.com/robots-txts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
          "Content-Length": postData.length,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            text: data,
          });
        });
      }
    );

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}
