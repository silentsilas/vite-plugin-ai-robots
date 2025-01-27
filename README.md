# @silentsilas/vite-plugin-ai-robots

[![npm version](https://img.shields.io/npm/v/@silentsilas/vite-plugin-ai-robots.svg)](https://www.npmjs.com/package/@silentsilas/vite-plugin-ai-robots)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Vite plugin that automatically generates and updates a `robots.txt` file blocking AI agents using the [Dark Visitors](https://darkvisitors.com/) API.

## Installation

Create a free account at [Dark Visitors](https://darkvisitors.com/) and obtain your access token.

```bash
npm install @silentsilas/vite-plugin-ai-robots --save-dev
```

Add the token to your environment, and pass it to the plugin's config. You should now see a `robots.txt` file in your output directory during builds.

## Usage

### Basic Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { aiRobots } from "@silentsilas/vite-plugin-ai-robots";

export default defineConfig({
  plugins: [
    aiRobots({
      accessToken: process.env.DARK_VISITORS_TOKEN,
    }),
  ],
});
```

## Configuration Options

| Option          | Type       | Default                                        | Description             |
| --------------- | ---------- | ---------------------------------------------- | ----------------------- |
| **accessToken** | `string`   | _Required_                                     | Dark Visitors API token |
| `agentTypes`    | `string[]` | `["AI Data Scraper", "Undocumented AI Agent"]` | Agent types to block    |
| `disallow`      | `string`   | `"/"`                                          | Paths to disallow       |
| `cacheHours`    | `number`   | `24`                                           | Cache duration in hours |
| `outputDir`     | `string`   | `"static"`                                     | Output directory        |
| `debug`         | `boolean`  | `false`                                        | Enable debug logging    |

## Troubleshooting

**Common Issues**:

- `401 Unauthorized`: Check your access token
- Empty robots.txt: Enable `debug: true`
- Cache not updating: Delete `.ai-robots-cache.json`
  - You may want to add this file to your .gitignore
