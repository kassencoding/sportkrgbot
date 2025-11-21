/* ============================================================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================================================ */

let MODE = null; // employee / guest

let currentOrganization = null;
let currentRole = null;

let employeeDB = {};        // данные сотрудников по разделам
let organizationDB = {};    // база данных организаций
let tasks = [];             // список поручений

let table = {
    columns: ["Колонка 1"],
    rows: [ [""] ]
};


/* ============================================================
   УТИЛИТЫ
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
   ЗАПУСК ПРИЛОЖЕНИЯ
============================================================ */

window.onload = () => {
    // загружаем локальные данные
    employeeDB = loadLocal("employeeDB", {});
    organizationDB = loadLocal("organizationDB", {});
    tasks = loadLocal("tasksList", []);

    const guestData = loadLocal("guestProfile", null);
    if (guestData) {
        document.getElementById("guestFio").value = guestData.fio;
        document.getElementById("guestPhone").value = guestData.phone;
        document.getElementById("guestIin").value = guestData.iin;
    }
};


/* ============================================================
   1. ВЫБОР РЕЖИМА
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
   2. СПИСКИ ОРГАНИЗАЦИЙ И ДОЛЖНОСТЕЙ
============================================================ */

// весь список организаций (по твоей структуре)
const ORGANIZATIONS = [
    { type: "main", name: "Управление физической культуры и спорта Карагандинской области" },

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

    // здесь 41 организация — кратко примеры:
    { type: "org", name: "ОСДЮШОР №1" },
    { type: "org", name: "ОСДЮШОР №2" },
    { type: "org", name: "ОСДЮШОР №3" },
    { type: "org", name: "СДЮШОР №1" },
    { type: "org", name: "СДЮШОР №2" },
    { type: "org", name: "ДЮСШ №1" },
    { type: "org", name: "ДЮСШ №2" },
    { type: "org", name: "ДЮСШ №3" },
    { type: "org", name: "ОСШИКОР" },
    { type: "org", name: "ЦПОР" },
    { type: "org", name: "ШВСМ (олимп.)" },
    { type: "org", name: "ШВСМ (неолимп.)" },
    { type: "org", name: "Центр массового спорта" },
    { type: "org", name: "Физкультурный диспансер" },
];


// должности управления
const ROLES_MAIN = [
    "Руководитель управления",
    "Заместитель руководителя",
    "Главный специалист по кадровым вопросам",
    "Главный специалист по организационно-правовой работе",
    "Руководитель отдела экономики",
    "Руководитель отдела спорта высших достижений",
    "Руководитель отдела физкультурно-массовой работы",
    "Главный специалист развития массового и инвалидного спорта",
    "Главный специалист развития спортивной инфраструктуры",
    "Прикомандированный специалист (Касенов Е.К.)",
    "Прикомандированный специалист (Жаппарова К.Т.)",
    "Прикомандированный специалист национальных видов спорта (Есмагамбетов М.М.)"
];

// должности для подведомственных организаций (пример)
const ORG_DEFAULT_ROLES = [
    "Руководитель организации",
    "Главный тренер",
    "Старший тренер",
    "Администратор",
    "Специалист по спорту",
    "Методист"
];


function showOrganizationList() {
    const container = document.getElementById("organizationList");
    container.innerHTML = "";

    ORGANIZATIONS.forEach(org => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${org.name}</div>
            <div class="list-item-sub">${org.type === "main" ? "Управление" :
                                        org.type === "region" ? "Регион" :
                                        "Организация"}</div>
        `;
        div.onclick = () => selectOrganization(org);
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

function showRolesForOrganization() {
    const container = document.getElementById("roleList");
    container.innerHTML = "";

    let roles = [];
    if (currentOrganization.includes("Управление")) roles = ROLES_MAIN;
    else roles = ORG_DEFAULT_ROLES;

    roles.forEach(role => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${role}</div>
            <div class="list-item-sub">Должность</div>
        `;
        div.onclick = () => selectRole(role);
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
   3. ПРОФИЛЬ ГОСТЯ
============================================================ */

function openGuestProfile() {
    showScreen("guestProfile");
}

function saveGuestProfile() {
    const fio = document.getElementById("guestFio").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const iin = document.getElementById("guestIin").value.trim();

    if (!fio || !phone || !iin) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    const data = { fio, phone, iin };
    saveLocal("guestProfile", data);

    alert("Данные сохранены");
    showScreen("guestHome");
}


/* ============================================================
   4. НИЖНЕЕ МЕНЮ СОТРУДНИКА
============================================================ */

function goEmployeeHome() {
    showScreen("employeeHome");
}

function openProfile() {
    showScreen("employeeProfile");
}

function openDatabase() {
    buildDatabaseList();
    showScreen("databaseScreen");
}

function openTasksScreen() {
    renderTasks();
    showScreen("tasksScreen");
}

function openAIChat() {
    showScreen("aiScreen");
}


/* ============================================================
   5. НИЖНЕЕ МЕНЮ ГОСТЯ
============================================================ */

function goGuestHome() {
    showScreen("guestHome");
}

function openGuestEvents() {
    alert("Данные мероприятий берутся из общей базы сотрудников");
}

function openGuestSections() {
    alert("Данные секций берутся из базы данных организации");
}

function openGuestResults() {
    alert("Результаты спортсменов берутся из базы сотрудников");
}


/* ============================================================
   6. БАЗА ДАННЫХ (СОТРУДНИК)
============================================================ */

function buildDatabaseList() {
    const container = document.getElementById("dbSectionList");
    container.innerHTML = "";

    if (!employeeDB[currentRole]) employeeDB[currentRole] = [];

    employeeDB[currentRole].forEach((sec, index) => {
        const div = document.createElement("div");
        div.className = "db-section";
        div.innerHTML = `
            <input 
                type="text" 
                value="${sec.title}" 
                oninput="updateDbTitle(${index}, this.value)"
            >
            <textarea oninput="updateDbText(${index}, this.value)">${sec.text}</textarea>
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

function updateDbTitle(index, value) {
    employeeDB[currentRole][index].title = value;
    saveLocal("employeeDB", employeeDB);
}

function updateDbText(index, value) {
    employeeDB[currentRole][index].text = value;
    saveLocal("employeeDB", employeeDB);
}


/* ============================================================
   7. ИИ ЧАТ
============================================================ */

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

function generateAIAnswer(q) {
    // ИИ ищет ответ в базе данных сотрудника
    let base = employeeDB[currentRole] || [];

    let allText = base.map(x => x.title + " " + x.text).join(" ");

    if (!allText.trim()) {
        return "База данных пока пуста. Добавьте информацию в профиль.";
    }

    if (q.length < 4) return "Уточните вопрос.";

    // просто ключевое совпадение
    if (allText.toLowerCase().includes(q.toLowerCase())) {
        return "Информация по вашему запросу присутствует в базе данных:\n\n" + allText.substring(0, 400);
    }

    return "Мне не удалось найти точную информацию в базе данных сотрудника.";
}

function backFromAI() {
    if (MODE === "guest") showScreen("guestHome");
    else showScreen("employeeHome");
}


/* ============================================================
   8. СОЗДАНИЕ ПОРУЧЕНИЯ + ТАБЛИЦА
============================================================ */

function openCreateTask() {
    initTableEditor();
    buildTaskTargets();
    showScreen("createTaskScreen");
}

function backFromCreateTask() {
    showScreen("employeeHome");
}

function buildTaskTargets() {
    const select = document.getElementById("taskTarget");
    select.innerHTML = "";

    ORGANIZATIONS.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.name;
        opt.textContent = o.name;
        select.appendChild(opt);
    });
}

function initTableEditor() {
    renderTable();
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

function renderTable() {
    const div = document.getElementById("tableEditor");
    div.innerHTML = "";

    const tableEl = document.createElement("table");

    // заголовок
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    table.columns.forEach((col, i) => {
        const th = document.createElement("th");
        th.innerHTML = `
            <input 
                value="${col}" 
                oninput="renameColumn(${i}, this.value)"
            >
        `;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    tableEl.appendChild(thead);

    // строки
    const tbody = document.createElement("tbody");
    table.rows.forEach((row, ri) => {
        const tr = document.createElement("tr");
        row.forEach((cell, ci) => {
            const td = document.createElement("td");
            td.innerHTML = `
                <input 
                    value="${cell}" 
                    oninput="editCell(${ri}, ${ci}, this.value)"
                >
            `;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    tableEl.appendChild(tbody);

    div.appendChild(tableEl);
}

function renameColumn(i, value) {
    table.columns[i] = value;
}

function editCell(r, c, value) {
    table.rows[r][c] = value;
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
    saveLocal("tasksList", tasks);

    alert("Поручение создано");

    showScreen("employeeHome");
    renderTasks();
}


/* ============================================================
   9. СПИСОК ПОРУЧЕНИЙ
============================================================ */

function renderTasks() {
    const list = document.getElementById("tasksList");
    list.innerHTML = "";

    tasks.forEach(t => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
            <div class="task-title">${t.description}</div>
            <div class="task-meta">Кому: ${t.target}</div>
            <div class="task-meta">Дедлайн: ${t.deadline}</div>
        `;
        list.appendChild(card);
    });
}


/* ============================================================
   10. ВЫХОД И СБРОС
============================================================ */

function resetEmployee() {
    currentRole = null;
    currentOrganization = null;
    showScreen("modeScreen");
}

function logout() {
    MODE = null;
    showScreen("modeScreen");
}
