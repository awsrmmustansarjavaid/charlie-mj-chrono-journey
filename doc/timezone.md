# Timezone handling

## Why IANA identifiers, not just "UTC+05:00"

charlie-mj-chrono-journey stores each journey's timezone as an **IANA timezone
identifier** (e.g. `Asia/Karachi`, `America/New_York`, `Europe/London`)
rather than a fixed offset like `UTC+05:00`. This matters because:

- A fixed offset (`UTC+05:00`) doesn't say **which region**, so it can't
  account for that region observing Daylight Saving Time.
- An IANA identifier (`America/New_York`) refers to a real place with a
  known, historically accurate set of rules for its offset — including any
  DST transitions — so the same journey stays correct across a DST change
  without anyone having to update it.

Pakistan does not currently observe Daylight Saving Time, so
`Asia/Karachi` stays at a constant `UTC+05:00` year-round — but the app
handles zones that do observe DST identically, with no special-casing.

## How the offset is shown

Next to every timezone, charlie-mj-chrono-journey shows the zone's **current** UTC
offset, computed live via `Intl.DateTimeFormat`, formatted as `UTC±HH:MM`
(for example `UTC+05:00`, `UTC-04:00`, `UTC+05:30`).

## How "now" and a saved moment are compared correctly

See [`doc/architecture.md`](architecture.md) for the full data flow. In
short: both the saved moment and the current instant are converted into
"wall clock" year/month/day/hour/minute/second values *as seen from the
journey's own timezone*, and only then compared using ordinary calendar
arithmetic. This means a journey created for `Asia/Karachi` will always
report the same years/months/days breakdown, no matter what timezone the
person viewing the page happens to be in.

## Adding a timezone that isn't in the country list

The **Timezone** dropdown in the add/edit form lists every IANA zone your
browser supports (via `Intl.supportedValuesOf('timeZone')`), so you are
never limited to the curated country shortcuts — pick any specific zone
directly if you need one that isn't in the country list.
