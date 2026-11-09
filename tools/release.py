"""Release ARJ on GitHub, as the version written in the files.

  python tools/release.py            show what would happen; changes nothing
  python tools/release.py --github   do it: push, tag, push the tag, make the GitHub release
  release.cmd                        the same as --github, from Windows (double-click or CMD)

The version comes from arj/js/deck-start.js (tools/version.py reads it), and
must match "version" in package.json. With --github it:

  1. checks everything is committed, and that gh is logged in
  2. git push origin master                     the commits
  3. git tag -a v1.8.14 -m "ARJ 1.8.14"         the tag, on this computer
  4. git push origin v1.8.14                    jsDelivr serves @v1.8.14 from now on
  5. gh release create v1.8.14 --title "ARJ 1.8.14" --generate-notes demo/src/pdf/arj-demo.pdf

It asks before step 2. If a step fails it stops; run it again and it skips
what's already done (a tag already made or pushed). It never publishes to
npm: run npm publish yourself (it asks for your two-factor code).
See docs/publishing.md.
"""

import importlib.util
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PDF = "demo/src/pdf/arj-demo.pdf"
RELEASES = "https://github.com/SDevTutors/apocalypse-reveal-js/releases/tag/"


def run(*args):
    """Run a command in this repository; (exit code, output)"""
    done = subprocess.run(list(args), cwd=ROOT, check=False, capture_output=True, text=True)
    return done.returncode, (done.stdout + done.stderr).strip()


def step(text, *args):
    """Run one step, show it, stop if it fails"""
    print("  " + " ".join(a if " " not in a else '"%s"' % a for a in args))
    code, out = run(*args)
    if out:
        print("    " + out.replace("\n", "\n    "))
    if code:
        sys.exit("Stopped: the %s failed. Fix it and run this again; it skips what's done." % text)


def version():
    """The version in deck-start.js, checked against package.json"""
    spec = importlib.util.spec_from_file_location("version", os.path.join(ROOT, "tools", "version.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    v = mod.written()
    with open(os.path.join(ROOT, "package.json"), encoding="utf-8") as f:
        p = json.load(f)["version"]
    if p != v:
        sys.exit("deck-start.js says %s but package.json says %s: run python tools/version.py --write" % (v, p))
    return v


def main():
    """Main method"""
    go = "--github" in sys.argv[1:]
    v = version()
    tag = "v" + v
    title = "ARJ " + v

    if run("git", "status", "--porcelain")[1]:
        sys.exit("Commit everything first (python tools/commit.py --pdf): the release is the last commit")
    branch = run("git", "rev-parse", "--abbrev-ref", "HEAD")[1]
    if branch != "master":
        sys.exit("On %s: releases are made from master" % branch)
    tagged = run("git", "rev-parse", "-q", "--verify", "refs/tags/" + tag)[0] == 0
    if tagged and run("git", "rev-parse", tag + "^{commit}")[1] != run("git", "rev-parse", "HEAD")[1]:
        sys.exit("%s is already a tag on an older commit. A new release needs a new version: python tools/commit.py --pdf" % tag)
    on_github = tag in run("git", "ls-remote", "--tags", "origin", tag)[1]
    has_gh = shutil.which("gh") is not None
    released = has_gh and run("gh", "release", "view", tag)[0] == 0
    pdf = os.path.exists(os.path.join(ROOT, PDF))

    print("Release %s (%s), the version in arj/js/deck-start.js and package.json" % (tag, title))
    print("  tag on this computer: %s; tag on GitHub: %s; GitHub release: %s; demo PDF: %s" % (
        "yes" if tagged else "no", "yes" if on_github else "no", "yes" if released else "no", "yes" if pdf else "no"))
    if released:
        print("Already released: " + RELEASES + tag)
        print("Next: npm publish (if not done yet), then point the decks at @" + tag)
        return
    if not go:
        print()
        print("Nothing changed. To release:  python tools/release.py --github   (or release.cmd)")
        return
    if not has_gh or run("gh", "auth", "status")[0]:
        sys.exit("The GitHub CLI isn't installed or logged in: gh auth login")

    print()
    answer = input("This makes %s public on GitHub; a pushed tag can't be taken back. Type yes to go on: " % tag)
    if answer.strip().lower() != "yes":
        sys.exit("Stopped; nothing changed.")
    step("push", "git", "push", "origin", "master")
    if not tagged:
        step("tag", "git", "tag", "-a", tag, "-m", title)
    if not on_github:
        step("tag push", "git", "push", "origin", tag)
    args = ["gh", "release", "create", tag, "--title", title, "--generate-notes", "--verify-tag"]
    step("GitHub release", *(args + ([PDF] if pdf else [])))

    print()
    print("Released: " + RELEASES + tag)
    print("jsDelivr: https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@%s/arj/js/deck-start.js" % tag)
    print("Next, npm (it asks for your two-factor code):  npm publish")


if __name__ == "__main__":
    main()
