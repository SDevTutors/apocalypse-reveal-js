# Publishing ARJ

ARJ has no build step: the files in `arj/` are the release. Publishing is giving a version a fixed name (a git tag), a page on GitHub (a release), and a package on npm, so decks can load an exact version from jsDelivr or keep a copy of their own.

| Where                 | Address                                                                      | Changes?                         |
|-----------------------|------------------------------------------------------------------------------|----------------------------------|
| GitHub Pages          | `https://sdevtutors.github.io/apocalypse-reveal-js/arj/...`                  | Yes, with every push to `master` |
| jsDelivr, from GitHub | `https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.6/arj/...` | No: a tag never changes          |
| jsDelivr, from npm    | `https://cdn.jsdelivr.net/npm/apocalypse-reveal-js@1.8.6/arj/...`            | No                               |
| A copy in the deck    | `node_modules/apocalypse-reveal-js/arj/...`, ignored by git                  | Only when you install again      |

`@master` (GitHub) and no version (npm) also work on jsDelivr, but they follow the latest, and jsDelivr can take up to a week to catch up.

## Why versions

GitHub Pages and `@master` are the work in progress: every push changes them, for every deck that loads them, in the middle of someone's talk if need be. A deck that loads a fixed version (`@v1.8.9`) gets exactly what it was tested with, until its owner chooses to move it on. So:

- **Decks load a released version**, from jsDelivr: `https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.9/arj/...`. Your own decks too: move them on to a new version when you've looked at them with it.
- **GitHub Pages is for the demo** and for trying the latest; tell people not to use it in their decks.
- **A release is a version you're happy for others to use**: not every commit. Commit as often as you like (each change still gets its version); release when a set of changes is ready.
- A fixed version is never changed. A mistake in it is fixed by the next version, never by moving the tag.

## In short

```bash
python tools/commit.py --pdf      # one more change: the version, the demo PDF, a local commit named "1.8.10"
git push                          # when you're happy with the commit(s)
python tools/release.py           # tags the version (v1.8.10) on this computer and prints the rest:
git push origin v1.8.10           #   the tag to GitHub: jsDelivr serves @v1.8.10 at once
gh release create v1.8.10 --title "ARJ 1.8.10" --generate-notes demo/src/pdf/arj-demo.pdf
npm publish                       #   only once the npm account and licence are set up (4, below)
```

Then point the decks at `@v1.8.10` when you're ready to move them on.

---

## 1. The version

```bash
python tools/version.py --write
```

It adds one to the version (year.tenth.change: one more for every change, back to 1 when a new tenth of the year starts), and writes it into `arj/js/deck-start.js`, `package.json`, `demo/index.html` and the readme. Then commit, named by the version. `tools/commit.py` does both, and rebuilds the demo PDF with `--pdf`; it never pushes:

```bash
python tools/commit.py --pdf
```

## 2. The tag

The tag is the version with a `v` in front. `tools/release.py` checks there's nothing uncommitted, tags the last commit with the version in `deck-start.js` (on this computer only), and prints the commands for the rest. By hand, the same:

```bash
git tag -a v1.8.7 -m "ARJ 1.8.7"
git push origin master v1.8.7
```

A tag not yet pushed can be taken off again: `git tag -d v1.8.7`. Once pushed, leave it: others may be using it.

`https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.7/arj/js/deck-start.js` works as soon as the tag is on GitHub.

## 3. The GitHub release

A release is a tag with a page: notes, and files to download. With the [GitHub CLI](https://cli.github.com/):

```bash
gh release create v1.8.7 --title "ARJ 1.8.7" --generate-notes demo/src/pdf/arj-demo.pdf
```

GitHub adds the source as a .zip and a .tar.gz to every release. The demo PDF goes with it so the release shows what ARJ looks like.

## 4. The npm package

Once, an account on [npmjs.com](https://www.npmjs.com/) and:

```bash
npm login
```

Then for each version (after the tag, so the two match):

```bash
npm pack --dry-run    # lists what goes in: package.json, readme.md and arj/ only
npm publish
```

`npm publish` can't be undone after 72 hours, and a version number can never be used twice, even after unpublishing. The name `apocalypse-reveal-js` was free on 3 November 2026.

Before the first `npm publish`: `package.json` has no `license`. npm warns without one, and without a licence nobody else may reuse the code. Pick one (MIT, like reveal.js, is the usual choice) and add `"license": "MIT"` and a `LICENSE` file. ARJ loads tldreveal and tldraw, which keep their own licences (see the readme).

## 5. jsDelivr

Nothing to do: jsDelivr serves every public GitHub tag and every npm version on request. To make it fetch `@master` again at once instead of within a week, open:

```text
https://purge.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@master/arj/js/deck-start.js
```

(one address per file that changed). Fixed versions (`@v1.8.7`, `@1.8.7`) never need purging.

---

## A copy in a deck, ignored by git

A deck can keep its own copy of a version instead of loading it from the internet, for working offline or pinning a version. In the deck's repository, add to its `.gitignore`:

```gitignore
node_modules/
```

then either

```bash
npm install apocalypse-reveal-js@1.8.7                                  # from npm
npm install github:SDevTutors/apocalypse-reveal-js#v1.8.7               # straight from the GitHub tag
```

The files land in `node_modules/apocalypse-reveal-js/arj/`, and npm writes `package.json` and `package-lock.json` in the deck's repository: commit those two, so a fresh clone gets the same version with `npm install`. The deck's page then loads `node_modules/apocalypse-reveal-js/arj/css/arj.css`, `.../arj/js/deck-start.js` and so on, in place of the hosted addresses.

GitHub Pages doesn't run `npm install`, so a deck published there loads ARJ from jsDelivr or GitHub Pages; the copy is for working on it locally.
