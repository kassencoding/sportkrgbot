/* ============================================================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================================================ */

let MODE = null; // employee / guest
let currentOrganization = null;
let currentRole = null;

let employeeDB = {};    // база данных сотрудника
let tasks = [];         // поручения

// Структура таблицы для поручения
let table = {
    columns: ["Колонка 1"],
    rows: [[""]]
};


/* ============================================================
   ХЕЛПЕРЫ
============================================================ */

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function saveLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadLocal(key, def = null) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
}


/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
============================================================ */

window.onload = () => {
    employeeDB = loadLocal("employeeDB", {});
    tasks = loadLocal("tasks", []);

    const guest = loadLocal("guestProfile", null);
    if (guest) {
        document.getElementById("guestFio").value = guest.fio;
        document.getElementById("guestPhone").value = guest.phone;
        document.getElementById("guestIin").value = guest.iin;
    }
};


/* ============================================================
   ВЫБОР РЕЖИМА (гость/сотрудник)
============================================================ */

function selectMode(mode) {
    MODE = mode;

    if (mode === "employee") {
        showOrganizationList();
        showScreen("orgSelectScreen");
    } else {
        showScreen("guestHome");
    }
}

function backToMode() {
    showScreen("modeScreen");
}


/* ============================================================
   СПИСОК ОРГАНИЗАЦИЙ
============================================================ */

const ORGANIZATIONS = [
    // Главное управление
    { type: "main", name: "Управление физической культуры и спорта Карагандинской области" },

    // 13 районных отделов
    { type: "region", name: "Отдел спорта г. Караганда" },
    { type: "region", name: "Отдел спорта г. Темиртау" },
    { type: "region", name: "Отдел спорта г. Балхаш" },
    { type: "region", name: "Отдел спорта г. Сарань" },
    { type: "region", name: "Отдел спорта г. Шахтинск" },
    { type: "region", name: "Отдел спорта г. Приозерск" },
    { type: "region", name: "Отдел спорта Абайского района" },
    { type: "region", name: "Отдел спорта Актогайского района" },
    { type: "region", name: "Отдел спорта Бухар-Жырауского района" },
    { type: "region", name: "Отдел спорта Каркаралинского района" },
    { type: "region", name: "Отдел спорта Осакаровского района" },
    { type: "region", name: "Отдел спорта Нуринского района" },
    { type: "region", name: "Отдел спорта Шетского района" },

    // Пример подведомственных
    { type: "org", name: "ОСДЮШОР №1" },
    { type: "org", name: "ОСДЮШОР №2" },
    { type: "org", name: "СДЮШОР №1" },
    { type: "org", name: "ДЮСШ №1" },
    { type: "org", name: "ДЮСШ №2" },
    { type: "org", name: "ОСШИКОР" },
    { type: "org", name: "ЦПОР" },
    { type: "org", name: "ШВСМ (олимп.)" },
    { type: "org", name: "ШВСМ (неолимп.)" },
    { type: "org", name: "Центр массового спорта" },
    { type: "org", name: "Физкультурный диспансер" },
];

function showOrganizationList() {
    const container = document.getElementById("organizationList");
    container.innerHTML = "";

    ORGANIZATIONS.forEach(o => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${o.name}</div>
            <div class="list-item-sub">${o.type === "main" ? "Управление" :
                                        o.type === "region" ? "Региональный отдел" :
                                        "Подведомственная организация"}</div>
        `;
        div.onclick = () => selectOrganization(o);
        container.appendChild(div);
    });
}

function selectOrganization(org) {
    currentOrganization = org.name;
    showRolesForOrganization();
    showScreen("roleSelectScreen");
}

function backToOrg() {
    showScreen("orgSelectScreen");
}


/* ============================================================
   СПИСОК ДОЛЖНОСТЕЙ
============================================================ */

const ROLES_MAIN = [
    "Руководитель управления",
    "Заместитель руководителя",
    "Главный специалист по кадровым вопросам",
    "Главный специалист по организационно-правовой работе",
    "Руководитель отдела экономики",
    "Руководитель отдела спорта высших достижений",
    "Руководитель отдела массового спорта",
    "Главный специалист развития массового и инвалидного спорта",
    "Главный специалист спортивной инфраструктуры",
    "Прикомандированный специалист (Касенов Е.К.)",
    "Прикомандированный специалист (Жаппарова К.Т.)",
    "Прикомандированный специалист национальных видов спорта (Есмагамбетов М.М.)"
];

const ROLES_ORG = [
    "Руководитель организации",
    "Старший тренер",
    "Тренер",
    "Методист",
    "Администратор",
    "Специалист по спорту"
];

function showRolesForOrganization() {
    const container = document.getElementById("roleList");
    container.innerHTML = "";

    let roles = currentOrganization.includes("Управление")
        ? ROLES_MAIN
        : ROLES_ORG;

    roles.forEach(r => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${r}</div>
            <div class="list-item-sub">Должность</div>
        `;
        div.onclick = () => selectRole(r);
        container.appendChild(div);
    });
}

function selectRole(role) {
    currentRole = role;

    document.getElementById("empRole").innerText = role;
    document.getElementById("empOrg").innerText = currentOrganization;
    document.getElementById("profileRole").innerText = role;
    document.getElementById("profileOrg").innerText = currentOrganization;

    showScreen("employeeHome");
}


/* ============================================================
   ПРОФИЛЬ ГОСТЯ
============================================================ */

function openGuestProfile() {
    showScreen("guestProfile");
}

function saveGuestProfile() {
    const fio = document.getElementById("guestFio").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const iin = document.getElementById("guestIin").value.trim();

    if (!fio || !phone || !iin) {
        alert("Заполните все поля");
        return;
    }

    saveLocal("guestProfile", { fio, phone, iin });

    alert("Сохранено");
    showScreen("guestHome");
}


/* ============================================================
   НИЖНЕЕ МЕНЮ СОТРУДНИКА
============================================================ */

function goEmployeeHome() { showScreen("employeeHome"); }
function openProfile()     { showScreen("employeeProfile"); }
function openTasksScreen() { renderTasks(); showScreen("tasksScreen"); }
function openAIChat()      { showScreen("aiScreen"); }
function openDatabase()    { buildDatabaseList(); showScreen("databaseScreen"); }


/* ============================================================
   НИЖНЕЕ МЕНЮ ГОСТЯ
============================================================ */

function goGuestHome() { showScreen("guestHome"); }


/* ============================================================
   БАЗА ДАННЫХ СОТРУДНИКА
============================================================ */

function buildDatabaseList() {
    const container = document.getElementById("dbSectionList");
    container.innerHTML = "";

    if (!employeeDB[currentRole]) employeeDB[currentRole] = [];

    employeeDB[currentRole].forEach((section, index) => {
        const div = document.createElement("div");
        div.className = "db-section";
        div.innerHTML = `
            <input type="text" value="${section.title}" 
                   oninput="updateDbTitle(${index}, this.value)">
            <textarea oninput="updateDbText(${index}, this.value)">${section.text}</textarea>
        `;
        container.appendChild(div);
    });

    saveLocal("employeeDB", employeeDB);
}

function addDbSection() {
    if (!employeeDB[currentRole]) employeeDB[currentRole] = [];

    employeeDB[currentRole].push({
        title: "Новый раздел",
        text: ""
    });

    buildDatabaseList();
}

function updateDbTitle(i, v) {
    employeeDB[currentRole][i].title = v;
    saveLocal("employeeDB", employeeDB);
}

function updateDbText(i, v) {
    employeeDB[currentRole][i].text = v;
    saveLocal("employeeDB", employeeDB);
}


/* ============================================================
   ИИ ЧАТ
============================================================ */

function backFromAI() {
    if (MODE === "guest") showScreen("guestHome");
    else showScreen("employeeHome");
}

function sendAI() {
    const input = document.getElementById("aiMessage");
    const text = input.value.trim();
    if (!text) return;

    addAIMessage("user", text);
    input.value = "";

    setTimeout(() => {
        const answer = generateAIAnswer(text);
        addAIMessage("bot", answer);
    }, 300);
}

function addAIMessage(type, text) {
    const chat = document.getElementById("aiChat");

    const div = document.createElement("div");
    div.className = `chat-message ${type}`;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function generateAIAnswer(question) {
    if (!employeeDB[currentRole] || employeeDB[currentRole].length === 0) {
        return "База данных пока пустая.";
    }

    let data = employeeDB[currentRole].map(s => s.title + " " + s.text).join(" ").toLowerCase();

    if (data.includes(question.toLowerCase())) {
        return "Информация найдена в базе данных:\n\n" + data.substring(0, 400);
    }

    return "К сожалению, информации по вашему запросу в базе данных нет.";
}


/* ============================================================
   СОЗДАНИЕ ПОРУЧЕНИЯ
============================================================ */

function openCreateTask() {
    buildTaskTargets();
    initTableEditor();
    showScreen("createTaskScreen");
}

function backFromCreateTask() {
    showScreen("employeeHome");
}

function buildTaskTargets() {
    const select = document.getElementById("taskTarget");
    select.innerHTML = "";

    ORGANIZATIONS.forEach(o => {
        const op = document.createElement("option");
        op.value = o.name;
        op.textContent = o.name;
        select.appendChild(op);
    });
}

function initTableEditor() {
    table = {
        columns: ["Колонка 1"],
        rows: [[""]]
    };
    renderTable();
}

function renderTable() {
    const div = document.getElementById("tableEditor");
    div.innerHTML = "";

    const tableEl = document.createElement("table");

    // Header
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    table.columns.forEach((col, i) => {
        const th = document.createElement("th");
        th.innerHTML = `<input value="${col}" oninput="renameColumn(${i}, this.value)">`;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    tableEl.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    table.rows.forEach((row, ri) => {
        const tr = document.createElement("tr");
        row.forEach((cell, ci) => {
            const td = document.createElement("td");
            td.innerHTML = `<input value="${cell}" oninput="editCell(${ri}, ${ci}, this.value)">`;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);

    div.appendChild(tableEl);
}

function addTableRow() {
    table.rows.push(Array(table.columns.length).fill(""));
    renderTable();
}

function addTableColumn() {
    table.columns.push("Колонка " + (table.columns.length + 1));
    table.rows = table.rows.map(r => [...r, ""]);
    renderTable();
}

function renameColumn(i, v) {
    table.columns[i] = v;
}

function editCell(r, c, v) {
    table.rows[r][c] = v;
}

function saveTask() {
    const task = {
        id: Date.now(),
        target: document.getElementById("taskTarget").value,
        description: document.getElementById("taskDescription").value,
        deadline: document.getElementById("taskDeadline").value,
        table: JSON.parse(JSON.stringify(table))
    };

    tasks.push(task);
    saveLocal("tasks", tasks);

    alert("Поручение сохранено");
    showScreen("employeeHome");
}


/* ============================================================
   СПИСОК ПОРУЧЕНИЙ
============================================================ */

function renderTasks() {
    const list = document.getElementById("tasksList");
    list.innerHTML = "";

    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task-card";
        div.innerHTML = `
            <div class="task-title">${t.description}</div>
            <div class="task-meta">Кому: ${t.target}</div>
            <div class="task-meta">Дедлайн: ${t.deadline}</div>
        `;
        list.appendChild(div);
    });
}


/* ============================================================
   ВЫХОД СОТРУДНИКА
============================================================ */

function resetEmployee() {
    currentOrganization = null;
    currentRole = null;
    showScreen("modeScreen");
}
