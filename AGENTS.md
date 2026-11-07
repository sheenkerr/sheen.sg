# sheen.sg

Static personal website using HTML, CSS and plain JavaScript. No build step or runtime
package installation is required. README files are intentionally ignored; this file is
the shared maintenance context and must remain self-contained on a fresh clone.

## Site structure and constraints

- `index.html` contains page structure, public CV/social links and structured data.
  Keep the synchronous theme initialization before the stylesheet to avoid a theme flash.
- `css/styles.css` contains themes and responsive styles.
- `js/me.js` holds profile, projects, stories and education. Featured projects use the
  `feature` property; retain their full write-ups for the reader.
- Load scripts in order: `me.js`, `toys.js`, `logos.js`, `app.js`, `project-motion.js`, `usage.js`.
  The usage script depends on month names supplied by `app.js`.
- `js/project-motion.js` plays the FlowFox and Virtual Vault diagram panels once in view
  using the Web Animations API. Their markup in `app.js` is the final, static frame.
- `js/story-motion.js` (async, right after `app.js`, `data-mount="home"`) swaps the Stripe, LLM and
  formulas story covers and animates the PeerPrep panel. `css/story-motion.css` loads as a
  `media="print"` link and the script enables it as it mounts; until then, or if either fails, the
  original drawings stay. GSAP (`js/vendor/gsap.min.js`) is fetched only after page load for a
  diagram near the screen, or on Replay; one already on screen then plays once sufficiently in view. The original sign-up story drawing stays static.
- `images/` holds public assets. Regenerate matching WebP derivatives when changing
  source PNG logos. Fonts are self-hosted; preserve the local Manrope files.
- `poker.html` is standalone (inline CSS/JS, embedded fonts with licences at the end). It prints as exactly two
  A4 landscape pages, [front|front] then [back|back], each copy zoomed to an A5 half for cutting.
- `cv-sheen.pdf` is the linked CV. `favicon.ico` stays at the repository root.
- HTML/JS image paths resolve relative to `index.html`; CSS URLs resolve relative to
  `css/styles.css`. Stencil mask paths in `app.js` are consumed through CSS and use `../images/`.
- Hosting uses GitHub Pages with the branch root, `CNAME` and `.nojekyll`.
  There is no custom build workflow; `_headers` and `.htaccess` do not configure Pages.

## Token usage: manual updates from two computers

The user wants manual imports, one cumulative history, and one small public aggregate
JSON. One PC publishes and receives cache copies from the other PC. Antigravity was
already imported and is unlikely to need another refresh. Do not introduce scheduled
imports or scan Antigravity during ordinary T3 updates.

`tools/usage/` (import scripts, wrapper and tests) is intentionally gitignored and kept
only on this machine. The user does not want script backups; do not create them. A fresh
clone will contain the public usage display and aggregate JSON but no importer or private
archive. The website works without the importer. Run the commands below only where the
local tooling exists; it is not a build or deployment dependency.

- Refresh T3 Code's Usage screen on both PCs before importing. Selecting 90 days does
  not guarantee that old source transcripts still exist; import before source cleanup.
- This PC's cache is read automatically from
  `%USERPROFILE%\.t3\userdata\usage-scan-cache-v11.json`, falling back to v10 when v11
  is absent. Both schemas are supported; prefer v11 after refreshing T3 Usage. The v10 file
  may be a stale legacy cache retained by T3. A manual local copy can use
  `local/usage-imports/this-pc.json`; source and copy deduplicate on import.
- Copy the other PC's corresponding cache as `local/usage-imports/other-pc.json`,
  replacing the previous copy after its import. Never overwrite this PC's native cache
  with the other PC's file. The helper also discovers `other-pc*.json` in Downloads,
  Desktop, OneDrive/Desktop and drive roots, choosing by newest usage timestamp.
- Run `tools\usage\update-usage.cmd`, or
  `python tools/usage/update_usage.py --no-publish` for a local update without a publish prompt.
  The normal helper offers to commit only `data/usage.json` and push after an explicit yes;
  it requires `js/usage.js` to be tracked before offering publication.
- `tools/usage/export_usage.py` merges T3 records into the private archive and generates
  `data/usage.json`; `js/usage.js` fetches only this public aggregate. Do not edit the output
  manually or replace it with an input cache. Bare exporter imports this PC's cache plus
  top-level JSON files in `local/usage-imports/`; explicit cache arguments select inputs.
- `local/usage-archive/archive.json` (schema v2) is the cumulative record store.
  `local/usage-archive/snapshots/` contains recovery inputs. Both are gitignored and need
  a separate private backup. A fresh clone does not contain historical usage records.
  `data/usage.json` cannot reconstruct record identities or replace this backup.
- Rebuild with `python tools/usage/export_usage.py --rebuild` only when recovery or an
  intentional reprocess is needed. It uses saved T3 caches and Antigravity record snapshots.
  Preserve these snapshots; do not treat them as disposable duplicate data.
- Normal imports retain archived Antigravity usage without opening conversation databases.
  Only `--refresh-antigravity` copies/scans the default sources. Exporter
  `--antigravity FOLDER` explicitly scans selected folders. Reader logic is in `antigravity.py`.
  Other-PC databases belong under `local/usage-imports/other-pc-antigravity/`, preserving
  subfolders. Close Antigravity before copying; keep DB/WAL pairs together and replace
  the carried folder rather than merging stale WAL files into a new copy.
- Antigravity source roots: `~/.gemini/antigravity{,-cli,-ide,-backup}`,
  `~/.config/antigravity`, and `~/.t3/userdata/providers/antigravity/*/antigravity-acp`.
  Use each root's `conversations/` subfolder when present, otherwise the root itself.
- Public data uses Singapore dates and aggregates Claude Code, Codex and Antigravity by
  day, model and category. Categories are uncached input, cache reads, cache writes and
  output; reasoning is already part of output. Never publish paths, identifiers, machine
  names or conversation content. Keep totals reconciling across all breakdowns.
- Known limitations: the helper chooses only one discovered other-PC cache, so explicitly
  import all files when recovering multiple historical exports. Corrections rely on source
  modification times; changed event identities can evade deduplication. Missing archives
  currently start empty: restore/rebuild before importing if historical data is expected.

## Validation and private files

- For local importer changes, when `tools/usage/` exists:
  `python -B -m unittest discover -s tools/usage`.
- For frontend JS changes: `node --check js/usage.js` (and other edited scripts).
  Check relevant responsive layouts and interactions for visual changes.
- Run `git diff --check` before handing back changes.
- `local/` is private and excluded from Git. Its original headshot is useful for regenerating
  crops; DNS notes and the project layout checker are optional local tools. Old performance
  harnesses/reports were removed. Do not depend on them or recreate audit clutter by default.
