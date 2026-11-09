@echo off
rem Release ARJ on GitHub as the version in package.json and arj/js/deck-start.js.
rem It shows what it will do and asks before anything goes public. See docs/publishing.md.
cd /d "%~dp0"
python tools\release.py --github
pause
