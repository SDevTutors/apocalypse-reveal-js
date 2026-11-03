
# Apocalypse Reveal-js (ARJ)

<img src="arj/img/arj-logo.svg" alt="ARJ logo" height="56" />

**ARJ**, Apocalypse Reveal-js: reusable scripts and styles that sit on top of [reveal.js](https://revealjs.com/) 5. Made for the SDev Tutors decks by [Mark Crowe](https://sdevtutors.github.io/mark-crowe/).

- Source: <https://github.com/SDevTutors/apocalypse-reveal-js>
- Version: 1.8.7 (year.tenth.day: year 1 is 2026, the tenth of the year 0 to 9, then the number of days with changes in that tenth)
- Demo: [`demo/index.html`](demo/index.html), and the same slides already printed: [`demo/arj-demo.pdf`](demo/arj-demo.pdf)

![alt text](docs/images/all-will-be-revealed-my-child.gif)

> "All will be revealed" - [En Sabah Nur](https://www.imdb.com/title/tt3385516/characters/nm1209966/ "Apocalypse"), [X-Men: Apocalypse (2016)](https://www.imdb.com/title/tt3385516/ "X-Men: Apocalypse (2016)")

---

## What's in it

Everything a deck needs is in the `arj` folder: JavaScript, CSS and pictures, no documentation.

| File                                                                   | What it does                                                                                                                                     |
|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| [`arj/js/deck-start.js`](arj/js/deck-start.js)                         | Starts the deck: `startDeck({...})` runs reveal.js, loads tldreveal for drawing, then loads the other scripts in order                           |
| [`arj/js/deck-markdown.js`](arj/js/deck-markdown.js)                   | For Markdown decks: classes for field lines ("**Who:** ..."), scene lines, shrinking long slides to fit, on screen and in the print version, and continuing a long list on new slides (`class="split"`) |
| [`arj/js/link-icons.js`](arj/js/link-icons.js)                         | A website's own icon beside each link, and an arrow out of a box after links that open a new tab                                                 |
| [`arj/js/deck-controls.js`](arj/js/deck-controls.js)                   | The buttons (slide list, home, contents, blackout, all slides, full screen, exit), the slide list sidebar, the contents slides and the numbering |
| [`arj/js/deck.js`](arj/js/deck.js)                                     | The mouse (wheel, click, right click, middle click), the padlock, footnote jumps, copy buttons on code, email links, the position bar in a stack, the slide at the top of a tall window (`pinTop: true`) |
| [`arj/js/deck-draw.js`](arj/js/deck-draw.js)                           | The pen button: drawing on the slides with tldreveal                                                                                             |
| [`arj/css/arj.css`](arj/css/arj.css)                                   | The theme: light slides, navy and gold, 1280 × 720. Code boxes, link icons, and the title slide (`class="title-slide arj-title"`)                |
| [`arj/css/deck-controls.css`](arj/css/deck-controls.css)               | The buttons, sidebar, contents, padlock, pen and exit, and the PDF icon on print and PDF links                                                   |
| [`arj/img/arj-logo.svg`](arj/img/arj-logo.svg)                         | The ARJ logo (`tap-logo.png` is the old one)                                                                                                     |
| [`arj/img/favicons/`](arj/img/favicons/)                               | ARJ's own two website icons for `link-icons.js`, reveal.js and GitHub. A deck keeps any others itself                                            |
| [`arj/img/meme/expanding-brain.jpg`](arj/img/meme/expanding-brain.jpg) | The expanding brain meme, for the theme's `.brain` layout                                                                                        |

---

## Using it in a presentation

### With a copy of the folder

Copy `arj` next to your HTML file:

```html
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />
  <link rel="stylesheet" href="arj/css/arj.css" />
  <link rel="stylesheet" href="arj/css/deck-controls.css" />
</head>
<body>
  <div class="reveal"><div class="slides"> ... </div></div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
  <script src="arj/js/deck-start.js"></script>
  <script>
    startDeck({
      width: 1280, height: 720,      // any reveal.js setting
      mouseWheel: false,             // deck.js handles the wheel
      scrollActivationWidth: null,   // keep the slides on a phone (tldreveal needs this)
      lock: true,                    // the padlock
      draw: true,                    // the pen (the default)
      drawToolbar: 'top',            // tldraw's tools at the top centre (or 'bottom')
      drawOnDoubleClick: false,      // a double click selects a word, not opens drawing
      linkIcons: { newTab: true },   // links to other websites open in a new tab
      deckControls: { exit: true },  // the exit button (the default)
      deckScripts: ['link-icons.js', 'deck-controls.js', 'deck.js', 'deck-draw.js'],
    });
  </script>
</body>
```

A script named without a folder (`'deck.js'`) is loaded from the folder `deck-start.js` came from, so the page only names that one file. Order matters: `deck-markdown.js` first (for Markdown decks), then `link-icons.js`, `deck-controls.js`, `deck.js`, and `deck-draw.js` last.

### From the hosted copy

The same, with the hosted addresses in place of `arj/...`. [jsDelivr](https://www.jsdelivr.com/) serves the files straight from this repository:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@master/arj/css/arj.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@master/arj/css/deck-controls.css" />
...
<script src="https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@master/arj/js/deck-start.js"></script>
```

`deck-start.js` loads the scripts in `deckScripts` from the same address, so the deck doesn't name them. Every file is at `https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@master/` followed by its path in the table above (checked 31 October 2026).

`@master` is the latest version: it changes when this repository does, and jsDelivr can take up to a week to catch up. Once a version is tagged (`v1.8.6`, say), `@v1.8.6` in place of `@master` is a fixed address that never changes. Tagging, GitHub releases, the npm package and a git-ignored copy in a deck: [`docs/publishing.md`](docs/publishing.md).

---

## The padlock (`lock: true`)

A padlock at the top right, beside the other buttons.

- **Locked** (the start): the mouse moves through the slides. Left click on empty space is next, right click is back, the wheel steps one slide. Text can't be selected and there is no context menu, so nothing gets selected by accident.
- **Unlocked**: select and copy text; the context menu works. The mouse doesn't change slides: no click, wheel or mouse-button navigation. The keyboard, reveal.js's arrows and the buttons still do.

Either way, links, buttons, copy icons, the stack bars, the footnote markers and reveal.js's controls work. Without `lock: true` a deck behaves as before: the mouse moves the slides and text can be selected.

---

## Drawing (tldreveal)

Drawing uses [tldreveal](https://github.com/arthurrump/tldreveal) by Arthur Rump ([demo](https://arthurrump.github.io/tldreveal/)), which puts [tldraw](https://tldraw.com) over the slides. It's part of ARJ: `startDeck` loads tldreveal 1.2.0 (its bundle, with React and tldraw) from jsDelivr and adds it to the plugins before reveal.js starts. A deck doesn't need its own `<script>` for it.

| Action                    | How                                             |
|---------------------------|-------------------------------------------------|
| Open drawing              | The pen button, or D                            |
| Close drawing             | The pen button again, or Esc. The drawings stay |
| Hide or show the drawings | V (tldreveal's key)                             |

- Each slide keeps its own drawings; they come back with the slide.
- tldraw's tools are at the top centre (`drawToolbar: 'top'`), clear of the slide number. `drawToolbar: 'bottom'` puts them back where tldreveal has them.
- Only the slide can be drawn on, not the margins round it, the buttons or the slide number. While drawing, everything outside the slide is shaded grey, with a gold line round the slide, so you can see where the edge is.
- While drawing, the mouse belongs to tldraw: `deck.js` doesn't change slides on a click or the wheel, whether locked or not. The padlock keeps its setting for when drawing closes.
- The pen button only appears when tldreveal has loaded. With `draw: false`, offline, in the print version or in reveal.js's scroll view, there's no button and nothing is loaded.
- Settings for tldreveal go in `tldreveal: { ... }` in `startDeck` (see tldreveal's `config.ts`). ARJ sets `isDarkMode: false` for the light theme.

**Limitations**  

- tldreveal has no API to open or close drawing, so ARJ presses its keys for it (D to open, Esc to close).
- tldreveal opens drawing on any double click. ARJ turns that off (`drawOnDoubleClick: false`, the default), so a double click still selects a word when the deck is unlocked. If a double click opens drawing anyway, ARJ closes it again straight away.
- tldraw only draws on the slide: tldreveal fixes its canvas to the slide's size, so drawing can't reach the margins.
- The arrow keys still move between slides while drawing, and the drawings follow (that's tldreveal's design). Every other key goes to tldraw: reveal.js only gets the arrows and Page Up/Down, so O, F and B pick tldraw's tools instead of opening the overview, full screen or blackout.
- Drawings last until the page is reloaded. tldreveal can save them in the browser if the `.reveal` element has an `id` or `data-tlid`; ARJ doesn't set one yet.
- The bundle is about 1.2 MB, and it comes from the internet.
- tldreveal is under the Mozilla Public License 2.0, but tldraw, which it uses, has its own licence: [non-commercial use](https://github.com/tldraw/tldraw/blob/main/LICENSE.md) only.

### Chalkboard features

These features in the [reveal.js Chalkboard](https://github.com/rajgoel/reveal.js-plugins/tree/master/chalkboard) demonstration were checked against tldreveal.

| Feature                                            | In tldreveal?          | Where it comes from                                                                                               |
|----------------------------------------------------|------------------------|-------------------------------------------------------------------------------------------------------------------|
| Playback: playing through the slides automatically | No                     | rajgoel's separate audio-slideshow plugin; reveal.js's own `autoSlide` setting can step through slides on a timer |
| Playback speed, the five-second interval           | No                     | audio-slideshow's `defaultDuration` (5 seconds); `autoSlide: 5000` in reveal.js                                   |
| Mute and unmute                                    | No                     | audio-slideshow (it plays recorded audio); nothing to mute without it                                             |
| Replaying drawings stroke by stroke                | No                     | Chalkboard records strokes with timings; tldraw keeps only the finished drawing                                   |
| PDF and printing                                   | Yes, through reveal.js | reveal.js's own print version (`?print-pdf`), used as it is                                                       |

A playback button using reveal.js's `autoSlide` (play, pause, speed) could be added to ARJ. Replaying drawings and audio would need audio-slideshow or new work.

---

## Exit

The last button at the top right leaves the slides (`deckControls: { exit: true }`, the default):

- Opened from another page in the same tab, it goes back to that page, however many slides you've been through (with `history: true` each slide is a step in the browser's history, so the browser's Back button only goes back one slide).
- Opened in a tab of its own, it closes the tab. If the browser won't allow that, it opens the page that linked to the slides.
- `exit: 'index.html'` always goes to that page; `exit: false` leaves the button out.

---

## Links

[`link-icons.js`](arj/js/link-icons.js) puts a website's own icon before each link. ARJ has two, reveal.js and GitHub, as every deck links to those. Any other site's icon belongs to the deck: keep it in the deck's own folder and name the site:

```js
linkIcons: {
  folder: 'img/favicons/',  // the deck's own icons
  sites: { 'wikipedia.org': ['wikipedia.png', 'Wikipedia'] },
},
```

A site with no icon gets a plain link icon. With `linkIcons: { newTab: true }` links to other websites open in a new tab, so the slides stay open; any link that opens a new tab gets an arrow out of a box after it. A link marked `class="ext"` by hand gets the same arrow.

---

## Title slide

`<section class="title-slide arj-title">` lays out a title slide like the demo's: the title centred with a gold bar, the subtitle with a big QR code level with the top of its letters, the author and date, "Built with", and a small footer: the version on the footer's line at the right; under the line the deck's own address on the left and a short address to type in on the right (`<p class="deck-short"><a href="..." data-tip="..." data-tip-size="72">`: hover shows it big, and the big one is clickable too); the copyright under them. See [`demo/index.html`](demo/index.html) for the HTML. The QR code is just the code, with no white margin:

```py
qr_logo.py URL LOGO.png OUT.svg --border 0 # in the meme bank's tools makes one.
```

---

## PDF and printing

reveal.js makes the print version: add `?print-pdf` to the address, then print and choose Save as PDF. A link to it, best on the last slide:

```html
<a href="?print-pdf" target="_blank">Print version</a>, then Save as PDF
```

Better still, print it once and put the PDF beside the deck, so people can download it:

```html
<a href="arj-demo.pdf" download>Download the PDF</a>
```

[`deck-controls.css`](arj/css/deck-controls.css) puts a red PDF icon before any `href="?print-pdf"` link and any link to a `.pdf` file. In the print version, [`deck-markdown.js`](arj/js/deck-markdown.js) shrinks each long slide to fit its page (not a title slide, `.arj-title`, or one marked `no-fit`), and the padlock and pen aren't shown.

---

## Versions

- reveal.js 5.1.0
- tldreveal 1.2.0
