# sheen.sg

A static site built with HTML, CSS, and plain JavaScript. No build step is required.

- `index.html`: page structure and entry point.
- `css/styles.css`: all page styles, including themes and responsive layouts.
- The inline script in the head of `index.html` applies the saved theme before the page draws, without a separate blocking request. Keep it synchronous and before the stylesheet.
- `js/me.js`: profile, stories, projects, and education data. Featured projects have a `feature` object with their display order, role, short summary, result, and selected technologies; the complete write-up stays alongside it. The CV, GitHub and LinkedIn links are written in `index.html` instead, where search engines read them without running scripts; the GitHub and LinkedIn addresses also appear in its structured data.
- `js/toys.js`: interactive mini demos.
- `js/logos.js`: shared logo lookup and markup helpers.
- `js/app.js`: page rendering and interactions.
- `images/`: local assets grouped by AWS, brands, Devicon, GCP, me (headshot and Apple touch icon), organizations, products, projects, and schools. Raster logos use prebuilt WebP derivatives of the original PNGs, which are retained: lossless, except the BizBook, Distraction Dismantlers and FlowFox project logos, which are lossy WebP (quality 80, 90 and 80) that compare visually identical to their PNGs. Regenerate the matching WebP when editing an original PNG.
- `fonts/`: self-hosted Manrope for headings. It is not loaded from Google Fonts, whose hinted Windows copy flattens the bottoms of letters.
- `cv-sheen.pdf`: the CV the View CV buttons open in a new tab. Replace the file to update it.
- `favicon.ico`: the site icon, cropped from the profile photo. It stays in the root, where browsers look for it on every page, the CV included.
- `local/`: git-ignored notes and the full-size headshot the site photo and icons were cut from. Not published.
- `CNAME` and `.nojekyll`: hosting configuration.

For GitHub Pages, publish the intended branch's root folder (Settings → Pages → Deploy from a branch). Include all site files and WebP assets, configure `sheen.sg`, and enable HTTPS after DNS is verified. No custom build workflow is required. GitHub manages compression and cache headers; `_headers` and `.htaccess` are not Pages configuration.

The scripts at the end of `index.html` load in dependency order: `me.js`, `toys.js`, `logos.js`, then `app.js`.

Image paths in HTML and JavaScript are relative to `index.html`. Any future `url(...)` paths written directly in `css/styles.css` are relative to `css/`, so use `../images/...` there. Data-driven inline style values remain with their rendering code. The stencil mask URLs in `js/app.js` also use `../images/...` because the browser resolves them where `css/styles.css` consumes the custom property.
