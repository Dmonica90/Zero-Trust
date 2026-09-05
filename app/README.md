# Zero Trust: The Infiltrator

A short cybersecurity decision game. Over three in-game days you investigate four
colleagues and decide who is exfiltrating the customer database. Firing the wrong
person costs you a day — and the attack keeps running.

This is a ground-up rebuild of a course that was previously authored in
Articulate Storyline 360. The original published output is kept under
`../legacy/` as the source for the artwork and as a reference for the script;
nothing in this app runs it.

## Why it was rebuilt

Storyline made three things impossible from inside the tool:

- **One language per publish.** Shipping Spanish and English meant maintaining
  two separate courses.
- **Hover-only interaction.** 122 of the 183 JavaScript triggers in the published
  course were bound to `onrollover`/`onrollout`, which never fire on a touch
  screen.
- **A fixed 1920×1080 canvas**, scaled to fit, patched with `!important` CSS —
  patches that a republish silently overwrote.

It also duplicated the same nine slides three times, so a change to the office
screen meant editing it in three places.

## Running it

```bash
npm install
npm run assets   # copies artwork and sound out of the legacy publish
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Game logic and content tests (Vitest) |
| `npm run e2e` | Full playthroughs in a browser (Playwright) |
| `npm run assets` | Re-copy assets from the legacy publish and re-encode them |

The build is a plain static site: deploy the contents of `dist/` anywhere.

## How it is put together

```
src/
  game/machine.ts       Pure reducer: phases, days, accusations, evidence
  content/story.*.json  The entire script, one file per language
  content/schema.ts     Types + a structural validator run by the tests
  i18n/                 Language detection, switching, persistence
  screens/              One component per phase
  components/           Scene, Dialog, Button, HUD, suspect card
  audio/                Sound-effect pool with a mute toggle
scripts/
  dump-slides.mjs       Reads the legacy Storyline slide data (provenance)
  migrate-assets.mjs    Copies and renames the artwork and audio
  optimize-images.mjs   Re-encodes to WebP and caps oversized backdrops
```

**Content is data.** Every string a player reads lives in `story.en.json` /
`story.es.json`. Adding a fourth day is a new entry under `days`; adding a
language is a new file plus an entry in `src/content/index.ts`. The tests fail if
the two language files ever drift apart in shape.

**English is the editorial source.** The original course was written in English,
so `story.en.json` is where new or changed copy is authored and `story.es.json`
is its translation. Spanish is still the default a player sees when their browser
does not ask for English.

**Logic is pure.** `src/game/machine.ts` imports nothing from React and holds no
strings, so the rules are covered by fast unit tests rather than by clicking
through the game.

### Assets

The artwork, the nine sound effects and the short video clip come from the
original course. The published slide data refers to images as
`story_content/*.png`, but those are Flash-era paths — the real bitmaps are in
`legacy/mobile/`, which is what `migrate-assets.mjs` reads. There is no narration to
re-record, which is why the bilingual version costs nothing beyond translation.

`npm run assets` copies the originals and then re-encodes them: **24 MB of PNGs
becomes 1.6 MB of WebP**, with backdrops capped at 1920px. The PNG intermediates
are deleted afterwards rather than kept as a fallback — every browser that can
run this game reads WebP. The 5.3 MB video only backs the losing ending and is
never preloaded.

## Accessibility

- Every interaction is a real button: click, tap and Enter all work.
- Suspect cards carry an explicit label, so a screen reader announces name, role,
  state and quote in a stable order.
- Alerts are in an `aria-live` region and the full text is in the DOM from the
  first frame, ahead of the typewriter reveal.
- Dialogs trap focus and close on Escape.
- `prefers-reduced-motion` disables the animations, including the typewriter.
- The Playwright suite includes a complete keyboard-only playthrough.
