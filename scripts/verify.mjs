#!/usr/bin/env node
// Post-build URL-contract verification against a running preview server.
// Usage: node scripts/verify.mjs [--base http://localhost:4321]
const base =
  process.argv.includes('--base')
    ? process.argv[process.argv.indexOf('--base') + 1]
    : 'http://localhost:4321';

const MUST_200 = [
  '/', '/index.html', '/sorry.html', '/404.html', '/iris/privacy.html',
  '/casestudy/avito.html', '/casestudy/idealista.html', '/casestudy/impress-app.html',
  '/casestudy/market.html', '/casestudy/pepsi.html', '/casestudy/run.html',
  '/casestudy/snake.html', '/robots.txt', '/sitemap-index.xml', '/sitemap-0.xml',
  '/images/ogimage-fb.jpg', '/site.webmanifest', '/browserconfig.xml',
  '/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png',
  '/apple-touch-icon.png', '/android-chrome-192x192.png', '/android-chrome-512x512.png',
  '/mstile-150x150.png', '/j-alyavdin-cv.pdf',
  '/font/Aeonik-Regular.woff2', '/font/Aeonik-Medium.woff2', '/hero.mp4', '/hero.png',
];

let failures = 0;
const fail = (msg) => { failures++; console.error(`FAIL  ${msg}`); };

for (const path of MUST_200) {
  const res = await fetch(base + path, { method: 'HEAD' }).catch(() => null);
  if (!res || res.status !== 200) fail(`${res?.status ?? 'ERR'} ${path}`);
}

// Every sitemap <loc> must resolve, and sorry/404 must not be listed.
const sitemap = await (await fetch(`${base}/sitemap-0.xml`)).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length !== 9) fail(`sitemap has ${locs.length} locs, expected 9`);
for (const loc of locs) {
  if (/sorry|404/.test(loc)) fail(`noindex page in sitemap: ${loc}`);
  const path = new URL(loc).pathname;
  const res = await fetch(base + (path === '' ? '/' : path), { method: 'HEAD' }).catch(() => null);
  if (!res || res.status !== 200) fail(`${res?.status ?? 'ERR'} sitemap loc ${loc}`);
}

// canonical + og:url must be self-referential .html URLs; exactly one
// og:image with 1200x630 on every page.
const PAGES = MUST_200.slice(1, 12);
for (const path of PAGES) {
  const html = await (await fetch(base + path)).text();
  const expected = `https://j-alyavdin.com${path === '/index.html' ? '/' : path}`;
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  if (path !== '/404.html') {
    if (canonical !== expected) fail(`${path} canonical=${canonical} expected=${expected}`);
    if (ogUrl !== expected) fail(`${path} og:url=${ogUrl}`);
  }
  const ogImages = html.match(/property="og:image"/g)?.length ?? 0;
  if (ogImages !== 1) fail(`${path} has ${ogImages} og:image tags`);
  if (!html.includes('og:image:width" content="1200"')) fail(`${path} og:image:width wrong`);
}

console.log(failures === 0 ? 'VERIFY: ALL PASS' : `VERIFY: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
