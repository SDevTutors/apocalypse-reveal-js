"""Version number for ARJ, Apocalypse Reveal-js (the files in arj/).

  python tools/version.py           show the version for today
  python tools/version.py --write   write it into arj/js/deck-start.js,
                                    package.json, the demo (demo/index.html)
                                    and readme.md

A version is year.tenth.day, the same as the decks:
  year   1 for 2026, 2 for 2027 ...
  tenth  which tenth of the year today falls in, 0 to 9 (days 1-36 are 0,
         20 October to 25 November is 8, and so on)
  day    how many days in that tenth have had changes, counting today
So 1.8.3 is the third day of changes between 20 October and 25 November 2026.
Changes are the git commits that touch arj/. Run it before you commit;
running it twice on the same day gives the same number. It never goes
down: if the version already written is higher (this repository's history
starts after ARJ had versions elsewhere), it carries on from that one. Commit messages
start with the version ("1.8.7 split long lists"); it prints the number to
use. A release is tagged with it too (v1.8.7): see docs/publishing.md.

The decks copy this version into their own pages with their own
tools/version.py (reveal-js-html: the generator line).
"""

import datetime, os, re, subprocess, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
FIRST_YEAR = 2026

# arj/ and where its files were before (src/js, src/css), for the days with changes
FILES = ["arj", "src/js", "src/css"]

SWAPS = {
    # file to write: [(pattern, template)]
    "arj/js/deck-start.js": [(r"version: '[^']*', date: '[^']*'", "version: '{v}', date: '{iso}'")],
    "package.json": [(r'("version": ")[^"]*(")', r"\g<1>{v}\g<2>")],
    "demo/index.html": [(r'(<span class="arj-version">)[^<]*(</span>)', r"\g<1>{v}\g<2>")],
    "readme.md": [(r"(- Version: )[0-9.]+", r"\g<1>{v}")],
}


def tenth(day):
    days = 366 if datetime.date(day.year, 12, 31).timetuple().tm_yday == 366 else 365
    return (day.timetuple().tm_yday - 1) * 10 // days


def version(paths, today, last=None, last_date=None):
    """Today's version from the commits; at least one on from last (written
    on last_date), if that is in the same tenth."""
    log = subprocess.run(
        ["git", "log", "--format=%ad", "--date=short", "--"] + paths,
        cwd=ROOT,
        capture_output=True,
        text=True,
    ).stdout.split()
    days = {datetime.date.fromisoformat(d) for d in log}
    days = {d for d in days if d.year == today.year and tenth(d) == tenth(today) and d <= today}
    days.add(today)
    year, part = today.year - FIRST_YEAR + 1, tenth(today)
    day = len(days)
    if last and last.startswith("%d.%d." % (year, part)):
        day = max(day, int(last.split(".")[2]) + (last_date < today))
    return "%d.%d.%d" % (year, part, day)


def written():
    """The version and date in deck-start.js now."""
    text = open(os.path.join(ROOT, "arj/js/deck-start.js"), encoding="utf-8").read()
    found = re.search(r"version: '([^']*)', date: '([^']*)'", text)
    return found.group(1), datetime.date.fromisoformat(found.group(2))


def main(write):
    today = datetime.date.today()
    v = version(FILES, today, *written())
    print("ARJ %s" % v)
    if write:
        for target, pairs in SWAPS.items():
            path = os.path.join(ROOT, target)
            text = open(path, encoding="utf-8", newline="").read()
            for pattern, template in pairs:
                text, n = re.subn(pattern, template.format(v=v, iso=today.isoformat()), text)
                if not n:
                    print("  not found in", target, ":", pattern)
            open(path, "w", encoding="utf-8", newline="").write(text)
    print('Commit messages start with the version: "%s <what changed>"; tag a release v%s' % (v, v))


if __name__ == "__main__":
    main("--write" in sys.argv)
