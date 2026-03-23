(function () {
  function parseTxtKeyValue(content) {
    const lines = content.split(/\r?\n/);
    const payload = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line || line.indexOf("=") === -1) {
        continue;
      }

      const parts = line.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();

      if (key) {
        payload[key] = value;
      }
    }

    return payload;
  }

  function parseApplicationObject(rawObject) {
    if (!rawObject || typeof rawObject !== "object") {
      return null;
    }

    const obj = {
      name: String(rawObject.name || "").trim(),
      email: String(rawObject.email || "").trim(),
      hackathon: String(rawObject.hackathon || "").trim(),
      project: String(rawObject.project || "").trim(),
      idea: String(rawObject.idea || "").trim()
    };

    return obj;
  }

  function readTextFile(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();

      reader.onload = function () {
        resolve(String(reader.result || ""));
      };

      reader.onerror = function () {
        reject(new Error("Не вдалося прочитати файл"));
      };

      reader.readAsText(file, "utf-8");
    });
  }

  function fillForm(form, payload) {
    form.querySelector("#app-name").value = payload.name || "";
    form.querySelector("#app-email").value = payload.email || "";
    form.querySelector("#app-hackathon").value = payload.hackathon || "";
    form.querySelector("#app-project").value = payload.project || "";
    form.querySelector("#app-idea").value = payload.idea || "";
  }

  function clearInputStates(form) {
    const fields = form.querySelectorAll("input, select, textarea");

    for (let i = 0; i < fields.length; i++) {
      fields[i].classList.remove("input-error");
    }
  }

  function showFormMessage(form, text, isError) {
    const message = form.querySelector("#application-message");
    message.textContent = text;
    message.classList.toggle("message-error", isError);
    message.classList.toggle("message-success", !isError);
  }

  function setPreview(form, payload) {
    const preview = form.querySelector("#json-preview");

    if (!preview) {
      return;
    }

    if (!payload) {
      preview.textContent = "JSON-preview: файл не імпортовано";
      return;
    }

    preview.textContent = `JSON-preview:\n${JSON.stringify(payload, null, 2)}`;
  }

  function renderHackathonOptions(form) {
    const select = form.querySelector("#app-hackathon");

    if (!select) {
      return;
    }

    const currentValue = select.value;
    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Оберіть хакатон";
    select.appendChild(defaultOption);

    const data = window.AppData.hackathons;

    for (let i = 0; i < data.length; i++) {
      const option = document.createElement("option");
      option.value = data[i].title;
      option.textContent = data[i].title;
      select.appendChild(option);
    }

    if (currentValue) {
      select.value = currentValue;
    }
  }

  async function parseSelectedFile(form) {
    const fileInput = form.querySelector("#app-file");

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return null;
    }

    const file = fileInput.files[0];
    const fileName = file.name.toLowerCase();
    const content = await readTextFile(file);

    if (fileName.endsWith(".json")) {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error("JSON-масив порожній");
        }

        return parseApplicationObject(parsed[0]);
      }

      return parseApplicationObject(parsed);
    }

    if (fileName.endsWith(".txt")) {
      return parseApplicationObject(parseTxtKeyValue(content));
    }

    throw new Error("Дозволені тільки .json або .txt файли");
  }

  function validatePayload(form, payload) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fieldsMap = {
      name: form.querySelector("#app-name"),
      email: form.querySelector("#app-email"),
      hackathon: form.querySelector("#app-hackathon"),
      project: form.querySelector("#app-project"),
      idea: form.querySelector("#app-idea")
    };

    clearInputStates(form);

    if (!payload.name || !payload.email || !payload.hackathon || !payload.project || !payload.idea) {
      const keys = Object.keys(fieldsMap);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (!payload[key]) {
          fieldsMap[key].classList.add("input-error");
        }
      }

      return "Заповніть усі поля форми.";
    }

    if (!emailRegex.test(payload.email)) {
      fieldsMap.email.classList.add("input-error");
      return "Введіть коректний email.";
    }

    const existing = window.AppData.readApplications();

    for (let i = 0; i < existing.length; i++) {
      const sameEmail = existing[i].email.toLowerCase() === payload.email.toLowerCase();
      const sameHackathon = existing[i].hackathon === payload.hackathon;

      if (sameEmail && sameHackathon) {
        fieldsMap.email.classList.add("input-error");
        fieldsMap.hackathon.classList.add("input-error");
        return "Заявка з цим email для обраного хакатону вже існує.";
      }
    }

    return "";
  }

  function createApplicationPayload(form) {
    return {
      id: `app_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: form.querySelector("#app-name").value.trim(),
      email: form.querySelector("#app-email").value.trim(),
      hackathon: form.querySelector("#app-hackathon").value.trim(),
      project: form.querySelector("#app-project").value.trim(),
      idea: form.querySelector("#app-idea").value.trim(),
      status: "ПОДАНО",
      createdAt: new Date().toISOString()
    };
  }

  function bindApplicationForm(options) {
    const form = document.getElementById(options.formId || "application-form");

    if (!form) {
      return;
    }

    renderHackathonOptions(form);
    setPreview(form, null);

    const importButton = form.querySelector("#import-json-btn");
    const fileInput = form.querySelector("#app-file");

    if (importButton && fileInput) {
      importButton.addEventListener("click", function () {
        fileInput.click();
      });

      fileInput.addEventListener("change", async function () {
        try {
          const importedPayload = await parseSelectedFile(form);

          if (importedPayload) {
            fillForm(form, importedPayload);
            setPreview(form, importedPayload);
            showFormMessage(form, "Файл успішно імпортовано у форму.", false);
          }
        } catch (error) {
          setPreview(form, null);
          showFormMessage(form, error.message, true);
        }
      });
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        const importedPayload = await parseSelectedFile(form);

        if (importedPayload) {
          fillForm(form, importedPayload);
          setPreview(form, importedPayload);
        }
      } catch (error) {
        setPreview(form, null);
        showFormMessage(form, error.message, true);
        return;
      }

      const payload = createApplicationPayload(form);
      const errorText = validatePayload(form, payload);

      if (errorText) {
        showFormMessage(form, errorText, true);
        return;
      }

      window.AppData.addApplication(payload);
      showFormMessage(form, "Заявку успішно подано.", false);
      form.reset();
      setPreview(form, null);

      if (typeof options.onSuccess === "function") {
        options.onSuccess(payload);
      }
    });
  }

  window.FormModule = {
    bindApplicationForm: bindApplicationForm
  };
})();
