#!/usr/bin/env node
/**
 * Re-encodes the migrated artwork to WebP.
 *
 * The source PNGs come out of the Storyline publish at up to 3.5 MB each and
 * total ~24 MB — most of the download for a three-minute game. WebP at quality
 * 82 keeps them indistinguishable at the sizes they are displayed.
 *
 * Backdrops are also capped at 1920px wide: nothing renders larger, and several
 * source files are bigger than that.
 *
 * The PNG/JPG intermediates are removed afterwards — every browser this game
 * targets reads WebP, so shipping both would only double the repository.
 * `npm run assets` re-creates them from the legacy publish and runs this again.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMG_DIR = path.resolve(import.meta.dirname, '..', 'public', 'assets', 'img');

/** Portraits sit at ~180px tall on screen; backdrops fill the viewport. */
const MAX_WIDTH = (name) => (name.startsWith('portrait-') || name.startsWith('marcus-') ? 900 : 1920);

const files = (await fs.readdir(IMG_DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (files.length === 0) {
  console.error('No source images found. Run `npm run assets` first.');
  process.exit(1);
}

let before = 0;
let after = 0;

for (const file of files) {
  const src = path.join(IMG_DIR, file);
  const out = path.join(IMG_DIR, `${path.parse(file).name}.webp`);

  const image = sharp(src);
  const { width } = await image.metadata();
  const limit = MAX_WIDTH(file);

  await image
    .resize({ width: Math.min(width ?? limit, limit), withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(out);

  const [srcStat, outStat] = await Promise.all([fs.stat(src), fs.stat(out)]);
  before += srcStat.size;
  after += outStat.size;
  await fs.rm(src);

  const pct = Math.round((1 - outStat.size / srcStat.size) * 100);
  console.log(`${file.padEnd(26)} ${kb(srcStat.size)} -> ${kb(outStat.size)}  (-${pct}%)`);
}

console.log(`\nTotal ${kb(before)} -> ${kb(after)} (-${Math.round((1 - after / before) * 100)}%)`);
console.log('Removed the PNG/JPG intermediates; re-run `npm run assets` to rebuild them.');

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0).padStart(5)} kB`;
}
