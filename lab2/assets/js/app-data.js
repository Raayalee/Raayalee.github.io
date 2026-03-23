(function () {
  const STORAGE_KEY = "hackathonhub_applications_v1";

  const participants = [
    { name: "Ірина Рурак", wins: 5, points: 920 },
    { name: "Ярослав Басараб", wins: 3, points: 740 },
    { name: "Іван Саєнко", wins: 2, points: 610 },
    { name: "Ольга Дячук", wins: 2, points: 590 },
    { name: "Роман Паламарчук", wins: 1, points: 510 }
  ];

  const hackathons = [
    {
      slug: "ai-sprint",
      title: "AI Sprint Hackathon",
      topic: "ШІ в освіті",
      deadlineLabel: "25 березня",
      deadlineIso: "2026-03-25T23:59:59",
      short: "Створи прототип інструмента, який допомагає студентам навчатись ефективніше.",
      details: {
        description: "Інтенсивний хакатон для команд, які створюють AI-рішення для персоналізованого навчання, автоматизації перевірки завдань та навчальної аналітики.",
        rules: ["Команда 2-5 учасників", "Використання відкритих API та open-source бібліотек дозволено", "Потрібно представити демо і коротку презентацію"],
        criteria: ["Інноваційність ідеї", "Якість UX та інтерфейсу", "Технічна реалізація", "Практична користь для освіти"],
        prizes: ["1 місце — 30 000 грн + менторська програма", "2 місце — 20 000 грн", "3 місце — 10 000 грн"]
      }
    },
    {
      slug: "web-dev",
      title: "Web Dev Challenge",
      topic: "Адаптивний UI",
      deadlineLabel: "2 квітня",
      deadlineIso: "2026-04-02T23:59:59",
      short: "Зроби адаптивний інтерфейс для сервісу змагань та представ його як лендінг.",
      details: {
        description: "Практичний веб-хакатон, де головний фокус — продуманий респонсивний інтерфейс і доступність на різних пристроях.",
        rules: ["Рішення має працювати на мобільних та desktop-екранах", "Обов'язкова семантична HTML-структура", "Публічний демо-лінк або локальна презентація"],
        criteria: ["Якість адаптивності", "Візуальна цілісність", "Доступність", "Чистота коду"],
        prizes: ["1 місце — 25 000 грн", "2 місце — 15 000 грн", "3 місце — 8 000 грн"]
      }
    },
    {
      slug: "dataquest",
      title: "DataQuest Cup",
      topic: "Аналіз даних",
      deadlineLabel: "15 квітня",
      deadlineIso: "2026-04-15T23:59:59",
      short: "Побудуй просту аналітику/дашборд за відкритим набором даних.",
      details: {
        description: "Змагання для команд, які вміють знаходити інсайти в даних і презентувати їх через зрозумілий дашборд.",
        rules: ["Використовувати відкриті датасети", "Обов'язково додати візуалізацію", "Описати обрану методологію"],
        criteria: ["Якість аналізу", "Надійність висновків", "Зрозумілість дашборду", "Практичність рекомендацій"],
        prizes: ["1 місце — 28 000 грн", "2 місце — 18 000 грн", "3 місце — 9 000 грн"]
      }
    },
    {
      slug: "edubot",
      title: "EduBot",
      topic: "AI-помічник",
      deadlineLabel: "22 квітня",
      deadlineIso: "2026-04-22T23:59:59",
      short: "Розроби smart-помічника для навчання та комунікації зі студентами.",
      details: {
        description: "Тематичний хакатон про чат-асистентів, автоматизацію відповідей та підказки для навчальних команд.",
        rules: ["Додати сценарій діалогу", "Показати приклад обробки запиту", "Вказати межі використання AI"],
        criteria: ["Корисність рішення", "Якість взаємодії", "Надійність логіки", "Відповідність темі"],
        prizes: ["1 місце — 22 000 грн", "2 місце — 12 000 грн", "3 місце — 7 000 грн"]
      }
    },
    {
      slug: "responsive-arena",
      title: "Responsive Arena",
      topic: "Front-end UX",
      deadlineLabel: "30 квітня",
      deadlineIso: "2026-04-30T23:59:59",
      short: "Створи UX-орієнтований інтерфейс з акцентом на швидкість і читабельність.",
      details: {
        description: "Хакатон для front-end команд, що хочуть показати сучасну архітектуру UI та продуману взаємодію користувача з продуктом.",
        rules: ["Рішення має бути повністю респонсивним", "Оцінюється консистентність дизайн-рішень", "Потрібен сценарій основних user-flow"],
        criteria: ["UX-логіка", "Візуальна якість", "Стабільність верстки", "Продуктивність"],
        prizes: ["1 місце — 24 000 грн", "2 місце — 14 000 грн", "3 місце — 8 000 грн"]
      }
    }
  ];

  function readApplications() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  function saveApplications(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addApplication(payload) {
    const list = readApplications();
    list.push(payload);
    saveApplications(list);
  }

  function deleteApplication(applicationId) {
    const list = readApplications();
    const filtered = list.filter(function (item) {
      return item.id !== applicationId;
    });

    saveApplications(filtered);
  }

  window.AppData = {
    participants: participants,
    hackathons: hackathons,
    readApplications: readApplications,
    saveApplications: saveApplications,
    addApplication: addApplication,
    deleteApplication: deleteApplication
  };
})();
