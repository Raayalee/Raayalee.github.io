(function () {
  function renderRating() {
    const tbody = document.getElementById("rating-body");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    window.AppData.participants.forEach(function (participant, index) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${participant.name}</td>
        <td>${participant.wins}</td>
        <td>${participant.points}</td>
      `;

      if (index === 0) {
        row.style.backgroundColor = "#fff3bf";
      } else if (index === 1) {
        row.style.backgroundColor = "#f1f5ff";
      } else {
        row.style.backgroundColor = "#ffffff";
      }

      tbody.appendChild(row);
    });
  }

  function bindToggleTable() {
    const button = document.getElementById("toggle-rating-btn");
    const tableWrap = document.getElementById("rating-table-wrap");

    if (!button || !tableWrap) {
      return;
    }

    button.addEventListener("click", function () {
      if (tableWrap.classList.contains("hidden")) {
        tableWrap.classList.remove("hidden");
        button.textContent = "Приховати рейтинг";
      } else {
        tableWrap.classList.add("hidden");
        button.textContent = "Показати рейтинг";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.Common.initNavigation("rating");
    renderRating();
    bindToggleTable();
  });
})();
