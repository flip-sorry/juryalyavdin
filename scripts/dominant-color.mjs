#!/usr/bin/env node
// Build-time replacement for the old per-pixel canvas glow in script.js:
// prints the dominant color of each image, for use as the OrbitAvatar
// `glow` prop. Animated images are sampled on their first frame.
//
// Usage: node scripts/dominant-color.mjs public/images/avatar.webp [...more]
import sharp from 'sharp';

if (process.argv.length < 3) {
  console.error('usage: node scripts/dominant-color.mjs <image> [...more]');
  process.exit(1);
}

for (const file of process.argv.slice(2)) {
  const { dominant } = await sharp(file, { pages: 1 }).stats();
  const hex =
    '#' +
    [dominant.r, dominant.g, dominant.b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('');
  console.log(`${file}\t${hex}`);
}
