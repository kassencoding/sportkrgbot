/* ============================================================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
============================================================ */

let MODE = null; // employee / guest
let currentOrganization = null;
let currentDepartmentId = null;
let currentRole = null;

let employeeDB = {};
let tasks = [];

let table = {
    columns: ["Колонка 1"],
    rows: [[""]]
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
   ДАННЫЕ
============================================================ */

// Организации
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
    { type: "org", name: "Физкультурный диспансер" }
];

// Отделы Управления
const MAIN_DEPARTMENTS = [
    {
        id: "lead",
        name: "Руководство управления",
        employees: [
            "Руководитель управления (Сапиев С.Ж.)",
            "Заместитель руководителя (Есимханов Д.Ж.)"
        ]
    },
    {
        id: "hr",
        name: "Отдел кадров",
        employees: [
            "Главный специалист по кадровым вопросам (Жакаева Ж.Т.)"
        ]
    },
    {
        id: "org",
        name: "Организационно-правовой отдел",
        employees: [
            "Главный специалист по организационно-правовой работе (Такирова Ш.Р.)"
        ]
    },
    {
        id: "economy",
        name: "Отдел экономики и финансов",
        employees: [
            "Руководитель отдела экономики и финансового обеспечения (Кумисбек А.А.)"
        ]
    },
    {
        id: "highsport",
        name: "Отдел спорта высших достижений",
        employees: [
            "Руководитель отдела спорта высших достижений и спортивного резерва (Нокин Д.Б.)"
        ]
    },
    {
        id: "masssport",
        name: "Отдел массового спорта",
        employees: [
            "Руководитель отдела физкультурно-массовой работы (Әшірбек Н.Ж.)"
        ]
    }
];

// Должности для подведомственных
const ORG_ROLES = [
    "Руководитель организации",
    "Старший тренер",
    "Тренер",
    "Методист",
    "Администратор",
    "Специалист по спорту"
];


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

    const empAvatar = loadLocal("employeeAvatar", null);
    if (empAvatar) setEmployeeAvatar(empAvatar);

    const guestAvatar = loadLocal("guestAvatar", null);
    if (guestAvatar) setGuestAvatar(guestAvatar);
};


/* ============================================================
   ВЫБОР РЕЖИМА
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
   ВЫБОР ОРГАНИЗАЦИИ
============================================================ */

function showOrganizationList() {
    const container = document.getElementById("organizationList");
    container.innerHTML = "";

    ORGANIZATIONS.forEach(o => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${o.name}</div>
            <div class="list-item-sub">${
                o.type === "main" ? "Управление" :
                o.type === "region" ? "Региональный отдел" :
                "Подведомственная организация"
            }</div>
        `;
        div.onclick = () => selectOrganization(o);
        container.appendChild(div);
    });
}

function selectOrganization(org) {
    currentOrganization = org.name;
    if (org.type === "main") {
        showDepartments();
        showScreen("deptSelectScreen");
    } else {
        showRolesForOrg();
        showScreen("roleSelectScreen");
    }
}

function backToOrg() {
    showScreen("orgSelectScreen");
}


/* ============================================================
   ОТДЕЛЫ УПРАВЛЕНИЯ
============================================================ */

function showDepartments() {
    const container = document.getElementById("departmentList");
    container.innerHTML = "";

    MAIN_DEPARTMENTS.forEach(d => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${d.name}</div>
            <div class="list-item-sub">Отдел управления</div>
        `;
        div.onclick = () => selectDepartment(d.id);
        container.appendChild(div);
    });
}

function selectDepartment(deptId) {
    currentDepartmentId = deptId;
    showEmployeesForDepartment();
    showScreen("roleSelectScreen");
}


/* ============================================================
   СОТРУДНИКИ / РОЛИ
============================================================ */

function showEmployeesForDepartment() {
    const container = document.getElementById("roleList");
    container.innerHTML = "";

    const dept = MAIN_DEPARTMENTS.find(d => d.id === currentDepartmentId);
    if (!dept) return;

    dept.employees.forEach(e => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${e}</div>
            <div class="list-item-sub">Сотрудник отдела</div>
        `;
        div.onclick = () => selectRole(e);
        container.appendChild(div);
    });
}

function showRolesForOrg() {
    const container = document.getElementById("roleList");
    container.innerHTML = "";

    ORG_ROLES.forEach(r => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerHTML = `
            <div class="list-item-title">${r}</div>
            <div class="list-item-sub">Должность организации</div>
        `;
        div.onclick = () => selectRole(r);
        container.appendChild(div);
    });
}

function backFromRole() {
    if (currentOrganization && currentOrganization.includes("Управление")) {
        showScreen("deptSelectScreen");
    } else {
        showScreen("orgSelectScreen");
    }
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
   АВАТАРЫ
============================================================ */

function setEmployeeAvatar(dataUrl) {
    const img = document.getElementById("employeeAvatarImg");
    const ph = document.getElementById("employeeAvatarPlaceholder");
    img.src = dataUrl;
    img.style.display = "block";
    ph.style.display = "none";
}

function uploadEmployeePhoto() {
    document.getElementById("employeeAvatarInput").click();
}

function handleEmployeePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        saveLocal("employeeAvatar", dataUrl);
        setEmployeeAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
}

function setGuestAvatar(dataUrl) {
    const img = document.getElementById("guestAvatarImg");
    const ph = document.getElementById("guestAvatarPlaceholder");
    img.src = dataUrl;
    img.style.display = "block";
    ph.style.display = "none";
}

function uploadGuestPhoto() {
    document.getElementById("guestAvatarInput").click();
}

function handleGuestPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        saveLocal("guestAvatar", dataUrl);
        setGuestAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
}


/* ============================================================
   НАВИГАЦИЯ СОТРУДНИКА
============================================================ */

function goEmployeeHome() { showScreen("employeeHome"); }
function openProfile()    { showScreen("employeeProfile"); }
function openDatabase()   { buildDatabaseList(); showScreen("databaseScreen"); }
function openTasksScreen(){ renderTasks(); showScreen("tasksScreen"); }
function openAIChat()     { showScreen("aiScreen"); }


/* ============================================================
   ГОСТЬ
============================================================ */

function goGuestHome() {
    showScreen("guestHome");
}

function openGuestProfile() {
    showScreen("guestProfile");
}

function openGuestEvents() {
    alert("Список мероприятий будет формироваться из базы данных сотрудников.");
}

function openGuestSections() {
    alert("Секции и тренеры будут браться из базы организаций.");
}

function openGuestResults() {
    alert("Новости и результаты будут формироваться по данным из отчётов.");
}

function openGuestRequestInfo() {
    alert("Здесь позже можно сделать форму официального запроса информации.");
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
    alert("Данные сохранены");
    showScreen("guestHome");
}


/* ============================================================
   БАЗА ДАННЫХ СОТРУДНИКА
============================================================ */

function buildDatabaseList() {
    const container = document.getElementById("dbSectionList");
    container.innerHTML = "";

    if (!employeeDB[currentRole]) employeeDB[currentRole] = [];

    employeeDB[currentRole].forEach((sec, i) => {
        const div = document.createElement("div");
        div.className = "db-section";
        div.innerHTML = `
            <input type="text" value="${sec.title}" 
                   oninput="updateDbTitle(${i}, this.value)">
            <textarea oninput="updateDbText(${i}, this.value)">${sec.text}</textarea>
        `;
        container.appendChild(div);
    });

    saveLocal("employeeDB", employeeDB);
}

function addDbSection() {
    if (!employeeDB[currentRole]) employeeDB[currentRole] = [];
    employeeDB[currentRole].push({ title: "Новый раздел", text: "" });
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
   ИИ-ЧАТ
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
    }, 250);
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
    if (!currentRole || !employeeDB[currentRole] || employeeDB[currentRole].length === 0) {
        return "База данных для вашей должности пока пустая. Добавьте разделы в разделе «База данных».";
    }

    const text = employeeDB[currentRole]
        .map(s => `${s.title}. ${s.text}`)
        .join(" ")
        .toLowerCase();

    const query = q.toLowerCase();

    if (text.includes(query)) {
        return "Нашёл информацию по вашему вопросу в базе данных:\n\n" +
            text.substring(0, 350) + (text.length > 350 ? "..." : "");
    }

    return "К сожалению, точно по вашему запросу данных не нашлось. Попробуйте сформулировать по-другому или дополнить базу.";
}

function backFromAI() {
    if (MODE === "guest") showScreen("guestHome");
    else showScreen("employeeHome");
}


/* ============================================================
   СОЗДАНИЕ ПОРУЧЕНИЯ + ТАБЛИЦА
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
    const sel = document.getElementById("taskTarget");
    sel.innerHTML = "";
    ORGANIZATIONS.forEach(o => {
        const opt = document.createElement("option");
        opt.value = o.name;
        opt.textContent = o.name;
        sel.appendChild(opt);
    });
}

function initTableEditor() {
    table = { columns: ["Колонка 1"], rows: [[""]] };
    renderTable();
}

function renderTable() {
    const div = document.getElementById("tableEditor");
    div.innerHTML = "";

    const t = document.createElement("table");

    // заголовок
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    table.columns.forEach((c, i) => {
        const th = document.createElement("th");
        th.innerHTML = `<input value="${c}" oninput="renameColumn(${i}, this.value)">`;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    t.appendChild(thead);

    // строки
    const tbody = document.createElement("tbody");
    table.rows.forEach((row, ri) => {
        const trRow = document.createElement("tr");
        row.forEach((cell, ci) => {
            const td = document.createElement("td");
            td.innerHTML = `<input value="${cell}" oninput="editCell(${ri}, ${ci}, this.value)">`;
            trRow.appendChild(td);
        });
        tbody.appendChild(trRow);
    });
    t.appendChild(tbody);

    div.appendChild(t);
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
    const target = document.getElementById("taskTarget").value;
    const description = document.getElementById("taskDescription").value.trim();
    const deadline = document.getElementById("taskDeadline").value;

    if (!description) {
        alert("Введите описание поручения");
        return;
    }

    const task = {
        id: Date.now(),
        target,
        description,
        deadline,
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

    if (!tasks.length) {
        list.innerHTML = "<div class='task-meta'>Поручений пока нет.</div>";
        return;
    }

    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task-card";
        div.innerHTML = `
            <div class="task-title">${t.description}</div>
            <div class="task-meta">Кому: ${t.target}</div>
            <div class="task-meta">Дедлайн: ${t.deadline || "не указан"}</div>
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
    currentDepartmentId = null;
    showScreen("modeScreen");
}
