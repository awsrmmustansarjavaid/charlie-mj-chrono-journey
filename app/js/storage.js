/**
 * app/js/storage.js
 * ---------------------------------------------------------------------------
 * Persists the list of journeys to localStorage so they survive a page
 * refresh, with no backend required. Also handles export-to-file and
 * import-from-file so journeys can be backed up or moved between browsers.
 *
 * A "journey" object looks like:
 * {
 *   id: "j_172..." ,        // unique string id
 *   title: "My project started",
 *   year, month, day,       // the moment, as typed by the user (1-12 month)
 *   hour, minute, second,
 *   timezone: "Asia/Karachi",
 *   favorite: true,         // favorites are shown as the primary hero journey
 *   createdAt: 172...       // epoch ms, for stable sort order
 * }
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});
  const STORAGE_KEY = "charlie-mj-chrono-journey:journeys:v1";

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
      console.error("charlie-mj-chrono-journey: could not read saved journeys.", err);
      return null;
    }
  }

  function saveAll(journeys) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
      return true;
    } catch (err) {
      console.error("charlie-mj-chrono-journey: could not save journeys (storage full or disabled).", err);
      return false;
    }
  }

  function makeId() {
    return "j_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function exportToFile(journeys) {
    const blob = new Blob([JSON.stringify(journeys, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "charlie-mj-chrono-journey-counters.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data)) throw new Error("File does not contain a journey list.");
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  CJ.storage = { loadAll, saveAll, makeId, exportToFile, importFromFile };
})(window);
