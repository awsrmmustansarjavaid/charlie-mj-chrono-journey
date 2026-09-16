# Features

## Live clock
A ticking clock showing the current day, date and time in the primary
journey's timezone, with a 12-hour / 24-hour toggle. A status dot shows
whether the time is internet-verified or falling back to the local device
clock.

## Time since / Time until
Every journey compares its stored moment against "now." If the moment is in
the past, the app shows **Time since**; if it's in the future, it
automatically shows **Time until** instead — the same engine handles both.

## Calendar-accurate breakdown
Years, months and days are computed from real calendar dates (see
[`doc/architecture.md`](architecture.md)), so a journey spanning
February correctly accounts for 28 or 29 days, and one spanning April
correctly accounts for 30.

## Absolute totals
Alongside the calendar breakdown, every journey also shows the same span as
total days, total hours, total minutes and total seconds — useful when you
want the raw number rather than the calendar interpretation.

## Timezone selection
Each journey stores its own IANA timezone (e.g. `Asia/Karachi`,
`America/New_York`). A country dropdown offers a quick default; the
timezone dropdown accepts any zone your browser supports. The selected
zone's current UTC offset (e.g. `UTC+05:00`) is always shown next to it.

## Visual calendar and moment preview
The add/edit form includes a month-grid calendar synced to the date field.
As soon as a date, time and timezone are chosen, a preview line shows the
exact weekday, formatted date/time, UTC offset and day-of-year — so you can
confirm you picked the right moment before saving.

## Today panel
A quick-glance panel: today's weekday, date, day-of-year, week number, days
remaining in the year, current month, current year, and whether it's a leap
year.

## Multiple time journeys
Add as many journeys as you like. Each can be:
- **Favorited** — shown as the large primary counter at the top of the page.
- **Duplicated** — a quick way to create a variant of an existing journey.
- **Edited** — change its title, moment, or timezone at any time.
- **Deleted** — removed permanently (the app always keeps at least one).

## Local persistence
Journeys are saved to `localStorage` automatically. Reloading the page, or
returning days later, keeps everything exactly as you left it.

## Import / export
- **Export** downloads all journeys as `charlie-mj-chrono-journey-counters.json`.
- **Import** reads a previously exported file and adds those journeys to
  your current list — useful for moving between browsers or devices, or for
  keeping a backup.

## Themes
A light and a dark theme, toggled from the header and remembered between
visits.

## Responsive layout
The layout adapts from a single-column mobile view up to a comfortable
desktop width, with touch-friendly controls throughout.
