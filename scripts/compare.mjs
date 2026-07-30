#!/usr/bin/env node
// Deterministic Playwright screenshot harness for j-alyavdin.com fidelity checks.
// Dependency-light by design: playwright + pixelmatch + pngjs only.
//
// Usage:
//   node scripts/compare.mjs capture --base <URL> --out <dir>
//   node scripts/compare.mjs diff --a <dirA> --b <dirB> --out <dir> [--threshold 0.1]

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PAGES = [
  '/index.html',
  '/casestudy/avito.html',
  '/casestudy/idealista.html',
  '/casestudy/impress-app.html',
  '/casestudy/market.html',
  '/casestudy/pepsi.html',
  '/casestudy/run.html',
  '/casestudy/snake.html',
  '/sorry.html',
  '/iris/privacy.html',
];

const WIDTHS = [1440, 1024, 880, 560, 390];
const HEIGHT = 900;
const DEFAULT_THRESHOLD_PCT = 0.1;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function pageSlug(pagePath) {
  return pagePath.replace(/^\/|\.html$/g, '').replace(/\//g, '-') || 'index';
}

// Deterministic pre-screenshot prep: fonts settled, video frozen at frame 0,
// orbit SVG frozen, and reveal-on-scroll content forced visible so a page
// captured mid-animation never produces a false diff.
async function preparePage(page) {
  // goto resolves on domcontentloaded; give images/fonts a chance to finish
  // without letting streaming media (autoplay hero video) hang us forever.
  await page.waitForLoadState('load', { timeout: 60_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(() => {
    for (const video of document.querySelectorAll('video')) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // not seekable yet — best effort, frame 0 is a nice-to-have here
      }
    }
  });

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.setAttribute('data-compare-harness', 'true');
    style.textContent = `
      /* stylesheet !important beats the inline transform that the live
         site's rAF loop rewrites every frame; .orbit is the rebuilt
         component's CSS-animated equivalent */
      #mySVG, .orbit { animation: none !important; transform: rotate(0deg) !important; }
      .fade-content {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);

    const svg = document.getElementById('mySVG');
    if (svg) {
      svg.style.setProperty('transform', 'rotate(0deg)', 'important');
      svg.style.setProperty('animation', 'none', 'important');
    }

    for (const el of document.querySelectorAll('.fade-content')) {
      el.classList.add('is-visible');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
    }
  });

  // Lazy images never load in a fullPage screenshot without scrolling, and
  // CSS background-images (the live index's 24 card thumbs) may still be
  // in flight: force-eager everything, walk the page bottom-up, then wait
  // for every <img> to decode.
  await page.evaluate(() => {
    for (const img of document.querySelectorAll('img[loading]')) {
      img.loading = 'eager';
    }
  });
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page
    .evaluate(() =>
      Promise.all(
        [...document.images]
          .filter((img) => !img.complete)
          .map((img) => img.decode().catch(() => {}))
      )
    )
    .catch(() => {});

  // Playwright's 'networkidle' resolves once there's been no network
  // activity for 500ms. Best-effort: streaming media can keep the network
  // busy indefinitely, so cap it and settle briefly instead of failing.
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function capture({ base, out }) {
  if (!base || !out) {
    throw new Error('capture requires --base <URL> and --out <dir>');
  }
  await mkdir(out, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const pagePath of PAGES) {
      const slug = pageSlug(pagePath);
      const url = new URL(pagePath, base).toString();

      for (const width of WIDTHS) {
        // Heavy autoplay media (the 14.5MB hero.mp4) makes the 'load' event
        // unreliable on slow networks, so navigate on 'domcontentloaded'
        // with a generous timeout and retry each page a few times.
        const MAX_ATTEMPTS = 3;
        // resume support: skip shots that already exist from a prior run
        const existing = path.join(out, `${slug}-${width}.png`);
        if (existsSync(existing)) {
          console.log(`skipping ${slug}-${width}.png (already captured)`);
          continue;
        }
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          const context = await browser.newContext({ viewport: { width, height: HEIGHT } });
          const page = await context.newPage();
          try {
            console.log(`capturing ${url} @ ${width}px (attempt ${attempt})`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
            await preparePage(page);

            const fileName = `${slug}-${width}.png`;
            await page.screenshot({
              path: path.join(out, fileName),
              fullPage: true,
              animations: 'disabled',
            });
            break;
          } catch (err) {
            if (attempt === MAX_ATTEMPTS) throw err;
            console.warn(`  retrying after: ${err.message.split('\n')[0]}`);
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}

async function loadPng(filePath) {
  const buffer = await readFile(filePath);
  return PNG.sync.read(buffer);
}

function padPng(png, width, height) {
  if (png.width === width && png.height === height) return png;
  const padded = new PNG({ width, height });
  PNG.bitblt(png, padded, 0, 0, png.width, png.height, 0, 0);
  return padded;
}

function padToCommonSize(a, b) {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  return { a: padPng(a, width, height), b: padPng(b, width, height), width, height };
}

async function diff({ a: dirA, b: dirB, out, threshold }) {
  if (!dirA || !dirB || !out) {
    throw new Error('diff requires --a <dirA> --b <dirB> --out <dir>');
  }
  const mismatchThresholdPct =
    threshold !== undefined ? Number(threshold) : DEFAULT_THRESHOLD_PCT;
  await mkdir(out, { recursive: true });

  const filesA = new Set((await readdir(dirA)).filter((f) => f.endsWith('.png')));
  const filesB = new Set((await readdir(dirB)).filter((f) => f.endsWith('.png')));
  const common = [...filesA].filter((f) => filesB.has(f)).sort();
  const onlyInA = [...filesA].filter((f) => !filesB.has(f)).sort();
  const onlyInB = [...filesB].filter((f) => !filesA.has(f)).sort();

  const results = [];

  for (const fileName of common) {
    const pngA = await loadPng(path.join(dirA, fileName));
    const pngB = await loadPng(path.join(dirB, fileName));
    const { a, b, width, height } = padToCommonSize(pngA, pngB);

    const diffPng = new PNG({ width, height });
    const mismatchedPixels = pixelmatch(a.data, b.data, diffPng.data, width, height, {
      threshold: 0.1, // pixelmatch's own per-pixel color-distance sensitivity
    });
    const totalPixels = width * height;
    const mismatchPct = (mismatchedPixels / totalPixels) * 100;

    await writeFile(path.join(out, fileName.replace(/\.png$/, '-diff.png')), PNG.sync.write(diffPng));

    results.push({
      file: fileName,
      width,
      height,
      mismatchedPixels,
      totalPixels,
      mismatchPct: Number(mismatchPct.toFixed(4)),
      pass: mismatchPct <= mismatchThresholdPct,
    });
  }

  results.sort((x, y) => y.mismatchPct - x.mismatchPct);

  console.log('\n' + 'File'.padEnd(40) + 'Mismatch %'.padStart(12) + '  Pass');
  console.log('-'.repeat(64));
  for (const r of results) {
    console.log(r.file.padEnd(40) + `${r.mismatchPct}%`.padStart(12) + `  ${r.pass ? 'OK' : 'FAIL'}`);
  }
  if (onlyInA.length) console.log(`\nOnly in ${dirA}:\n  ${onlyInA.join('\n  ')}`);
  if (onlyInB.length) console.log(`\nOnly in ${dirB}:\n  ${onlyInB.join('\n  ')}`);

  const summary = {
    dirA,
    dirB,
    thresholdPct: mismatchThresholdPct,
    generatedAt: new Date().toISOString(),
    results,
    onlyInA,
    onlyInB,
  };
  await writeFile(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));

  const failing = results.filter((r) => !r.pass);
  console.log(
    `\n${results.length} pairs compared, ${failing.length} above threshold (${mismatchThresholdPct}%).`
  );

  return summary;
}

async function main() {
  const [, , mode, ...rest] = process.argv;
  const args = parseArgs(rest);

  if (mode === 'capture') {
    await capture({ base: args.base, out: args.out });
  } else if (mode === 'diff') {
    await diff({ a: args.a, b: args.b, out: args.out, threshold: args.threshold });
  } else {
    console.error('Usage:');
    console.error('  node scripts/compare.mjs capture --base <URL> --out <dir>');
    console.error('  node scripts/compare.mjs diff --a <dirA> --b <dirB> --out <dir> [--threshold 0.1]');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
