"""Tag a release of ARJ, on this computer only, and print the rest to do.

  python tools/release.py

Checks that everything is committed, then tags the last commit with the
version in arj/js/deck-start.js: v1.8.9, "ARJ 1.8.9". It never pushes:
it prints the commands that put the tag on GitHub (after which jsDelivr
serves @v1.8.9), make the GitHub release and publish to npm. Until the tag
is pushed it can be taken off again with  git tag -d v1.8.9.
See docs/publishing.md.
"""

import importlib.util
import os
import subprocess
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


def git(*args):
    """Run git in this repository; its output"""
    done = subprocess.run(["git"] + list(args), cwd=ROOT, check=False, capture_output=True, text=True)
    return done.returncode, done.stdout.strip()


def main():
    """Main method"""
    spec = importlib.util.spec_from_file_location("version", os.path.join(ROOT, "tools", "version.py"))
    version = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(version)
    v = version.written()
    tag = "v" + v

    if git("status", "--porcelain")[1]:
        sys.exit("Commit everything first (python tools/commit.py): the tag marks the last commit")
    if git("rev-parse", "-q", "--verify", "refs/tags/" + tag)[0] == 0:
        sys.exit("%s is already tagged. A new release needs a new version: python tools/commit.py" % tag)
    code, out = git("tag", "-a", tag, "-m", "ARJ " + v)
    if code:
        sys.exit(out or "git tag failed")

    print("Tagged %s on this computer; nothing pushed. Then:" % tag)
    print()
    print("  git push origin master %s" % tag)
    print('  gh release create %s --title "ARJ %s" --generate-notes demo/src/pdf/arj-demo.pdf' % (tag, v))
    print("  npm publish          # once the npm account and licence are set up")
    print()
    print("Decks then load https://cdn.jsdelivr.net/gh/SDevTutors/apocalypse-reveal-js@%s/arj/..." % tag)
    print("To take the tag off before pushing:  git tag -d %s" % tag)


if __name__ == "__main__":
    main()
