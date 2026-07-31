#!/usr/bin/env node
// Renders scripts/cv/cv.html to a single-page A4 PDF (+ a PNG preview).
// Usage: node scripts/cv/render-cv.mjs [--out <pdf-path>] [--preview <png-path>]
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const outPdf = arg('out', path.join(dir, '../../public/j-alyavdin-cv.pdf'));
const outPng = arg('preview', '/tmp/cv-preview.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto(`file://${path.join(dir, 'cv.html')}`);
await page.evaluate(() => document.fonts.ready);

await page.pdf({
  path: outPdf,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});
await page.screenshot({ path: outPng, fullPage: true });
await browser.close();

console.log(`pdf: ${outPdf}\npreview: ${outPng}`);
