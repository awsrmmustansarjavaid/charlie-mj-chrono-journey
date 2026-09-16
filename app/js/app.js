/**
 * app/js/app.js
 * ---------------------------------------------------------------------------
 * The main controller. Loads (or seeds) the journey list, renders the hero
 * plate, the "Today" plate, and the journeys list, wires up the add/edit
 * modal (with its live calendar and moment preview), and re-renders
 * everything once a second using the authoritative time from CJ.time.
 */

(function () {
  "use strict";

  const CJ = window.CJ;

  const DEFAULT_JOURNEY = {
    title: "My time journey",
    year: 2023,
    month: 3,
    day: 24,
    hour: 1,
    minute: 1,
    second: 0,
    timezone: "Asia/Karachi",
    favorite: true,
  };

  let journeys = [];
  let previousDigitValues = {}; // journeyId -> last rendered {years, months, ...}
  let modalInstance = null;
  let calendarWidget = null;

  // ---------------------------------------------------------------------
  // Bootstrapping
  // ---------------------------------------------------------------------

  function loadJourneys() {
    const saved = CJ.storage.loadAll();
    if (saved && saved.length) {
      journeys = saved;
    } else {
      journeys = [Object.assign({ id: CJ.storage.makeId(), createdAt: Date.now() }, DEFAULT_JOURNEY)];
      CJ.storage.saveAll(journeys);
    }
  }

  function persist() {
    CJ.storage.saveAll(journeys);
  }

  function getPrimaryJourney() {
    return journeys.find((j) => j.favorite) || journeys[0];
  }

  // ---------------------------------------------------------------------
  // Rendering: hero plate
  // ---------------------------------------------------------------------

  const DIGIT_LABELS = ["years", "months", "days", "hours", "minutes", "seconds"];

  function renderDigitRow(containerEl, result, cacheKey) {
    const values = [result.years, result.months, result.days, result.hours, result.minutes, result.seconds];
    const prev = previousDigitValues[cacheKey] || [];

    containerEl.innerHTML = "";
    values.forEach((val, i) => {
      const cell = document.createElement("div");
      cell.className = "cj-digit-cell";

      const valueEl = document.createElement("span");
      valueEl.className = "cj-digit-value";
      valueEl.textContent = String(val).padStart(2, "0");
      if (prev[i] !== undefined && prev[i] !== val) {
        valueEl.classList.add("cj-flip");
      }

      const labelEl = document.createElement("p");
      labelEl.className = "cj-digit-label";
      labelEl.textContent = DIGIT_LABELS[i];

      cell.appendChild(valueEl);
      cell.appendChild(labelEl);
      containerEl.appendChild(cell);
    });

    previousDigitValues[cacheKey] = values;
  }

  function formatMomentLabels(wall) {
    const monthName = CJ.calendar.MONTH_NAMES[wall.month - 1];
    const h12 = wall.hour % 12 === 0 ? 12 : wall.hour % 12;
    const meridiem = wall.hour >= 12 ? "PM" : "AM";
    return {
      weekday: wall.weekday,
      date: `${wall.day} ${monthName} ${wall.year}`,
      time: `${String(h12).padStart(2, "0")}:${String(wall.minute).padStart(2, "0")}:${String(wall.second).padStart(2, "0")} ${meridiem}`,
    };
  }

  function renderHero(nowMs) {
    const journey = getPrimaryJourney();
    if (!journey) return;

    const startUtcMs = CJ.timezone.zonedTimeToUtc(
      journey.year, journey.month, journey.day, journey.hour, journey.minute, journey.second, journey.timezone
    );
    const result = CJ.duration.diffJourney(startUtcMs, nowMs, journey.timezone);

    document.getElementById("heroDirectionLabel").textContent =
      result.direction === "since" ? "Time since" : "Time until";
    document.getElementById("heroTitle").textContent = journey.title;

    renderDigitRow(document.getElementById("heroDigits"), result, "__hero__");

    const startWall = CJ.timezone.wallClockIn(journey.timezone, startUtcMs);
    const nowWall = CJ.timezone.wallClockIn(journey.timezone, nowMs);
    const startLabels = formatMomentLabels(startWall);
    const nowLabels = formatMomentLabels(nowWall);
    const offset = CJ.timezone.getOffsetMinutes(journey.timezone, new Date(nowMs));
    const offsetLabel = CJ.timezone.formatOffset(offset);

    document.getElementById("startDayLabel").textContent = startLabels.weekday;
    document.getElementById("startDateLabel").textContent = startLabels.date;
    document.getElementById("startTimeLabel").textContent = startLabels.time;
    document.getElementById("startZoneLabel").textContent = `${journey.timezone} · ${offsetLabel}`;

    document.getElementById("nowDayLabel").textContent = nowLabels.weekday;
    document.getElementById("nowDateLabel").textContent = nowLabels.date;
    document.getElementById("nowTimeLabel").textContent = nowLabels.time;
    document.getElementById("nowZoneLabel").textContent = `${journey.timezone} · ${offsetLabel}`;

    document.getElementById("timelineStart").textContent = `${startWall.day} ${CJ.calendar.MONTH_NAMES[startWall.month - 1].slice(0, 3)} ${startWall.year}`;
    document.getElementById("timelineEnd").textContent = result.direction === "since" ? "Now" : journey.title;

    const totalsEl = document.getElementById("heroTotals");
    totalsEl.innerHTML = "";
    [
      ["days", result.totals.days],
      ["hours", result.totals.hours],
      ["minutes", result.totals.minutes],
      ["seconds", result.totals.seconds],
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "cj-total-item";
      item.innerHTML = `<div class="cj-total-value">${value.toLocaleString()}</div><div class="cj-total-label">total ${label}</div>`;
      totalsEl.appendChild(item);
    });

    // Keep the live clock plate pointed at the primary journey's timezone.
    CJ.clock.setZone(journey.timezone);
  }

  // ---------------------------------------------------------------------
  // Rendering: today plate
  // ---------------------------------------------------------------------

  function renderToday(nowMs) {
    const journey = getPrimaryJourney();
    const zone = journey ? journey.timezone : "Etc/UTC";
    const wall = CJ.timezone.wallClockIn(zone, nowMs);
    const doy = CJ.duration.dayOfYear(wall.year, wall.month, wall.day);
    const totalDaysInYear = CJ.duration.isLeapYear(wall.year) ? 366 : 365;
    const week = CJ.duration.weekOfYear(wall.year, wall.month, wall.day);

    const items = [
      [wall.weekday, "Day of the week"],
      [`${wall.day} ${CJ.calendar.MONTH_NAMES[wall.month - 1]} ${wall.year}`, "Today's date"],
      [`Day ${doy} of ${totalDaysInYear}`, "Day of the year"],
      [`Week ${week}`, "Week of the year"],
      [`${totalDaysInYear - doy}`, "Days remaining this year"],
      [CJ.calendar.MONTH_NAMES[wall.month - 1], "Current month"],
      [String(wall.year), "Current year"],
      [CJ.duration.isLeapYear(wall.year) ? "Yes" : "No", "Leap year"],
    ];

    const grid = document.getElementById("todayGrid");
    grid.innerHTML = "";
    items.forEach(([value, label]) => {
      const cell = document.createElement("div");
      cell.className = "cj-today-item";
      cell.innerHTML = `<div class="cj-today-value">${value}</div><div class="cj-today-label">${label}</div>`;
      grid.appendChild(cell);
    });
  }

  // ---------------------------------------------------------------------
  // Rendering: journeys list
  // ---------------------------------------------------------------------

  function renderJourneysList(nowMs) {
    const listEl = document.getElementById("journeysList");
    const emptyEl = document.getElementById("journeysEmpty");
    const others = journeys.slice().sort((a, b) => (b.favorite === a.favorite ? a.createdAt - b.createdAt : b.favorite ? 1 : -1));

    listEl.innerHTML = "";
    if (others.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    others.forEach((journey) => {
      const startUtcMs = CJ.timezone.zonedTimeToUtc(
        journey.year, journey.month, journey.day, journey.hour, journey.minute, journey.second, journey.timezone
      );
      const result = CJ.duration.diffJourney(startUtcMs, nowMs, journey.timezone);

      const row = document.createElement("div");
      row.className = "cj-journey-row";
      row.innerHTML = `
        <div class="cj-journey-main">
          <p class="cj-journey-title">${journey.favorite ? '<i class="bi bi-star-fill" style="font-size:13px;color:var(--brass-bright)"></i>' : ""}${escapeHtml(journey.title)}</p>
          <p class="cj-journey-sub">${result.direction === "since" ? "Since" : "Until"} ${journey.day} ${CJ.calendar.MONTH_NAMES[journey.month - 1]} ${journey.year} · ${journey.timezone}</p>
        </div>
        <div class="cj-journey-digits">${result.years}y ${result.months}m ${result.days}d ${String(result.hours).padStart(2,"0")}:${String(result.minutes).padStart(2,"0")}:${String(result.seconds).padStart(2,"0")}</div>
        <div class="cj-journey-actions">
          <button class="cj-icon-btn cj-star-btn ${journey.favorite ? "is-favorite" : ""}" data-action="favorite" title="Show at the top"><i class="bi bi-star${journey.favorite ? "-fill" : ""}"></i></button>
          <button class="cj-icon-btn" data-action="duplicate" title="Duplicate"><i class="bi bi-copy"></i></button>
          <button class="cj-icon-btn" data-action="edit" title="Edit"><i class="bi bi-pencil"></i></button>
          <button class="cj-icon-btn" data-action="delete" title="Delete"><i class="bi bi-trash"></i></button>
        </div>
      `;

      row.querySelector('[data-action="favorite"]').addEventListener("click", () => setFavorite(journey.id));
      row.querySelector('[data-action="duplicate"]').addEventListener("click", () => duplicateJourney(journey.id));
      row.querySelector('[data-action="edit"]').addEventListener("click", () => openModal(journey.id));
      row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteJourney(journey.id));

      listEl.appendChild(row);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------
  // Journey actions
  // ---------------------------------------------------------------------

  function setFavorite(id) {
    journeys.forEach((j) => (j.favorite = j.id === id));
    persist();
    renderAll();
  }

  function duplicateJourney(id) {
    const source = journeys.find((j) => j.id === id);
    if (!source) return;
    const copy = Object.assign({}, source, {
      id: CJ.storage.makeId(),
      title: source.title + " (copy)",
      favorite: false,
      createdAt: Date.now(),
    });
    journeys.push(copy);
    persist();
    renderAll();
  }

  function deleteJourney(id) {
    if (journeys.length <= 1) {
      alert("You need at least one time journey. Add a new one before deleting this.");
      return;
    }
    if (!confirm("Delete this time journey? This cannot be undone.")) return;
    const wasFavorite = journeys.find((j) => j.id === id)?.favorite;
    journeys = journeys.filter((j) => j.id !== id);
    if (wasFavorite && journeys.length) journeys[0].favorite = true;
    persist();
    renderAll();
  }

  // ---------------------------------------------------------------------
  // Modal: add / edit
  // ---------------------------------------------------------------------

  function populateSelects() {
    const countrySelect = document.getElementById("journeyCountry");
    const timezoneSelect = document.getElementById("journeyTimezone");

    countrySelect.innerHTML = CJ.timezone.COUNTRY_TIMEZONES
      .map((c) => `<option value="${c.zone}">${c.country}</option>`)
      .join("");

    let allZones;
    try {
      allZones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : null;
    } catch (err) {
      allZones = null;
    }
    if (!allZones || !allZones.length) {
      allZones = [...new Set(CJ.timezone.COUNTRY_TIMEZONES.map((c) => c.zone))];
    }
    timezoneSelect.innerHTML = allZones.map((z) => `<option value="${z}">${z}</option>`).join("");

    countrySelect.addEventListener("change", () => {
      timezoneSelect.value = countrySelect.value;
      updateSelectedMomentPreview();
    });
  }

  function updateSelectedMomentPreview() {
    const dateVal = document.getElementById("journeyDate").value; // yyyy-mm-dd
    const timeVal = document.getElementById("journeyTime").value; // HH:MM:SS
    const zone = document.getElementById("journeyTimezone").value;
    const previewEl = document.getElementById("selectedMomentText");

    if (!dateVal || !timeVal || !zone) {
      previewEl.textContent = "—";
      return;
    }

    const [y, m, d] = dateVal.split("-").map(Number);
    const [h, mi, s] = timeVal.split(":").map(Number);
    const utcMs = CJ.timezone.zonedTimeToUtc(y, m, d, h, mi, s || 0, zone);
    const wall = CJ.timezone.wallClockIn(zone, utcMs);
    const labels = formatMomentLabels(wall);
    const offset = CJ.timezone.getOffsetMinutes(zone, new Date(utcMs));
    const doy = CJ.duration.dayOfYear(wall.year, wall.month, wall.day);

    previewEl.textContent = `${labels.weekday} · ${labels.date} · ${labels.time} · ${zone} (${CJ.timezone.formatOffset(offset)}) · day ${doy} of ${wall.year}`;

    if (calendarWidget) calendarWidget.setSelected(y, m, d);
  }

  function initCalendarWidget() {
    calendarWidget = CJ.calendar.createCalendar({
      gridEl: document.getElementById("calGrid"),
      monthLabelEl: document.getElementById("calMonthLabel"),
      prevBtn: document.getElementById("calPrevMonth"),
      nextBtn: document.getElementById("calNextMonth"),
      onSelect: ({ year, month, day }) => {
        document.getElementById("journeyDate").value =
          `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        updateSelectedMomentPreview();
      },
    });
  }

  function openModal(journeyId) {
    const isEdit = Boolean(journeyId);
    const journey = isEdit ? journeys.find((j) => j.id === journeyId) : null;

    document.getElementById("journeyModalLabel").textContent = isEdit ? "Edit time journey" : "Add a time journey";
    document.getElementById("journeyId").value = isEdit ? journey.id : "";
    document.getElementById("journeyTitle").value = isEdit ? journey.title : "";
    document.getElementById("journeyFavorite").checked = isEdit ? Boolean(journey.favorite) : journeys.length === 0;

    const seed = isEdit ? journey : DEFAULT_JOURNEY;
    document.getElementById("journeyDate").value =
      `${seed.year}-${String(seed.month).padStart(2, "0")}-${String(seed.day).padStart(2, "0")}`;
    document.getElementById("journeyTime").value =
      `${String(seed.hour).padStart(2, "0")}:${String(seed.minute).padStart(2, "0")}:${String(seed.second).padStart(2, "0")}`;
    document.getElementById("journeyTimezone").value = seed.timezone;
    document.getElementById("journeyCountry").value = seed.timezone;

    calendarWidget.setSelected(seed.year, seed.month, seed.day);
    updateSelectedMomentPreview();

    modalInstance.show();
  }

  function saveJourneyFromModal() {
    const id = document.getElementById("journeyId").value;
    const title = document.getElementById("journeyTitle").value.trim();
    const dateVal = document.getElementById("journeyDate").value;
    const timeVal = document.getElementById("journeyTime").value;
    const zone = document.getElementById("journeyTimezone").value;
    const favorite = document.getElementById("journeyFavorite").checked;

    if (!title || !dateVal || !timeVal || !zone) {
      alert("Please fill in the title, date, time and timezone.");
      return;
    }

    const [y, m, d] = dateVal.split("-").map(Number);
    const [h, mi, s] = timeVal.split(":").map(Number);

    if (id) {
      const journey = journeys.find((j) => j.id === id);
      Object.assign(journey, { title, year: y, month: m, day: d, hour: h, minute: mi, second: s || 0, timezone: zone });
      if (favorite) journeys.forEach((j) => (j.favorite = j.id === id));
    } else {
      const newJourney = {
        id: CJ.storage.makeId(),
        title, year: y, month: m, day: d, hour: h, minute: mi, second: s || 0,
        timezone: zone, favorite: false, createdAt: Date.now(),
      };
      if (favorite) journeys.forEach((j) => (j.favorite = false));
      newJourney.favorite = favorite;
      journeys.push(newJourney);
    }

    persist();
    renderAll();
    modalInstance.hide();

    const saveBtn = document.getElementById("saveJourneyBtn");
    saveBtn.classList.add("cj-save-flash");
    setTimeout(() => saveBtn.classList.remove("cj-save-flash"), 650);
  }

  // ---------------------------------------------------------------------
  // Theme toggle
  // ---------------------------------------------------------------------

  function initTheme() {
    const saved = localStorage.getItem("charlie-mj-chrono-journey:theme");
    const initial = saved || "dark";
    document.documentElement.setAttribute("data-theme", initial);
    updateThemeIcon(initial);

    document.getElementById("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("charlie-mj-chrono-journey:theme", next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    const icon = document.querySelector("#themeToggle i");
    icon.className = theme === "dark" ? "bi bi-moon-stars" : "bi bi-sun";
  }

  // ---------------------------------------------------------------------
  // Import / export
  // ---------------------------------------------------------------------

  function initImportExport() {
    document.getElementById("exportBtn").addEventListener("click", () => {
      CJ.storage.exportToFile(journeys);
    });

    document.getElementById("importInput").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const imported = await CJ.storage.importFromFile(file);
        const withIds = imported.map((j) => Object.assign({}, j, { id: j.id || CJ.storage.makeId() }));
        journeys = journeys.concat(withIds);
        persist();
        renderAll();
      } catch (err) {
        alert("That file could not be read as a charlie-mj-chrono-journey export.");
      } finally {
        e.target.value = "";
      }
    });
  }

  // ---------------------------------------------------------------------
  // Main render + ticking
  // ---------------------------------------------------------------------

  function renderAll() {
    const nowMs = CJ.time.nowMs();
    renderHero(nowMs);
    renderToday(nowMs);
    renderJourneysList(nowMs);
  }

  function start() {
    loadJourneys();
    populateSelects();
    initCalendarWidget();
    initTheme();
    initImportExport();

    document.getElementById("journeyDate").addEventListener("change", updateSelectedMomentPreview);
    document.getElementById("journeyTime").addEventListener("change", updateSelectedMomentPreview);
    document.getElementById("journeyTimezone").addEventListener("change", updateSelectedMomentPreview);

    document.getElementById("addJourneyBtn").addEventListener("click", () => openModal(null));
    document.getElementById("editPrimaryBtn").addEventListener("click", () => openModal(getPrimaryJourney().id));
    document.getElementById("saveJourneyBtn").addEventListener("click", saveJourneyFromModal);

    modalInstance = new bootstrap.Modal(document.getElementById("journeyModal"));

    CJ.clock.start();
    CJ.time.onSourceChange(renderAll);

    renderAll();
    setInterval(renderAll, 1000);
  }

  document.addEventListener("DOMContentLoaded", start);
})();
