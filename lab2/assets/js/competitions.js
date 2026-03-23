(function () {
  function pad(value) {
    if (value < 10) {
      return `0${value}`;
    }

    return String(value);
  }

  function renderHackathons() {
    const grid = document.getElementById("hackathons-grid");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    const items = window.AppData.hackathons;

    for (let i = 0; i < items.length; i++) {
      const card = document.createElement("article");
      card.className = "hackathon-card";
      card.setAttribute("data-slug", items[i].slug);
      card.setAttribute("data-deadline", items[i].deadlineIso);

      if (i === 0) {
        card.classList.add("urgent");
      }

      card.innerHTML = `
        <h3>${items[i].title}</h3>
        <p><strong>Тема:</strong> ${items[i].topic}</p>
        <p><strong>Дедлайн:</strong> ${items[i].deadlineLabel}</p>
        <p class="timer" aria-live="polite">До завершення: --</p>
        <p>${items[i].short}</p>
        <button class="details-btn" type="button">Детальніше</button>
      `;

      grid.appendChild(card);
    }
  }

  function updateTimers() {
    const cards = document.querySelectorAll(".hackathon-card");

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const deadline = card.getAttribute("data-deadline");
      const timer = card.querySelector(".timer");
      const button = card.querySelector(".details-btn");

      if (!deadline || !timer || !button) {
        continue;
      }

      const diffMs = new Date(deadline).getTime() - Date.now();

      if (diffMs <= 0) {
        timer.textContent = "Хакатон завершено";
        timer.classList.add("timer-finished");
        button.disabled = true;
      } else {
        const total = Math.floor(diffMs / 1000);
        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        timer.textContent = `До завершення: ${days}д. ${hours}год. ${pad(minutes)}хв. ${pad(seconds)}с`;
        timer.classList.remove("timer-finished");
        button.disabled = false;
      }
    }
  }

  function bindDetailsModal() {
    const modal = document.getElementById("hackathon-modal");

    if (!modal) {
      return;
    }

    const title = document.getElementById("modal-title");
    const description = document.getElementById("modal-description");
    const rules = document.getElementById("modal-rules");
    const criteria = document.getElementById("modal-criteria");
    const prizes = document.getElementById("modal-prizes");
    const closeButtons = modal.querySelectorAll("[data-close-modal]");

    function closeModal() {
      modal.classList.remove("open");
    }

    function fillList(element, items) {
      element.innerHTML = "";

      for (let i = 0; i < items.length; i++) {
        const li = document.createElement("li");
        li.textContent = items[i];
        element.appendChild(li);
      }
    }

    document.addEventListener("click", function (event) {
      const button = event.target.closest(".details-btn");

      if (!button) {
        return;
      }

      const card = button.closest(".hackathon-card");
      const slug = card ? card.getAttribute("data-slug") : "";
      const list = window.AppData.hackathons;
      let selected = null;

      for (let i = 0; i < list.length; i++) {
        if (list[i].slug === slug) {
          selected = list[i];
          break;
        }
      }

      if (!selected) {
        return;
      }

      title.textContent = selected.title;
      description.textContent = selected.details.description;
      fillList(rules, selected.details.rules);
      fillList(criteria, selected.details.criteria);
      fillList(prizes, selected.details.prizes);
      modal.classList.add("open");
    });

    for (let i = 0; i < closeButtons.length; i++) {
      closeButtons[i].addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.Common.initNavigation("competitions");
    renderHackathons();
    updateTimers();
    setInterval(updateTimers, 1000);
    bindDetailsModal();

    window.FormModule.bindApplicationForm({
      formId: "application-form"
    });
  });
})();
