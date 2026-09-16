# Usage

## Your first journey

The app starts with one example journey already filled in:

- **Title:** My time journey
- **Moment:** 24 March 2023, 01:01:00 AM
- **Timezone:** Asia/Karachi (UTC+05:00)

This is shown as the large **primary** counter at the top of the page,
along with the live clock, the start/current moment cards, and the total
duration in days/hours/minutes/seconds.

## Editing the primary journey

Click **Edit** on the hero plate, or open any journey's edit button from the
list below it, to change its title, date, time or timezone.

## Adding a new journey

1. Click **Add journey**.
2. Give it a **title** — this is what appears on its card.
3. Choose a **country** (fills in a sensible default timezone) and/or a
   specific **timezone**.
4. Pick a **date** either by typing it or clicking a day on the calendar
   below the form — the two stay in sync.
5. Pick a **time** (hours, minutes, seconds).
6. Check the **selected moment** preview line to confirm the weekday, date,
   time, UTC offset and day-of-year are what you expect.
7. Optionally tick **"Show as the primary journey at the top"** to make this
   the hero counter.
8. Click **Save journey**.

The new journey immediately starts counting, and is added to the list.

## Managing journeys

Each row in **Your time journeys** has four actions:

| Icon | Action |
|---|---|
| ★ | Favorite — promotes this journey to the primary hero counter |
| ⧉ | Duplicate — creates a copy you can then tweak |
| ✎ | Edit — change its title, moment, or timezone |
| 🗑 | Delete — remove it permanently (at least one journey is always kept) |

## Time since vs. time until

You don't need to tell charlie-mj-chrono-journey whether a moment is in the past or the
future — it works either way:

- A moment **before** now is shown as **Time since**, counting up.
- A moment **after** now is shown as **Time until**, counting down.

## Backing up your journeys

- Click **Export** to download all of your journeys as a JSON file
  (`charlie-mj-chrono-journey-counters.json`).
- Click **Import** and choose a previously exported file to add those
  journeys back — for example, after clearing your browser data, or on a
  different device.

## Switching themes

Use the moon/sun icon in the header to switch between dark and light
themes. Your choice is remembered on your next visit.
