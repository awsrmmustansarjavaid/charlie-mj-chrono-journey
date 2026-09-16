/**
 * app/js/calendar.js
 * ---------------------------------------------------------------------------
 * A small, dependency-free month-grid calendar used inside the "Add / edit
 * journey" modal. It stays in sync with the native <input type="date">
 * field: clicking a day updates the input, and changing the input (or
 * navigating months) redraws the grid.
 */

(function (global) {
  "use strict";

  const CJ = (global.CJ = global.CJ || {});
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  /**
   * Creates a calendar bound to a given grid/month-label element and a
   * "selected date changed" callback. Returns an object with `render(date)`
   * and `getSelected()`.
   */
  function createCalendar({ gridEl, monthLabelEl, prevBtn, nextBtn, onSelect }) {
    let viewYear, viewMonth; // 1-12
    let selected = null; // { year, month, day }

    function daysInMonth(y, m) {
      return new Date(y, m, 0).getDate();
    }

    function weekdayMondayFirst(y, m, d) {
      // JS getDay(): 0 = Sunday. Convert so Monday = 0 ... Sunday = 6.
      const js = new Date(y, m - 1, d).getDay();
      return (js + 6) % 7;
    }

    function render() {
      monthLabelEl.textContent = `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`;
      gridEl.innerHTML = "";

      const totalDays = daysInMonth(viewYear, viewMonth);
      const leadingBlanks = weekdayMondayFirst(viewYear, viewMonth, 1);

      const prevMonthDays = daysInMonth(
        viewMonth === 1 ? viewYear - 1 : viewYear,
        viewMonth === 1 ? 12 : viewMonth - 1
      );

      const today = new Date();
      const cells = [];

      // Leading days from the previous month (muted, not clickable-styled).
      for (let i = leadingBlanks - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, muted: true });
      }
      for (let day = 1; day <= totalDays; day++) {
        cells.push({ day, muted: false });
      }
      // Trailing days to complete the final week row.
      while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length - (leadingBlanks + totalDays) + 1, muted: true });
      }

      cells.forEach((cell) => {
        const btn = document.createElement("div");
        btn.className = "cj-cal-day" + (cell.muted ? " is-muted" : "");
        btn.textContent = cell.day;

        if (!cell.muted) {
          const isToday =
            viewYear === today.getFullYear() &&
            viewMonth === today.getMonth() + 1 &&
            cell.day === today.getDate();
          if (isToday) btn.classList.add("is-today");

          const isSelected =
            selected &&
            selected.year === viewYear &&
            selected.month === viewMonth &&
            selected.day === cell.day;
          if (isSelected) btn.classList.add("is-selected");

          btn.addEventListener("click", () => {
            selected = { year: viewYear, month: viewMonth, day: cell.day };
            render();
            if (onSelect) onSelect(selected);
          });
        }

        gridEl.appendChild(btn);
      });
    }

    prevBtn.addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 1) { viewMonth = 12; viewYear -= 1; }
      render();
    });

    nextBtn.addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 12) { viewMonth = 1; viewYear += 1; }
      render();
    });

    return {
      /** Sets the selected day and jumps the visible month to match. */
      setSelected(year, month, day) {
        selected = { year, month, day };
        viewYear = year;
        viewMonth = month;
        render();
      },
      getSelected() {
        return selected;
      },
    };
  }

  CJ.calendar = { createCalendar, MONTH_NAMES };
})(window);
