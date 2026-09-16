/**
 * app/js/duration.js
 * ---------------------------------------------------------------------------
 * Turns two instants into the numbers people actually want to read:
 *   - a calendar-accurate breakdown (years, months, days, hours, minutes,
 *     seconds) that respects real month lengths and leap years, computed
 *     from the *wall clock* in the journey's chosen timezone; and
 *   - absolute totals (total days / hours / minutes / seconds) computed
 *     from the true elapsed time between the two instants.
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});

  /**
   * Calendar-accurate difference between two wall-clock objects
   * ({year, month, day, hour, minute, second}), always returned as a
   * positive breakdown. `earlier` must be chronologically before `later`
   * in wall-clock terms for the numbers to mean what their labels say.
   */
  function calendarBreakdown(earlier, later) {
    let years = later.year - earlier.year;
    let months = later.month - earlier.month;
    let days = later.day - earlier.day;
    let hours = later.hour - earlier.hour;
    let minutes = later.minute - earlier.minute;
    let seconds = later.second - earlier.second;

    if (seconds < 0) { seconds += 60; minutes -= 1; }
    if (minutes < 0) { minutes += 60; hours -= 1; }
    if (hours < 0) { hours += 24; days -= 1; }
    if (days < 0) {
      // Days in the month immediately before `later`'s month/year.
      const prevMonthLastDay = new Date(later.year, later.month - 1, 0).getDate();
      days += prevMonthLastDay;
      months -= 1;
    }
    if (months < 0) { months += 12; years -= 1; }

    return { years, months, days, hours, minutes, seconds };
  }

  /**
   * Full result for a journey: given the true UTC epoch of the start
   * moment, the true UTC epoch of "now", and the journey's timezone,
   * returns direction, calendar breakdown, and absolute totals.
   */
  function diffJourney(startUtcMs, nowUtcMs, timeZone) {
    const isFuture = startUtcMs > nowUtcMs;
    const earlierMs = isFuture ? nowUtcMs : startUtcMs;
    const laterMs = isFuture ? startUtcMs : nowUtcMs;

    const earlierWall = CJ.timezone.wallClockIn(timeZone, earlierMs);
    const laterWall = CJ.timezone.wallClockIn(timeZone, laterMs);
    const breakdown = calendarBreakdown(earlierWall, laterWall);

    const totalMs = laterMs - earlierMs;
    const totalSeconds = Math.floor(totalMs / 1000);

    return {
      direction: isFuture ? "until" : "since",
      years: breakdown.years,
      months: breakdown.months,
      days: breakdown.days,
      hours: breakdown.hours,
      minutes: breakdown.minutes,
      seconds: breakdown.seconds,
      totals: {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor(totalSeconds / 60),
        seconds: totalSeconds,
      },
    };
  }

  /** Day-of-year (1-366) for a given wall-clock {year, month, day}. */
  function dayOfYear(y, m, d) {
    const start = Date.UTC(y, 0, 1);
    const target = Date.UTC(y, m - 1, d);
    return Math.round((target - start) / 86400000) + 1;
  }

  /** ISO-ish week number (1-53), good enough for the "Today" panel. */
  function weekOfYear(y, m, d) {
    const date = new Date(Date.UTC(y, m - 1, d));
    const dayNum = (date.getUTCDay() + 6) % 7; // Monday = 0
    date.setUTCDate(date.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const diff = date - firstThursday;
    return 1 + Math.round(diff / (7 * 86400000));
  }

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  CJ.duration = {
    calendarBreakdown,
    diffJourney,
    dayOfYear,
    weekOfYear,
    isLeapYear,
  };
})(window);
