# Development

## Project philosophy

- **No build step.** Plain HTML/CSS/JS, loaded directly by the browser.
  This keeps the project approachable and trivially deployable to GitHub
  Pages.
- **One responsibility per file.** Each script in `app/js/` owns a single
  concern (time source, timezone math, duration math, calendar UI, clock
  UI, storage, or the main controller) and exposes its public API on the
  shared `window.CJ` namespace.
- **No timezone database dependency.** Timezone-aware math relies entirely
  on the browser's built-in `Intl` API rather than a bundled IANA database,
  keeping the app small and dependency-free.

## Local development

Serve the folder with any static server (see
[`doc/installation.md`](installation.md)) and edit files directly — there is
nothing to recompile. Refresh the browser to see changes.

## Code map

| File | Responsibility |
|---|---|
| `app/js/time-api.js` | Fetches an authoritative timestamp once, measures drift from the device clock, and exposes `CJ.time.nowMs()` / `CJ.time.now()`. Falls back to the device clock if the network call fails. |
| `app/js/timezone.js` | Country/IANA timezone list; `zonedTimeToUtc`, `wallClockIn`, `getOffsetMinutes`, `formatOffset`. |
| `app/js/duration.js` | `calendarBreakdown` (Y/M/D/H/M/S arithmetic), `diffJourney` (direction + breakdown + totals), day-of-year / week-of-year / leap-year helpers. |
| `app/js/calendar.js` | A dependency-free month-grid calendar widget used inside the modal. |
| `app/js/clock.js` | Renders the live clock plate and its 12h/24h toggle. |
| `app/js/storage.js` | `localStorage` persistence plus JSON export/import. |
| `app/js/app.js` | Bootstraps journeys, renders the hero/today/list sections, and wires up all UI interactions. |

## Adding a new feature

1. Decide which existing module it belongs to (or whether it needs a new
   one) based on the responsibilities above.
2. If it needs new state on a journey object, extend the shape documented
   at the top of `app/js/storage.js` and update `app.js`'s
   `openModal` / `saveJourneyFromModal` accordingly.
3. If it touches design, keep to the existing tokens in
   `app/css/style.css` (`--bg-deep`, `--brass`, `--ink`, etc.) rather than
   introducing new one-off colors.

## Testing the date math

The duration and timezone logic is pure functions with no DOM dependency,
so it can be exercised directly in Node for quick sanity checks, e.g.:

```bash
node -e "
global.window = global;
require('./app/js/timezone.js');
require('./app/js/duration.js');
const CJ = global.CJ;
const start = CJ.timezone.zonedTimeToUtc(2023,3,24,1,1,0,'Asia/Karachi');
const now   = CJ.timezone.zonedTimeToUtc(2026,9,16,12,38,0,'Asia/Karachi');
console.log(CJ.duration.diffJourney(start, now, 'Asia/Karachi'));
"
```

## Contributing

Keep pull requests focused on one feature or fix at a time, and add
comments explaining *why*, not just *what*, for any non-obvious date/time
logic — timezone bugs are easy to introduce and hard to spot in review.
