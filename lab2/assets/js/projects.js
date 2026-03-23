(function () {
  function formatDate(iso) {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
      return "дата невідома";
    }

    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function renderSubmittedProjects() {
    const wrap = document.getElementById("submitted-projects");

    if (!wrap) {
      return;
    }

    wrap.innerHTML = "";
    const items = window.AppData.readApplications();

    if (items.length === 0) {
      wrap.innerHTML = "<p>Поки що немає поданих заявок.</p>";
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const card = document.createElement("article");
      card.className = "submitted-card";

      card.innerHTML = `
        <div class="submitted-top">
          <h4>${items[i].project}</h4>
          <span class="status status-submitted">ПОДАНО</span>
        </div>
        <p><strong>Хакатон:</strong> ${items[i].hackathon}</p>
        <p><strong>Автор:</strong> ${items[i].name} • ${items[i].email}</p>
        <p>${items[i].idea}</p>
        <p><small>Подано: ${formatDate(items[i].createdAt)}</small></p>
        <button class="btn-danger" type="button" data-delete-id="${items[i].id}">Видалити заявку</button>
      `;

      wrap.appendChild(card);
    }
  }

  function bindDeleteButtons() {
    document.addEventListener("click", function (event) {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const deleteId = target.getAttribute("data-delete-id");

      if (!deleteId) {
        return;
      }

      if (!window.confirm("Видалити цю заявку без можливості відновлення?")) {
        return;
      }

      window.AppData.deleteApplication(deleteId);
      renderSubmittedProjects();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.Common.initNavigation("projects");
    renderSubmittedProjects();
    bindDeleteButtons();

    window.FormModule.bindApplicationForm({
      formId: "application-form",
      onSuccess: function () {
        renderSubmittedProjects();
      }
    });
  });
})();
