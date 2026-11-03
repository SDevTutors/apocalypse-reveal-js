"""Rebuild the demo's PDF after a change: the print version (?print-pdf),
one slide a page, saved where the demo's "Download as PDF" points.

  python tools/build_pdf.py        every deck in DECKS (the demo)
  python tools/build_pdf.py demo   just that one

Serves this repository on this computer on a free port (as tools/serve.py
does), then has Microsoft Edge (or Chrome: set BROWSER to its path) print
each deck with tools/print_pdf.mjs, which needs Node 22 or later. The demo
loads ARJ from this repository (../arj/), so the PDF has every change.

Run tools/version.py --write first, so the PDF's title slide has the new
version; tools/commit.py --pdf does both, then commits.
"""

import functools
import http.server
import os
import subprocess
import sys
import threading

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# deck name: (its folder, the PDF), relative to ROOT
DECKS = {
    "demo": ("demo/", "demo/src/pdf/arj-demo.pdf"),
}


class Handler(http.server.SimpleHTTPRequestHandler):
    """This repository, never from the browser's cache"""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # quiet: print_pdf.mjs reports each deck


def build(names):
    """Print each deck named to its PDF; returns how many failed"""
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Handler, directory=ROOT)
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]
    failed = 0
    try:
        for name in names:
            folder, pdf = DECKS[name]
            url = "http://localhost:%d/%s?print-pdf" % (port, folder)
            os.makedirs(os.path.dirname(os.path.join(ROOT, pdf)), exist_ok=True)
            done = subprocess.run(
                ["node", os.path.join(ROOT, "tools", "print_pdf.mjs"), url, os.path.join(ROOT, pdf)],
                check=False,
            )
            if done.returncode:
                print("  failed:", name)
                failed += 1
    finally:
        server.shutdown()
    return failed


def main(args):
    """Main method"""
    names = [a for a in args if not a.startswith("--")] or list(DECKS)
    unknown = [n for n in names if n not in DECKS]
    if unknown:
        sys.exit("No deck called %s: one of %s" % (", ".join(unknown), ", ".join(DECKS)))
    sys.exit(1 if build(names) else 0)


if __name__ == "__main__":
    main(sys.argv[1:])
