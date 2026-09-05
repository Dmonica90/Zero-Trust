# Zero Trust: The Infiltrator

A short cybersecurity decision game. Over three in-game days you investigate four
colleagues and decide who is exfiltrating the customer database. Firing the wrong
person costs you a day — and the attack keeps running.

```
app/       The game. React + Vite + TypeScript, built as a static site.
legacy/    The Articulate Storyline 360 publish it replaced.
```

## The game

Everything lives in [`app/`](app/README.md) — that README covers running it, the
architecture, and how the content and accessibility work.

```bash
cd app
npm install
npm run assets   # copies artwork and sound out of legacy/
npm run dev
```

`npm run build` produces a plain static site in `app/dist/`; deploy those files
anywhere.

## Publishing

The game is live at **https://dmonica90.github.io/Zero-Trust/**.

`.github/workflows/deploy.yml` rebuilds and republishes it on every push to
`main`, so changing the script or the code is enough — there is nothing to
compile or upload by hand. The workflow runs the unit tests first, so a broken
build never reaches the live site. You can also re-publish without pushing, from
the repository's Actions tab.

The built site is not committed; only sources are. For this to work, the
repository's **Settings → Pages → Source** must be set to **GitHub Actions**
(rather than "Deploy from a branch").

## The legacy publish

`legacy/` is the Storyline 360 output the game was rebuilt from (published
2026-03-20). It is kept for two reasons:

- **It is the source of the artwork.** `app/scripts/migrate-assets.mjs` reads
  `legacy/mobile/` and `legacy/story_content/` to produce the images and sound
  effects the game ships.
- **It is the reference for the script.** `app/scripts/dump-slides.mjs` reads the
  published slide data, which is where the dialogue and the endings came from.

Nothing in `app/` executes it, and it is not deployed — the live site serves the
rebuild only. Open `legacy/index.html` locally if you want to see the original
course.

The `.story` project file was never in this repository, so `legacy/` is the only
record of the original. Deleting it would mean losing the artwork sources and the
provenance of the copy.
