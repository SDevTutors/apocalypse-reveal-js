# Publishing ARJ

ARJ has no build step: the files in `arj/` are the release. Publishing is giving a version a fixed name (a git tag), a page on GitHub (a release), and a package on npm, so decks can load an exact version from jsDelivr or keep a copy of their own.

| Where                 | Address                                                                      | Changes?                         |
|-----------------------|------------------------------------------------------------------------------|----------------------------------|
| GitHub Pages          | `https://sdevtutors.github.io/apocalypse-reveal-js/arj/...`                  | Yes, with every push to `master` |
| jsDelivr, from GitHub | `https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.6/arj/...` | No: a tag never changes          |
| jsDelivr, from npm    | `https://cdn.jsdelivr.net/npm/apocalypse-reveal-js@1.8.6/arj/...`            | No                               |
| A copy in the deck    | `node_modules/apocalypse-reveal-js/arj/...`, ignored by git                  | Only when you install again      |

`@master` (GitHub) and no version (npm) also work on jsDelivr, but they follow the latest, and jsDelivr can take up to a week to catch up.

---

## 1. The version

```bash
python tools/version.py --write
```

It works out today's version (year.tenth.day) from the commits that touch `arj/`, and writes it into `arj/js/deck-start.js`, `package.json` and `demo/index.html`. Commit with the version first:

```bash
git commit -am "1.8.7 split long lists onto new slides"
```

## 2. The tag

The tag is the version with a `v` in front. Tag the commit, then push it:

```bash
git tag -a v1.8.7 -m "ARJ 1.8.7"
git push origin master v1.8.7
```

`https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@v1.8.7/arj/js/deck-start.js` works as soon as the tag is on GitHub.

## 3. The GitHub release

A release is a tag with a page: notes, and files to download. With the [GitHub CLI](https://cli.github.com/):

```bash
gh release create v1.8.7 --title "ARJ 1.8.7" --generate-notes demo/arj-demo.pdf
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
