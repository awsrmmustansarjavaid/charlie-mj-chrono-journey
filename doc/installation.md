# Installation

charlie-mj-chrono-journey is a static site: there is no build step, no package manager,
and no server-side code required.

## Option 1 — Open it directly

Download or clone the repository, then open `index.html` in a browser:

```bash
git clone https://github.com/awsrmmustansarjavaid/charlie-mj-chrono-journey.git
cd charlie-mj-chrono-journey
```

Double-click `index.html`, or open it via your browser's **File → Open**
menu. Everything works, including localStorage persistence.

> Note: some browsers restrict `fetch()` on `file://` pages for security
> reasons, which can prevent the internet-time lookup from succeeding. If
> that happens, the app automatically falls back to your device's clock and
> shows "Using this device's clock" — nothing else is affected. Serving the
> folder locally (Option 2) avoids this entirely.

## Option 2 — Serve it locally

Any static file server works. For example, with Python:

```bash
cd charlie-mj-chrono-journey
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

Or with Node.js (using `npx serve`, no install required):

```bash
cd charlie-mj-chrono-journey
npx serve .
```

## Option 3 — Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select
   `main` and the root folder (`/`).
4. Save. GitHub will publish the site at
   `https://awsrmmustansarjavaid.github.io/charlie-mj-chrono-journey/` within a minute or
   two.

## Requirements

- Any modern browser (Chrome, Firefox, Safari, Edge). charlie-mj-chrono-journey uses
  `Intl.DateTimeFormat`, `fetch()`, and `localStorage`, all of which are
  supported by current browser versions.
- An internet connection is used once, at load time, to fetch an
  authoritative timestamp. It is not required for the app to function —
  without it, charlie-mj-chrono-journey simply uses your device's clock instead.
