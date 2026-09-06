#!/usr/bin/env node
/**
 * Lists the branch/desk combinations that still fall back to the day's default
 * dialogue, so the writing that the design asks for but the script does not yet
 * cover is visible instead of quietly missing.
 *
 * Run with `npm run content:gaps`. It reports; it never fails a build.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(import.meta.dirname, '..', 'src', 'content');
const SUSPECTS = ['leo', 'sara', 'omar', 'mia'];
const INNOCENTS = SUSPECTS.filter((s) => s !== 'mia');

for (const file of fs.readdirSync(DIR).filter((f) => /^story\..+\.json$/.test(f))) {
  const story = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  console.log(`\n${file}`);

  let covered = 0;
  let total = 0;
  const missing = [];

  // Day 2 is reached by firing one innocent; day 3 by firing two.
  for (const [day, firedSets] of [
    ['2', INNOCENTS.map((a) => [a])],
    ['3', INNOCENTS.flatMap((a) => INNOCENTS.filter((b) => b > a).map((b) => [a, b]))],
  ]) {
    const content = story.days[day];
    for (const fired of firedSets) {
      const present = SUSPECTS.filter((s) => !fired.includes(s));
      for (const desk of present) {
        total += 1;
        // A branch is keyed by the most recent firing.
        const has = content.branches?.[fired[fired.length - 1]]?.[desk];
        if (has) covered += 1;
        else missing.push(`day ${day} · fired ${fired.join(' + ')} · desk ${desk}`);
      }
    }
  }

  console.log(`  ${covered}/${total} combinations have their own text.`);
  if (missing.length) {
    console.log('  Using the day default (write these to make the branch its own):');
    for (const m of missing) console.log(`    - ${m}`);
  }
}

console.log(
  '\nThe Notion "Boss Dialogues" table holds a second pass of the day 2 and 3\n' +
    'desk observations that could seed some of these, once it is clear which\n' +
    'branch each one belongs to.',
);
