# 📌 Project Name: charlie-mj-chrono-journey

# 🚀 Live Demo

> 🌐 **Try the project live:**
> **[👉 Open Live Demo](https://awsrmmustansarjavaid.github.io/charlie-mj-chrono-journey/)**

---

**Track the exact time elapsed between any moment and now.**

charlie-mj-chrono-journey is a frontend-only web app that measures the precise years,
months, days, hours, minutes and seconds between a moment you choose and the
current time — verified against an internet time source, not just your
device's clock. Give a moment a title, pick its timezone, and watch it tick.
Keep as many of these "time journeys" as you like.

> Example: something happened on **24 March 2023, 01:01:00 AM** (Asia/Karachi).
> As of **16 September 2026, 12:38 PM**, charlie-mj-chrono-journey reports:
> **3 Years · 5 Months · 23 Days · 11 Hours · 37 Minutes · 00 Seconds.**

---

## Features

- **Time since / Time until** — pick any past or future moment; the app
  automatically labels it correctly and switches direction.
- **Calendar-accurate breakdown** — years/months/days are computed from real
  calendar dates (respecting month lengths and leap years), not a flat
  `seconds ÷ 365` estimate.
- **Absolute totals** — the same duration shown as total days, hours,
  minutes and seconds.
- **Internet-verified time** — the current instant is fetched from a public
  time API once per session and kept in sync locally; the app clearly shows
  whether it's using internet time or falling back to your device's clock.
- **Timezone-aware** — every journey remembers its own IANA timezone
  (e.g. `Asia/Karachi`), so the math is correct regardless of where the
  moment happened or where you're viewing it from.
- **Live clock, calendar and day-of-week** — a ticking clock and a visual
  month calendar; selecting a date shows its weekday, UTC offset and day of
  year before you save it.
- **Multiple time journeys** — add, edit, duplicate, favorite and delete as
  many counters as you want; the favorited one becomes the primary hero
  counter at the top.
- **Today panel** — day of week, day of year, week number, days left in the
  year, and whether it's a leap year.
- **Saved locally** — journeys persist in `localStorage`; no account, no
  server, no tracking.
- **Import / export** — back up your journeys to a JSON file, or move them
  to another browser.
- **Light and dark themes**, fully responsive from desktop to mobile.

## Live example (from the brief)

| | |
|---|---|
| Start | 24 March 2023, 01:01:00 AM — Asia/Karachi (UTC+05:00) |
| Now (example) | 16 September 2026, 12:38:00 PM — Asia/Karachi |
| Result | 3 Years, 5 Months, 23 Days, 11 Hours, 37 Minutes |

## Project structure

```text
charlie-mj-chrono-journey/
├── index.html                 # Single entry point
├── app/
│   ├── css/
│   │   ├── style.css          # Design tokens, layout, components
│   │   ├── animations.css     # The one deliberate background motion + micro-interactions
│   │   └── responsive.css     # Breakpoints
│   ├── js/
│   │   ├── time-api.js        # Internet time fetch + local-clock fallback
│   │   ├── timezone.js        # Country/IANA list + timezone-safe date math
│   │   ├── duration.js        # Calendar-accurate breakdown + absolute totals
│   │   ├── calendar.js        # Visual month-grid calendar widget
│   │   ├── clock.js           # Live clock rendering
│   │   ├── storage.js         # localStorage persistence + import/export
│   │   └── app.js             # Main controller — wires everything together
│   └── bootstrap/             # (optional) place a vendored copy of Bootstrap here;
│                               #  by default index.html loads Bootstrap from a CDN
├── doc/
│   ├── architecture.md
│   ├── features.md
│   ├── installation.md
│   ├── usage.md
│   ├── timezone.md
│   └── development.md
├── assets/
│   ├── icons/
│   └── images/
├── .gitignore
├── LICENSE
└── README.md
```

## Installation

No build step, no dependencies to install. See [`doc/installation.md`](doc/installation.md)
for details — the short version:

```bash
git clone https://github.com/awsrmmustansarjavaid/charlie-mj-chrono-journey.git
cd charlie-mj-chrono-journey
# open index.html directly, or serve it locally:
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Usage

See [`doc/usage.md`](doc/usage.md) for a full walkthrough of adding, editing
and managing time journeys.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root folder.
3. Your app will be live at `https://awsrmmustansarjavaid.github.io/charlie-mj-chrono-journey/`.

Everything is static — no server-side code is required.

## Technology

- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 (layout, modal) + Bootstrap Icons
- Browser APIs: `Intl.DateTimeFormat`, `Date`, `localStorage`, `fetch()`
- A public time API for internet-verified time, with automatic fallback to
  the local device clock

## License

Released under the [MIT License](LICENSE).
