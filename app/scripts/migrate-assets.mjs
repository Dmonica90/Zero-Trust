#!/usr/bin/env node
/**
 * Copies the artwork and sound effects out of the published Storyline course
 * into `public/assets/`, giving each file a name a human can read.
 *
 * The published slide data points at `story_content/*.png`, but those are Flash
 * era paths: the HTML5 runtime resolves them against `mobile/`, which is where
 * the real bitmaps live. This script reads from `legacy/mobile/` for that
 * reason.
 *
 * Run with `npm run assets`. It is idempotent.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const LEGACY = path.join(ROOT, 'legacy');
const IMG_SRC = path.join(LEGACY, 'mobile');
const MEDIA_SRC = path.join(LEGACY, 'story_content');
const OUT = path.resolve(import.meta.dirname, '..', 'public', 'assets');

/** source file in mobile/ -> destination name under public/assets/img/ */
const IMAGES = {
  // Scene backdrops
  '6bipHPQwHbF.png': 'bg-alert.png',
  '6PlLFHyh5SM.png': 'bg-alert-marcus.png',
  '6GBL3h0hBTj.png': 'bg-meeting.png',
  '6PygR5p8Ov2.png': 'bg-office.png',
  '6hA9QPhCpL0.jpg': 'bg-ending-win.jpg',
  '5chnZcgpXwU.png': 'bg-ending-circuit.png',

  // Workstations, per suspect. Leo, Sara and Omar reuse one shot across the
  // three days; only Mia's desk visibly changes as the attack escalates.
  '6IPM5Jv9vtp.png': 'desk-leo.png',
  '5oLrLvdyM82.png': 'desk-sara.png',
  '6B01x9pQCga.png': 'desk-omar.png',
  '5jbDnDJDEQf.png': 'desk-mia-day1.png',
  '6Z8uLx6mD1e.jpg': 'desk-mia-day2.jpg',
  '5kLwFWQuQZz.jpg': 'desk-mia-day3.jpg',

  // Character cut-outs
  '6jZVT5Bth0r_C-10.png': 'portrait-leo.png',
  '6MEdvb5ndgX_C-10.png': 'portrait-sara.png',
  '6MiVyjbiKYT_C-10.png': 'portrait-omar.png',
  '5V7UTG49BcZ_C-10.png': 'portrait-mia.png',
  '6RZfUOBXuMp.png': 'marcus-thinking.png',
  '6hWQXE9awfg.png': 'marcus-explaining.png',

  // Title lockup
  '5yh6LxtkULA.png': 'title-zero-trust.png',
  '6XXuM4uCxnV.png': 'title-the-infiltrator.png',
};

/** source file in story_content/ -> destination name under public/assets/audio|video/ */
const AUDIO = {
  '6mIve3Sk5Xw_44100_56_0.mp3': 'ui-click.mp3',
  '5gxIJG31Q9l_44100_56_0.mp3': 'ui-select.mp3',
  '6k9BidM4IZ0_44100_56_0.mp3': 'ui-back.mp3',
  '60c4SokilrN_44100_56_0.mp3': 'ui-open.mp3',
  '5kxXVdG50yX_44100_56_0.mp3': 'ui-confirm.mp3',
  '64EadiGlfqK_44100_56_0.mp3': 'sfx-alert.mp3',
  '6PU8KJQ2uyr_44100_56_0.mp3': 'sfx-fired.mp3',
  '6ZOAXUPrmMg_44100_56_0.mp3': 'sfx-win.mp3',
  '6DEtjpkk8x5_44100_56_0.mp3': 'sfx-lose.mp3',
};

const VIDEO = {
  'video_6nHRIZnTITD_7_56_1920x1080.mp4': 'intro-glitch.mp4',
};

function copyGroup(label, srcDir, map, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  let copied = 0;
  const missing = [];

  for (const [from, to] of Object.entries(map)) {
    const src = path.join(srcDir, from);
    if (!fs.existsSync(src)) {
      missing.push(from);
      continue;
    }
    fs.copyFileSync(src, path.join(outDir, to));
    copied += 1;
  }

  console.log(`${label}: ${copied}/${Object.keys(map).length} copied -> ${path.relative(ROOT, outDir)}`);
  if (missing.length) console.warn(`  missing in source: ${missing.join(', ')}`);
  return missing.length;
}

const problems =
  copyGroup('images', IMG_SRC, IMAGES, path.join(OUT, 'img')) +
  copyGroup('audio', MEDIA_SRC, AUDIO, path.join(OUT, 'audio')) +
  copyGroup('video', MEDIA_SRC, VIDEO, path.join(OUT, 'video'));

if (problems > 0) {
  console.error('\nSome source files were not found. The legacy publish may have moved.');
  process.exit(1);
}
console.log('\nDone.');
