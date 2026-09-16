# Architecture

charlie-mj-chrono-journey is a static, client-only application. There is no backend and
no build step — `index.html` loads a handful of plain JavaScript modules
that each own one responsibility.

```text
index.html
   │
   ├── app/css/*.css            (presentation)
   │
   └── app/js/  (loaded in this order — each depends on the ones before it)
         │
         ├── time-api.js   →  CJ.time       (authoritative "now")
         ├── timezone.js   →  CJ.timezone   (IANA-safe date math)
         ├── duration.js   →  CJ.duration   (calendar-accurate diffing)
         ├── calendar.js   →  CJ.calendar   (visual month picker)
         ├── clock.js      →  CJ.clock      (live clock rendering)
         ├── storage.js    →  CJ.storage    (localStorage + import/export)
         └── app.js        →  wires it all together, owns the DOM
```

All modules attach themselves to a single shared `window.CJ` namespace
instead of using ES module imports, so the app can be opened directly as a
file (`file://index.html`) without a bundler or a local server, and so
`index.html` stays simple `<script src="...">` tags.

## Data flow, once per second

```text
CJ.time.nowMs()
      │  (authoritative epoch ms: internet time + measured drift,
      │   or the device clock if the internet lookup failed)
      ▼
CJ.timezone.wallClockIn(zone, epochMs)
      │  (what the calendar/clock reads in a specific IANA timezone)
      ▼
CJ.duration.diffJourney(startUtcMs, nowMs, zone)
      │  (years/months/days/hours/minutes/seconds + absolute totals)
      ▼
app.js renders:
      ├── the hero plate (primary/favorited journey)
      ├── the "Today" plate
      └── the journeys list (every other saved journey)
```

## Why timezone math is centralized in `timezone.js`

JavaScript's built-in `Date` object always represents a single instant in
UTC internally; it does not carry a timezone. To let each journey remember
"this moment happened in `Asia/Karachi`" and calculate correctly regardless
of the visitor's own timezone, charlie-mj-chrono-journey never asks `Date` to do
timezone conversion itself. Instead:

- `zonedTimeToUtc(y, m, d, h, mi, s, zone)` converts a wall-clock date/time
  *as typed by someone looking at `zone`* into a true UTC epoch value, using
  the browser's own `Intl` engine (which already knows every zone's DST
  rules) to measure that zone's offset.
- `wallClockIn(zone, epochMs)` does the reverse: given a true instant, it
  asks `Intl.DateTimeFormat` to format it in `zone` and returns the
  individual year/month/day/hour/minute/second/weekday fields.
- `duration.js` then does ordinary calendar arithmetic (borrowing days from
  the previous month, months from the previous year, etc.) purely on those
  field values — the same way a person would count on a calendar.

This keeps the app correct for any timezone without shipping a timezone
database of its own.

## State

The only persisted state is the list of "journeys" (see
[`doc/usage.md`](usage.md)), stored as JSON under one `localStorage` key.
There is no server, no accounts, and no analytics.
