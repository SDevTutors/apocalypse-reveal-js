"""Version number for ARJ, Apocalypse Reveal-js (the files in arj/).

  python tools/version.py           show the next version
  python tools/version.py --write   write it into arj/js/deck-start.js,
                                    package.json, the demo (demo/index.html)
                                    and readme.md

A version is year.tenth.change, the same as the decks:
  year    1 for 2026, 2 for 2027 ...
  tenth   which tenth of the year today falls in, 0 to 9 (days 1-36 are 0,
          20 October to 25 November is 8, and so on): about every 36 days
  change  one more for every change to ARJ, back to 1 when a new tenth starts
So 1.8.12 is the twelfth change between 20 October and 25 November 2026, and
the next tenth starts at 1.9.1. Each --write is one change: run it once for
each change, before you commit (running it twice counts two). The number is
worked out from the version already in deck-start.js, so it never goes down.
Commit messages start with the version ("1.8.12 split long lists"); it prints
the number to use. A release is tagged with it too (v1.8.12): see
docs/publishing.md.

The decks copy this version into their own pages with their own
tools/version.py (reveal-js-html: the generator line).
"""

import datetime
import os
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
FIRST_YEAR = 2026

SWAPS = {
    # file to write: [(pattern, template)]
    "arj/js/deck-start.js": [
        (r"version: '[^']*', date: '[^']*'", "version: '{v}', date: '{iso}'")
    ],
    "package.json": [(r'("version": ")[^"]*(")', r"\g<1>{v}\g<2>")],
    "demo/index.html": [
        (r'(<span class="arj-version">)[^<]*(</span>)', r"\g<1>{v}\g<2>")
    ],
    "readme.md": [(r"(- Version: )[0-9.]+", r"\g<1>{v}")],
}


def tenth(day):
    days = 366 if datetime.date(day.year, 12, 31).timetuple().tm_yday == 366 else 365
    return (day.timetuple().tm_yday - 1) * 10 // days


def version(today, last=None):
    """The next version after last: one more change in this tenth, or the
    first change of a new one."""
    year, part = today.year - FIRST_YEAR + 1, tenth(today)
    if last and last.startswith("%d.%d." % (year, part)):
        return "%d.%d.%d" % (year, part, int(last.split(".")[2]) + 1)
    return "%d.%d.1" % (year, part)


def written():
    """The version and date in deck-start.js now."""
    text = open(os.path.join(ROOT, "arj/js/deck-start.js"), encoding="utf-8").read()
    found = re.search(r"version: '([^']*)', date: '([^']*)'", text)
    return found.group(1)


def main(write):
    """Main method"""
    today = datetime.date.today()
    v = version(today, written())
    print("ARJ %s" % v)
    if write:
        for target, pairs in SWAPS.items():
            path = os.path.join(ROOT, target)
            text = open(path, encoding="utf-8", newline="").read()
            for pattern, template in pairs:
                text, n = re.subn(
                    pattern, template.format(v=v, iso=today.isoformat()), text
                )
                if not n:
                    print("  not found in", target, ":", pattern)
            open(path, "w", encoding="utf-8", newline="").write(text)
    print(
        'Commit messages start with the version: "%s <what changed>"; tag a release v%s'
        % (v, v)
    )


if __name__ == "__main__":
    main("--write" in sys.argv)
