# Installing ARJ

Three ways to use ARJ in a reveal.js deck. Each loads the same files, the `arj/` folder; only the address changes.

| Way | Needs | Best for |
|---|---|---|
| [1. jsDelivr](#1-from-jsdelivr-nothing-to-install) | Nothing | Most decks, and anything on GitHub Pages |
| [2. npm](#2-with-npm-nodejs) | [Node.js](https://nodejs.org/) | Decks in a repository that already uses npm, or working offline |
| [3. A zip](#3-from-a-zip-download) | Nothing | A deck that must work with no internet, or a copy to change |

Use a fixed version (`1.8.15` here), not the latest: a deck then stays exactly as you tested it until you choose to move it on. The versions are on the [releases page](https://github.com/SDevTutors/apocalypse-reveal-js/releases) and on [npm](https://www.npmjs.com/package/apocalypse-reveal-js).

ARJ needs [reveal.js](https://revealjs.com/) 5. The examples load reveal.js 5.1.0 from jsDelivr too.

---

## 1. From jsDelivr (nothing to install)

[jsDelivr](https://www.jsdelivr.com/) serves every published version of ARJ, from npm or from the GitHub tag. Put this in the deck's HTML:

```html
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/apocalypse-reveal-js@1.8.15/arj/css/arj.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/apocalypse-reveal-js@1.8.15/arj/css/deck-controls.css" />
</head>
<body>
  <div class="reveal"><div class="slides"> ... </div></div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/apocalypse-reveal-js@1.8.15/arj/js/deck-start.js"></script>
  <script>
    startDeck({
      width: 1280, height: 720,
      lock: true,   // the padlock
      draw: true,   // the pen
      deckScripts: ['link-icons.js', 'deck-controls.js', 'deck.js', 'deck-draw.js', 'deck-search.js', 'deck-zoom.js'],
    });
  </script>
</body>
```

`deck-start.js` loads the scripts in `deckScripts` from the same address, so the page names only that one file. The full list of settings is in the [readme](../readme.md#using-it-in-a-presentation).

The same files from the GitHub tag, if you prefer (note the `v`):

```text
https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.15/arj/js/deck-start.js
```

To move to a new version, change `1.8.15` in the addresses.

---

## 2. With npm (Node.js)

You need [Node.js](https://nodejs.org/) (it comes with npm). Check it's there:

```bash
node --version
npm --version
```

In the folder at the top of your deck's repository:

```bash
npm install apocalypse-reveal-js@1.8.15
```

npm puts ARJ in `node_modules/apocalypse-reveal-js/arj/`, and writes `package.json` and `package-lock.json`.

### Add `node_modules` to `.gitignore`

`node_modules` is downloaded, not written by you, so it stays out of git. Add this line to the repository's `.gitignore` (make the file if there isn't one):

```gitignore
node_modules/
```

With no `/` at the start, it ignores a `node_modules` folder at any depth, including `docs/memes/node_modules/`.

Do commit `package.json` and `package-lock.json`: they record the version, so anyone who clones the repository gets the same ARJ with:

```bash
npm install
```

### Point the deck at it

The addresses are relative to the deck's HTML file. A deck at the top of the repository:

```html
<link rel="stylesheet" href="node_modules/apocalypse-reveal-js/arj/css/arj.css" />
<link rel="stylesheet" href="node_modules/apocalypse-reveal-js/arj/css/deck-controls.css" />
<script src="node_modules/apocalypse-reveal-js/arj/js/deck-start.js"></script>
```

A deck two folders down, such as `docs/memes/index.html`, goes up two folders first:

```html
<link rel="stylesheet" href="../../node_modules/apocalypse-reveal-js/arj/css/arj.css" />
<link rel="stylesheet" href="../../node_modules/apocalypse-reveal-js/arj/css/deck-controls.css" />
<script src="../../node_modules/apocalypse-reveal-js/arj/js/deck-start.js"></script>
```

Open the deck through a local web server, not by double-clicking the file, for example:

```bash
npx serve .
```

**GitHub Pages doesn't run `npm install`,** and `node_modules` isn't in git, so a deck published on GitHub Pages can't load ARJ from `node_modules`. Use jsDelivr (1) for a published deck, or the zip (3).

To update later: `npm install apocalypse-reveal-js@` and the new version, then commit `package.json` and `package-lock.json`.

---

## 3. From a zip download

1. Go to the [releases page](https://github.com/SDevTutors/apocalypse-reveal-js/releases) and download **Source code (zip)** under the version you want. For 1.8.15:

   ```text
   https://github.com/SDevTutors/apocalypse-reveal-js/archive/refs/tags/v1.8.15.zip
   ```

2. Unzip it, and copy the `arj` folder into your deck's folder, next to its HTML file. Only `arj` is needed; the rest is the demo, the docs and the tools.
3. Load it from there:

   ```html
   <link rel="stylesheet" href="arj/css/arj.css" />
   <link rel="stylesheet" href="arj/css/deck-controls.css" />
   <script src="arj/js/deck-start.js"></script>
   ```

This copy is part of your deck: commit it with the deck (don't ignore it), and it works on GitHub Pages. Keep the `LICENSE` file from the zip with it, as the MIT licence asks. To update, download the new zip and replace the `arj` folder.

Two parts still come from the internet even then: reveal.js (unless you copy that too) and the drawing tools, which `deck-start.js` loads from jsDelivr.

---

## Licence

ARJ is under the [MIT licence](../LICENSE): use it, change it and share it, keeping the copyright notice. Drawing uses [tldreveal](https://github.com/arthurrump/tldreveal) and [tldraw](https://tldraw.com), which have their own licences.
