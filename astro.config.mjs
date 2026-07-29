// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Rewrites every emitted sitemap URL to end in `.html`, matching the
// `build.format: 'file'` output (the root `/` is the one exception).
function toHtmlUrl(url) {
  const u = new URL(url);
  if (u.pathname === '/') return url;
  u.pathname = u.pathname.replace(/\/$/, '').replace(/(\.html)?$/, '.html');
  return u.toString();
}

// @astrojs/sitemap's own write-sitemap.js does an unconditional string
// replace on the raw XML — whenever trailingSlash:'never' or
// build.format:'file' is set, it strips the trailing slash from the site
// root's <loc> entry, *after* serialize() already ran. There's no option to
// disable it, so this second integration runs its astro:build:done hook
// after sitemap's (Astro runs hooks in integration-array order) and patches
// the root URL back to end in '/'.
function fixSitemapRootSlash() {
  let siteUrl;
  return {
    name: 'fix-sitemap-root-slash',
    hooks: {
      'astro:config:done': ({ config }) => {
        siteUrl = config.site;
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (!siteUrl) return;
        const bare = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
        const withSlash = `${bare}/`;
        const outDir = fileURLToPath(dir);
        const files = (await readdir(outDir)).filter((f) => /^sitemap-\d+\.xml$/.test(f));
        for (const file of files) {
          const filePath = path.join(outDir, file);
          const contents = await readFile(filePath, 'utf8');
          const patched = contents.replace(`<loc>${bare}</loc>`, `<loc>${withSlash}</loc>`);
          if (patched !== contents) {
            await writeFile(filePath, patched);
            logger.info(`Restored trailing slash on sitemap root URL in ${file}`);
          }
        }
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://j-alyavdin.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      serialize(item) {
        item.url = toHtmlUrl(item.url);
        return item;
      },
    }),
    fixSitemapRootSlash(),
  ],
});
