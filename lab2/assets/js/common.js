(function () {
  function initNavigation(activePage) {
    const links = document.querySelectorAll(".nav-list a");
    const hint = document.getElementById("nav-hint");
    const defaultText = "Наведи курсор на пункт меню, щоб побачити короткий опис сторінки.";

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const page = link.getAttribute("data-page");

      if (page === activePage) {
        link.classList.add("active");
      }

      link.addEventListener("mouseenter", function () {
        if (!hint) {
          return;
        }

        if (page === "home") {
          hint.textContent = "Головна: переваги платформи, журі, FAQ та швидкі переходи.";
        } else if (page === "competitions") {
          hint.textContent = "Змагання: активні хакатони, таймери, деталі та форма подання.";
        } else if (page === "projects") {
          hint.textContent = "Мої проєкти: статичні проєкти, подані заявки і керування ними.";
        } else {
          hint.textContent = "Рейтинг: найсильніші учасники спільноти за балами та перемогами.";
        }
      });

      link.addEventListener("mouseleave", function () {
        if (hint) {
          hint.textContent = defaultText;
        }
      });
    }
  }

  window.Common = {
    initNavigation: initNavigation
  };
})();
