/**
 * app/js/clock.js
 * ---------------------------------------------------------------------------
 * Drives the live clock plate at the top of the page: current day, date,
 * and ticking time, formatted in whichever timezone the primary journey
 * uses, sourced from CJ.time (internet time with local fallback).
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});

  let use24Hour = false;
  let activeZone = "Asia/Karachi";
  let intervalId = null;

  function els() {
    return {
      day: document.getElementById("clockDay"),
      date: document.getElementById("clockDate"),
      time: document.getElementById("clockTime"),
      meridiem: document.getElementById("clockMeridiem"),
      zoneLabel: document.getElementById("clockZoneLabel"),
      statusDot: document.getElementById("timeSourceDot"),
      statusLabel: document.getElementById("timeSourceLabel"),
      formatToggle: document.getElementById("clockFormatToggle"),
    };
  }

  function renderStatus() {
    const { statusDot, statusLabel } = els();
    const source = CJ.time.getSource();
    statusDot.classList.remove("is-online", "is-local");
    if (source === "internet") {
      statusDot.classList.add("is-online");
      statusLabel.textContent = "Internet time connected";
    } else if (source === "local") {
      statusDot.classList.add("is-local");
      statusLabel.textContent = "Using this device's clock";
    } else {
      statusLabel.textContent = "Checking internet time…";
    }
  }

  function tick() {
    const { day, date, time, meridiem, zoneLabel } = els();
    const nowMs = CJ.time.nowMs();
    const wall = CJ.timezone.wallClockIn(activeZone, nowMs);

    day.textContent = wall.weekday;
    date.textContent = `${wall.day} ${CJ.calendar.MONTH_NAMES[wall.month - 1]} ${wall.year}`;

    if (use24Hour) {
      time.textContent = [wall.hour, wall.minute, wall.second]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
      meridiem.textContent = "";
    } else {
      const h12 = wall.hour % 12 === 0 ? 12 : wall.hour % 12;
      time.textContent = [h12, wall.minute, wall.second]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
      meridiem.textContent = wall.hour >= 12 ? "PM" : "AM";
    }

    const offset = CJ.timezone.getOffsetMinutes(activeZone, new Date(nowMs));
    zoneLabel.textContent = `${activeZone} · ${CJ.timezone.formatOffset(offset)}`;
  }

  CJ.clock = {
    /** Point the live clock at a different journey's timezone. */
    setZone(zone) {
      activeZone = zone;
      tick();
    },
    start() {
      const { formatToggle } = els();
      formatToggle.addEventListener("click", () => {
        use24Hour = !use24Hour;
        formatToggle.textContent = use24Hour ? "Switch to 12-hour" : "Switch to 24-hour";
        tick();
      });

      CJ.time.onSourceChange(renderStatus);
      renderStatus();

      tick();
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(tick, 1000);
    },
  };
})(window);
