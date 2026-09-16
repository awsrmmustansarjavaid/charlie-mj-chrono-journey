/**
 * app/js/time-api.js
 * ---------------------------------------------------------------------------
 * Responsible for getting an authoritative "now" instead of trusting the
 * viewer's device clock (which is easy to get wrong or set incorrectly).
 *
 * Strategy:
 *   1. On load, ask a public time API for the current UTC instant.
 *   2. Compare it against this device's Date.now() at the moment the
 *      response arrives, and store the *difference* (drift) between them.
 *   3. From then on, every "current time" request is just
 *      Date.now() + drift — cheap, and still accurate even though we only
 *      made one network call.
 *   4. If the network call fails (offline, blocked, slow), fall back to the
 *      raw device clock (drift = 0) and say so in the UI.
 *
 * Everything here is exposed on the shared `window.CJ` namespace so the
 * other modules (clock.js, app.js) can call `CJ.time.now()`.
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});

  // A couple of CORS-friendly public time endpoints, tried in order.
  const TIME_ENDPOINTS = [
    "https://worldtimeapi.org/api/timezone/Etc/UTC",
    "https://timeapi.io/api/time/current/zone?timeZone=UTC",
  ];

  let driftMs = 0; // serverTime - localTime, measured once at startup
  let source = "pending"; // "internet" | "local" | "pending"
  const listeners = [];

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn(source);
      } catch (err) {
        console.error("CJ.time listener error:", err);
      }
    });
  }

  /** Parses the handful of shapes the endpoints above can return. */
  function extractEpochMs(url, payload) {
    if (url.includes("worldtimeapi.org") && typeof payload.unixtime === "number") {
      return payload.unixtime * 1000;
    }
    if (url.includes("timeapi.io") && payload.dateTime) {
      // timeapi.io returns an ISO-like string without a trailing "Z"; it is UTC.
      return new Date(payload.dateTime + "Z").getTime();
    }
    // Last resort: look for any ISO date-ish field.
    const guess = payload.utc_datetime || payload.datetime || payload.dateTime;
    return guess ? new Date(guess).getTime() : NaN;
  }

  async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      if (!res.ok) throw new Error("Bad response: " + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function sync() {
    for (const url of TIME_ENDPOINTS) {
      try {
        const before = Date.now();
        const payload = await fetchWithTimeout(url, 4000);
        const after = Date.now();
        const epochMs = extractEpochMs(url, payload);

        if (!isFinite(epochMs)) continue;

        // Assume the server timestamp corresponds to the midpoint of the
        // request round-trip — a small but easy accuracy win.
        const roundTrip = after - before;
        const localAtServerMoment = before + roundTrip / 2;

        driftMs = epochMs - localAtServerMoment;
        source = "internet";
        notify();
        return;
      } catch (err) {
        // try the next endpoint
        continue;
      }
    }

    // All endpoints failed: fall back to the device clock.
    driftMs = 0;
    source = "local";
    notify();
  }

  CJ.time = {
    /** Returns the current authoritative instant as epoch milliseconds. */
    nowMs() {
      return Date.now() + driftMs;
    },
    /** Returns the current authoritative instant as a Date object. */
    now() {
      return new Date(this.nowMs());
    },
    /** "internet" | "local" | "pending" */
    getSource() {
      return source;
    },
    /** Re-run the sync (e.g. a manual "retry" button). */
    resync: sync,
    /** Subscribe to source changes (fired once after the first sync attempt). */
    onSourceChange(fn) {
      listeners.push(fn);
    },
  };

  // Kick off the first sync immediately.
  sync();
})(window);
