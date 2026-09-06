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
  '5ZlkdMMnK8f.png': 'icon-notification.png', // the chat bubble you click to open the alert
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

  // Character cut-outs. These are the portraits each character uses in their own
  // zoom scene, which is the only place the published course names them — the
  // office "fired" layer shows the same four people with no names attached, so
  // matching them there by clothing gets Sara and Mia the wrong way round.
  '6jZVT5Bth0r.png': 'portrait-leo.png',
  '5pAJm9ExQgr.png': 'portrait-sara.png',
  '6byvreq8SDl_C20.png': 'portrait-omar.png',
  '5wRoVJWFsfV.png': 'portrait-mia.png',
  '6RZfUOBXuMp.png': 'marcus-thinking.png',
  '6hWQXE9awfg.png': 'marcus-explaining.png',

  // Title lockup
  '5yh6LxtkULA.png': 'title-zero-trust.png',
  '6XXuM4uCxnV.png': 'title-the-infiltrator.png',
};

/**
 * source file in story_content/ -> destination name under public/assets/audio/
 *
 * Named after where each clip actually plays in the published course, found by
 * resolving every slide's `audiolib` assetId against the asset table in
 * `data.js`. Guessing from file size gets this wrong: the 6-second clip is the
 * day-change sting, not a fanfare.
 *
 * The original has no victory sound — the winning slides carry only the generic
 * click — so there is none here either.
 */
const AUDIO = {
  '6k9BidM4IZ0_44100_56_0.mp3': 'ui-click.mp3', // 0.5s, on every slide
  '5gxIJG31Q9l_44100_56_0.mp3': 'ui-select.mp3', // meeting and zoom
  '60c4SokilrN_44100_56_0.mp3': 'ui-open.mp3', // meeting
  '5kxXVdG50yX_44100_56_0.mp3': 'ui-confirm.mp3', // meeting, office, zoom
  '6mIve3Sk5Xw_44100_56_0.mp3': 'sfx-notification.mp3', // 0.3s, notification only
  '64EadiGlfqK_44100_56_0.mp3': 'sfx-alert.mp3', // 1.9s, notification only
  '6PU8KJQ2uyr_44100_56_0.mp3': 'sfx-fired.mp3', // 2.0s, office
  '6ZOAXUPrmMg_44100_56_0.mp3': 'sfx-day.mp3', // 6.0s, day-change card
  '6DEtjpkk8x5_44100_56_0.mp3': 'sfx-lose.mp3', // 8.1s, defeat
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
