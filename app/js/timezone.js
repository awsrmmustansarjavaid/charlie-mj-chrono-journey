/**
 * app/js/timezone.js
 * ---------------------------------------------------------------------------
 * Everything related to timezones: a curated country -> IANA list for the
 * dropdowns, and small pure-function helpers that let the rest of the app
 * treat "a date/time typed in a specific timezone" correctly, without
 * pulling in a date library.
 *
 * The trick used throughout: the browser's Intl API already knows how to
 * format any instant in any IANA zone (including DST rules). We lean on
 * that instead of hand-rolling timezone tables.
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});

  // A practical subset of countries -> primary IANA timezone. Not
  // exhaustive, but covers the common cases; the timezone <select> also
  // accepts any IANA id supported by the browser via Intl.supportedValuesOf.
  const COUNTRY_TIMEZONES = [
    { country: "Pakistan", zone: "Asia/Karachi" },
    { country: "India", zone: "Asia/Kolkata" },
    { country: "Bangladesh", zone: "Asia/Dhaka" },
    { country: "United Arab Emirates", zone: "Asia/Dubai" },
    { country: "Saudi Arabia", zone: "Asia/Riyadh" },
    { country: "United Kingdom", zone: "Europe/London" },
    { country: "Ireland", zone: "Europe/Dublin" },
    { country: "Germany", zone: "Europe/Berlin" },
    { country: "France", zone: "Europe/Paris" },
    { country: "Spain", zone: "Europe/Madrid" },
    { country: "Italy", zone: "Europe/Rome" },
    { country: "Turkey", zone: "Europe/Istanbul" },
    { country: "Russia (Moscow)", zone: "Europe/Moscow" },
    { country: "United States (Eastern)", zone: "America/New_York" },
    { country: "United States (Central)", zone: "America/Chicago" },
    { country: "United States (Mountain)", zone: "America/Denver" },
    { country: "United States (Pacific)", zone: "America/Los_Angeles" },
    { country: "Canada (Eastern)", zone: "America/Toronto" },
    { country: "Mexico", zone: "America/Mexico_City" },
    { country: "Brazil", zone: "America/Sao_Paulo" },
    { country: "Argentina", zone: "America/Argentina/Buenos_Aires" },
    { country: "South Africa", zone: "Africa/Johannesburg" },
    { country: "Egypt", zone: "Africa/Cairo" },
    { country: "Nigeria", zone: "Africa/Lagos" },
    { country: "China", zone: "Asia/Shanghai" },
    { country: "Japan", zone: "Asia/Tokyo" },
    { country: "South Korea", zone: "Asia/Seoul" },
    { country: "Singapore", zone: "Asia/Singapore" },
    { country: "Malaysia", zone: "Asia/Kuala_Lumpur" },
    { country: "Indonesia (Jakarta)", zone: "Asia/Jakarta" },
    { country: "Thailand", zone: "Asia/Bangkok" },
    { country: "Philippines", zone: "Asia/Manila" },
    { country: "Australia (Sydney)", zone: "Australia/Sydney" },
    { country: "New Zealand", zone: "Pacific/Auckland" },
    { country: "UTC", zone: "Etc/UTC" },
  ];

  /**
   * Returns the UTC offset, in minutes, of `timeZone` at the instant
   * `date`. Positive means "ahead of UTC" (matches Pakistan's +300).
   * Uses the Intl engine's own DST knowledge rather than a static table.
   */
  function getOffsetMinutes(timeZone, date) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(date).reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
    // Midnight can come back as hour "24" in some engines; normalise it.
    const hour = parts.hour === "24" ? 0 : Number(parts.hour);
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      hour,
      Number(parts.minute),
      Number(parts.second)
    );
    return Math.round((asUtc - date.getTime()) / 60000);
  }

  /** Formats a minute offset as "UTC+05:00" / "UTC-04:30". */
  function formatOffset(offsetMinutes) {
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `UTC${sign}${hh}:${mm}`;
  }

  /**
   * Converts a wall-clock date/time that a person *typed while looking at*
   * `timeZone` into a true UTC epoch millisecond value. Two passes handle
   * the (rare) DST-transition edge case.
   */
  function zonedTimeToUtc(y, m, d, h, mi, s, timeZone) {
    const guess = Date.UTC(y, m - 1, d, h, mi, s || 0);
    let offset = getOffsetMinutes(timeZone, new Date(guess));
    let utc = guess - offset * 60000;
    offset = getOffsetMinutes(timeZone, new Date(utc));
    utc = guess - offset * 60000;
    return utc;
  }

  /**
   * Given a true instant (epoch ms), returns a plain object with the wall
   * clock date/time *as seen from* `timeZone` — y/m/d/h/mi/s and weekday.
   * This is only used for calendar-accurate arithmetic (duration.js); it is
   * intentionally NOT a real Date-with-timezone, just a bag of numbers.
   */
  function wallClockIn(timeZone, epochMs) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(new Date(epochMs)).reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: parts.hour === "24" ? 0 : Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second),
      weekday: parts.weekday,
    };
  }

  CJ.timezone = {
    COUNTRY_TIMEZONES,
    getOffsetMinutes,
    formatOffset,
    zonedTimeToUtc,
    wallClockIn,
  };
})(window);
