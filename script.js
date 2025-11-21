// =================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===================
let MODE = null; // 'employee' или 'guest'
let currentOrganization = null;
let currentDepartmentId = null;
let currentRole = null;

// База данных по должности (employeeDB[role] = [{title,text},...])
let employeeDB = {};
// Список поручений
let tasks = [];

// Структура таблицы поручения
let table = {
    columns: [{ id: 0, title: "Колонка 1", type: "text" }],
    rows: [[""]]
};

// =================== УТИЛИТЫ LOCALSTORAGE ===================
function saveLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("Не удалось сохранить в localStorage", e);
    }
}
function loadLocal(key, def = null) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : def;
    } catch (e) {
        return def;
    }
}

// =================== ПОКАЗ ЭКРАНОВ ===================
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

// =================== ДАННЫЕ ОРГАНИЗАЦИЙ И СТРУКТУРЫ ===================

const ORGANIZATIONS = [
    { type: "main", level: 0, name: "Управление физической культуры и спорта Карагандинской области" },

    { type: "region", level: 1, name: "Отдел спорта г. Караганда" },
    { type: "region", level: 1, name: "Отдел спорта г. Темиртау" },
    { type: "region", level: 1, name: "Отдел спорта г. Балхаш" },
    { type: "region", level: 1, name: "Отдел спорта г. Сарань" },
    { type: "region", level: 1, name: "Отдел спорта г. Шахтинск" },
    { type: "region", level: 1, name: "Отдел спорта г. Приозерск" },
    { type: "region", level: 1, name: "Отдел спорта Абайского района" },
    { type: "region", level: 1, name: "Отдел спорта Актогайского района" },
    { type: "region", level: 1, name: "Отдел спорта Бухар-Жырауского района" },
    { type: "region", level: 1, name: "Отдел спорта Каркаралинского района" },
    { type: "region", level: 1, name: "Отдел спорта Осакаровского района" },
    { type: "region", level: 1, name: "Отдел спорта Нуринского района" },
    { type: "region", level: 1, name: "Отдел спорта Шетского района" },

    { type: "org", level: 2, name: "ОСДЮШОР №1" },
    { type: "org", level: 2, name: "ОСДЮШОР №2" },
    { type: "org", level: 2, name: "СДЮШОР №1" },
    { type: "org", level: 2, name: "ДЮСШ №1" },
    { type: "org", level: 2, name: "ДЮСШ №2" },
    { type: "org", level: 2, name: "ОСШИКОР" },
    { type: "org", level: 2, name: "ЦПОР" },
    { type: "org", level: 2, name: "ШВСМ (олимп.)" },
    { type: "org", level: 2, name: "ШВСМ (неолимп.)" },
    { type: "org", level: 2, name: "Центр массового и детского спорта" },
    { type: "org", level: 2, name: "Физкультурный диспансер" }
];

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
            "Главный специалист по организационной и правовой работе (Такирова Ш.Р.)"
        ]
    },
    {
        id: "economy",
        name: "Отдел экономики и финансового обеспечения",
        employees: [
            "Руководитель отдела экономики и финансового обеспечения (Кумисбек А.А.)"
        ]
    },
    {
        id: "highsport",
        name: "Отдел спорта высших достижений и спортивного резерва",
        employees: [
            "Руководитель отдела спорта высших достижений и спортивного резерва (Нокин Д.Б.)"
        ]
    },
    {
        id: "masssport",
        name: "Отдел физкультурно-массовой работы",
        employees: [
            "Руководитель отдела физкультурно-массовой работы (Әшірбек Н.Ж.)",
            "Главный специалист развития массового и инвалидного спорта (Тлеубеков Р.М.)",
            "Главный специалист развития спортивной инфраструктуры (Усенбеков С.С.)",
            "Прикомандированный специалист развития спортивной инфраструктуры (Касенов Е.К.)",
            "Прикомандированный специалист развития спортивной инфраструктуры (Жаппарова К.Т.)",
            "Прикомандированный специалист развития национальных видов спорта (Есмагамбетов М.М.)"
        ]
    }
];

// Типовые должности для подведомственных организаций
const ORG_ROLES = [
    "Руководитель организации",
    "Старший тренер",
    "Тренер",
    "Методист",
    "Администратор",
    "Специалист по спорту"
];

// =================== ИНИЦИАЛИЗАЦИЯ ===================
window.onload = () => {
    employeeDB = loadLocal("employeeDB", {});
    tasks = loadLocal("tasks", []);

    // Если поручений нет — создаём образцы
    if (!tasks || tasks.length === 0) {
        tasks = [
            {
                id: Date.now(),
                target: "Отдел спорта г. Караганда",
                targetPerson: "",
                description: "Подготовить отчёт о проведённых массовых мероприятиях за месяц",
                deadline: "2025-12-20",
                table: null
            },
            {
                id: Date.now() + 1,
                target: "ДЮСШ №1",
                targetPerson: "",
                description: "Предоставить информацию по тренерскому составу",
                deadline: "2025-12-25",
                table: null
            },
            {
                id: Date.now() + 2,
                target: "ОСДЮШОР №1",
                targetPerson: "",
                description: "Загрузить фотоотчёт о соревнованиях",
                deadline: "2026-01-05",
                table: null
            }
        ];
        saveLocal("tasks", tasks);
    }

    const guestProfile = loadLocal("guestProfile", null);
    if (guestProfile) {
        document.getElementById("guestFio").value = guestProfile.fio || "";
        document.getElementById("guestPhone").value = guestProfile.phone || "";
        document.getElementById("guestIin").value = guestProfile.iin || "";
    }

    const empAvatar = loadLocal("employeeAvatar", null);
    if (empAvatar) setEmployeeAvatar(empAvatar);

    const guestAvatar = loadLocal("guestAvatar", null);
    if (guestAvatar) setGuestAvatar(guestAvatar);

    showScreen("modeScreen");
};

// =================== ВЫБОР РЕЖИМА ===================
function selectMode(mode) {
    MODE = mode;
    if (mode === "employee") {
        buildOrganizationList();
        showScreen("orgSelectScreen");
    } else {
        showScreen("guestHome");
    }
}

// =================== ВЫБОР ОРГАНИЗАЦИИ ===================
function buildOrganizationList() {
    const container = document.getElementById("organizationList");
    container.innerHTML = "";
    ORGANIZATIONS.forEach(org => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = org.name;
        div.onclick = () => selectOrganization(org);
        container.appendChild(div);
    });
}

function selectOrganization(org) {
    currentOrganization = org;
    if (org.type === "main") {
        buildDepartmentList();
        showScreen("deptSelectScreen");
    } else {
        buildOrgRoles();
        showScreen("roleSelectScreen");
    }
}

// =================== ОТДЕЛЫ УПРАВЛЕНИЯ ===================
function buildDepartmentList() {
    const container = document.getElementById("departmentList");
    container.innerHTML = "";
    MAIN_DEPARTMENTS.forEach(dept => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = dept.name;
        div.onclick = () => selectDepartment(dept.id);
        container.appendChild(div);
    });
}

function selectDepartment(deptId) {
    currentDepartmentId = deptId;
    buildEmployeesForDepartment();
    showScreen("roleSelectScreen");
}

// =================== СОТРУДНИКИ ПО ОТДЕЛУ ===================
function buildEmployeesForDepartment() {
    const dept = MAIN_DEPARTMENTS.find(d => d.id === currentDepartmentId);
    const container = document.getElementById("roleList");
    container.innerHTML = "";
    if (!dept) return;

    dept.employees.forEach(emp => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = emp;
        div.onclick = () => selectRole(emp);
        container.appendChild(div);
    });
}

// =================== РОЛИ ДЛЯ ПОДВЕДОМСТВЕННЫХ ОРГАНИЗАЦИЙ ===================
function buildOrgRoles() {
    const container = document.getElementById("roleList");
    container.innerHTML = "";
    ORG_ROLES.forEach(r => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = r;
        div.onclick = () => selectRole(r);
        container.appendChild(div);
    });
}

// Назад из выбора роли
function backFromRole() {
    if (currentOrganization && currentOrganization.type === "main") {
        showScreen("deptSelectScreen");
    } else {
        showScreen("orgSelectScreen");
    }
}

// =================== ВЫБОР КОНКРЕТНОГО СОТРУДНИКА/РОЛИ ===================
function selectRole(role) {
    currentRole = role;

    const orgName = currentOrganization ? currentOrganization.name : "Организация";

    document.getElementById("empRole").textContent = role;
    document.getElementById("empOrg").textContent = orgName;

    document.getElementById("profileRole").textContent = role;
    document.getElementById("profileOrg").textContent = orgName;

    syncEmployeeAvatarProfile();

    showScreen("employeeHome");
}

// =================== АВАТАРЫ СОТРУДНИКА ===================
function setEmployeeAvatar(dataUrl) {
    const img = document.getElementById("employeeAvatarImg");
    const ph = document.getElementById("employeeAvatarPlaceholder");
    img.src = dataUrl;
    img.style.display = "block";
    ph.style.display = "none";

    // Профиль
    const img2 = document.getElementById("employeeAvatarImg_profile");
    const ph2 = document.getElementById("employeeAvatarPlaceholder_profile");
    if (img2 && ph2) {
        img2.src = dataUrl;
        img2.style.display = "block";
        ph2.style.display = "none";
    }
}

function syncEmployeeAvatarProfile() {
    const dataUrl = loadLocal("employeeAvatar", null);
    if (dataUrl) {
        setEmployeeAvatar(dataUrl);
    } else {
        const img = document.getElementById("employeeAvatarImg");
        const ph = document.getElementById("employeeAvatarPlaceholder");
        img.style.display = "none";
        ph.style.display = "block";

        const img2 = document.getElementById("employeeAvatarImg_profile");
        const ph2 = document.getElementById("employeeAvatarPlaceholder_profile");
        if (img2 && ph2) {
            img2.style.display = "none";
            ph2.style.display = "block";
        }
    }
}

function triggerEmployeePhoto() {
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

// =================== АВАТАРЫ ГОСТЯ ===================
function setGuestAvatar(dataUrl) {
    const img = document.getElementById("guestAvatarImg");
    const ph = document.getElementById("guestAvatarPlaceholder");
    img.src = dataUrl;
    img.style.display = "block";
    ph.style.display = "none";
}

function triggerGuestPhoto() {
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

// =================== НАВИГАЦИЯ СОТРУДНИКА ===================
function goEmployeeHome() {
    showScreen("employeeHome");
}
function openEmployeeProfile() {
    syncEmployeeAvatarProfile();
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

// =================== ГОСТЬ: НАВИГАЦИЯ ===================
function openGuestProfile() {
    showScreen("guestProfile");
}
function openGuestEvents() {
    showScreen("guestEvents");
}
function openGuestSections() {
    showScreen("guestSections");
}
function openGuestResults() {
    showScreen("guestResults");
}
function openGuestRequestInfo() {
    showScreen("guestRequest");
}

// =================== ПРОФИЛЬ ГОСТЯ ===================
function saveGuestProfile() {
    const fio = document.getElementById("guestFio").value.trim();
    const phone = document.getElementById("guestPhone").value.trim();
    const iin = document.getElementById("guestIin").value.trim();

    if (!fio || !phone || !iin) {
        alert("Заполните ФИО, телефон и ИИН");
        return;
    }

    saveLocal("guestProfile", { fio, phone, iin });
    alert("Профиль сохранён");
    showScreen("guestHome");
}

// Демонстрация отправки запроса
function sendGuestRequest() {
    const t = document.getElementById("guestRequestTitle").value.trim();
    const text = document.getElementById("guestRequestText").value.trim();
    if (!t || !text) {
        alert("Заполните тему и текст запроса");
        return;
    }
    alert("Запрос принят (демо). В реальной версии он отправится в Управление.");
    document.getElementById("guestRequestTitle").value = "";
    document.getElementById("guestRequestText").value = "";
    showScreen("guestHome");
}

// =================== БАЗА ДАННЫХ СОТРУДНИКА ===================
function getDefaultSectionsForRole(role) {
    const r = (role || "").toLowerCase();

    if (r.includes("инфраструктур")) {
        return [
            { title: "Паспорт спортивных объектов", text: "Список объектов, адрес, вместимость, профиль." },
            { title: "Состояние сооружений", text: "Текущие показатели, замечания, потребность в ремонте." },
            { title: "Строительство и ремонт", text: "Планы, сметы, этапы реализации." }
        ];
    }
    if (r.includes("массового") || r.includes("массовой") || r.includes("инвалидного")) {
        return [
            { title: "Массовые мероприятия", text: "Календарь массовых спортивных мероприятий." },
            { title: "Инвалидный спорт", text: "Программы, секции, участие людей с ОВЗ." },
            { title: "Охват населения", text: "Статистика по участникам и возрастным группам." }
        ];
    }
    if (r.includes("высших достижений") || r.includes("резерва")) {
        return [
            { title: "Сборные команды", text: "Состав, тренеры, календарь сборов." },
            { title: "Подготовка к стартам", text: "Планы тренировки, УТС, контрольные старты." },
            { title: "Результаты спортсменов", text: "Выступления на РК, ЧМ, ОИ и т.д." }
        ];
    }
    if (r.includes("экономики") || r.includes("финансового")) {
        return [
            { title: "Сметы и лимиты", text: "Годовые сметы по организациям и мероприятиям." },
            { title: "Освоение средств", text: "Фактические расходы, остатки, перераспределение." },
            { title: "Финансирование мероприятий", text: "Расходы по календарю соревнований." }
        ];
    }
    if (r.includes("кадров") || r.includes("кадровым")) {
        return [
            { title: "Штатное расписание", text: "Список должностей и занятость." },
            { title: "Кадровый резерв", text: "Перечень кандидатов и перспективных специалистов." },
            { title: "Обучение и повышение квалификации", text: "Курсы, семинары, аттестации." }
        ];
    }

    return [
        { title: "Общие сведения", text: "Краткая информация по вашему направлению." },
        { title: "Планы работы", text: "Основные задачи и плановые мероприятия." },
        { title: "Отчёты", text: "Итоговые отчёты и аналитика." }
    ];
}

function buildDatabaseList() {
    const container = document.getElementById("dbSectionList");
    container.innerHTML = "";

    if (!currentRole) return;

    if (!employeeDB[currentRole] || employeeDB[currentRole].length === 0) {
        employeeDB[currentRole] = getDefaultSectionsForRole(currentRole);
    }

    employeeDB[currentRole].forEach((sec, i) => {
        const div = document.createElement("div");
        div.className = "db-section";
        div.innerHTML = `
            <input type="text" value="${sec.title}" oninput="updateDbTitle(${i}, this.value)" />
            <textarea oninput="updateDbText(${i}, this.value)">${sec.text}</textarea>
        `;
        container.appendChild(div);
    });
    saveLocal("employeeDB", employeeDB);
}

function addDbSection() {
    if (!currentRole) {
        alert("Сначала выберите свою должность");
        return;
    }
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

// =================== ИИ-ЧАТ ===================
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
    div.className = "chat-message " + type;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function generateAIAnswer(q) {
    const query = q.toLowerCase();

    if (MODE === "employee") {
        if (!currentRole || !employeeDB[currentRole] || employeeDB[currentRole].length === 0) {
            return "Для вашей должности база данных пока пустая. Заполните разделы в «База данных».";
        }
        const text = employeeDB[currentRole]
            .map(s => s.title + ". " + s.text)
            .join(" ")
            .toLowerCase();
        if (text.includes(query)) {
            return "Нашёл информацию по вашему вопросу в базе данных:\n\n" +
                text.substring(0, 400) + (text.length > 400 ? "..." : "");
        }
        return "В вашей базе данных точного ответа не нашлось. Дополните разделы или переформулируйте вопрос.";
    }

    // Для гостя — пока демо-ответ
    return "ИИ-ассистент гостевого режима будет использовать обобщённые данные Управления. Пока это демо-ответ.";
}

function backFromAI() {
    if (MODE === "guest") showScreen("guestHome");
    else showScreen("employeeHome");
}

// =================== СОЗДАНИЕ ПОРУЧЕНИЙ + ТАБЛИЦА ===================
function openCreateTask() {
    buildTaskTargets();
    initTableEditor();
    showScreen("createTaskScreen");
}

// Специалист не может выбирать уровень выше своего
function buildTaskTargets() {
    const sel = document.getElementById("taskTarget");
    sel.innerHTML = "";

    if (!currentOrganization) return;

    const myLevel = currentOrganization.level ?? 1;

    ORGANIZATIONS.forEach(o => {
        if ((o.level ?? 1) >= myLevel) {
            const opt = document.createElement("option");
            opt.value = o.name;
            opt.textContent = o.name;
            sel.appendChild(opt);
        }
    });

    // если по какой-то причине список пуст — хотя бы своя организация
    if (!sel.value && currentOrganization) {
        const opt = document.createElement("option");
        opt.value = currentOrganization.name;
        opt.textContent = currentOrganization.name;
        sel.appendChild(opt);
    }
}

// инициализация таблицы
function initTableEditor() {
    table = {
        columns: [{ id: 0, title: "Колонка 1", type: "text" }],
        rows: [[""]]
    };
    renderTable();
}

function renderTable() {
    const container = document.getElementById("tableEditor");
    container.innerHTML = "";

    const t = document.createElement("table");

    // Header
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    table.columns.forEach((col, i) => {
        const th = document.createElement("th");
        th.innerHTML = `
            <input value="${col.title}" oninput="renameColumn(${i}, this.value)" />
            <select onchange="changeColumnType(${i}, this.value)">
                <option value="text" ${col.type === "text" ? "selected" : ""}>Текст</option>
                <option value="number" ${col.type === "number" ? "selected" : ""}>Число</option>
                <option value="date" ${col.type === "date" ? "selected" : ""}>Дата</option>
            </select>
        `;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    t.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    table.rows.forEach((row, ri) => {
        const tr = document.createElement("tr");
        row.forEach((cell, ci) => {
            const col = table.columns[ci];
            const typeAttr =
                col.type === "number" ? `type="number"` :
                col.type === "date" ? `type="date"` : `type="text"`;
            const valueAttr = col.type === "date" ? cell : cell;
            const td = document.createElement("td");
            td.innerHTML = `
                <input ${typeAttr} value="${valueAttr}" oninput="editCell(${ri}, ${ci}, this.value)" />
            `;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    t.appendChild(tbody);

    // Footer — суммы по числовым колонкам
    const hasNumberCols = table.columns.some(c => c.type === "number");
    if (hasNumberCols) {
        const tfoot = document.createElement("tfoot");
        const trSum = document.createElement("tr");
        table.columns.forEach((col, ci) => {
            const td = document.createElement("td");
            if (col.type === "number") {
                let sum = 0;
                table.rows.forEach(row => {
                    const raw = (row[ci] || "").toString().replace(",", ".");
                    const v = parseFloat(raw);
                    if (!isNaN(v)) sum += v;
                });
                td.textContent = "Σ " + sum;
            } else {
                td.textContent = "";
            }
            trSum.appendChild(td);
        });
        tfoot.appendChild(trSum);
        t.appendChild(tfoot);
    }

    container.appendChild(t);
}

function addTableRow() {
    const colsCount = table.columns.length;
    table.rows.push(Array(colsCount).fill(""));
    renderTable();
}

function addTableColumn() {
    const newId = table.columns.length;
    table.columns.push({ id: newId, title: "Колонка " + (newId + 1), type: "text" });
    table.rows = table.rows.map(r => [...r, ""]);
    renderTable();
}

function renameColumn(i, v) {
    table.columns[i].title = v;
}
function changeColumnType(i, v) {
    table.columns[i].type = v;
    renderTable();
}
function editCell(r, c, v) {
    table.rows[r][c] = v;
}

// Сохранение поручения
function saveTask() {
    const target = document.getElementById("taskTarget").value;
    const targetPerson = document.getElementById("taskTargetPerson").value.trim();
    const desc = document.getElementById("taskDescription").value.trim();
    const deadline = document.getElementById("taskDeadline").value;

    if (!desc) {
        alert("Введите описание поручения");
        return;
    }

    const task = {
        id: Date.now(),
        target,
        targetPerson,
        description: desc,
        deadline,
        table: JSON.parse(JSON.stringify(table))
    };

    tasks.push(task);
    saveLocal("tasks", tasks);

    alert("Поручение сохранено");
    showScreen("employeeHome");
}

// =================== СПИСОК ПОРУЧЕНИЙ ===================
function renderTasks() {
    const container = document.getElementById("tasksList");
    container.innerHTML = "";

    if (!tasks.length) {
        container.innerHTML = "<div class='task-meta'>Поручений пока нет.</div>";
        return;
    }

    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task-card";
        div.innerHTML = `
            <div class="task-title">${t.description}</div>
            <div class="task-meta">Кому: ${t.target}</div>
            <div class="task-meta">${t.targetPerson ? "Сотрудник: " + t.targetPerson : ""}</div>
            <div class="task-meta">Дедлайн: ${t.deadline || "не указан"}</div>
        `;
        container.appendChild(div);
    });
}

// =================== ВЫХОД СОТРУДНИКА ===================
function resetEmployee() {
    currentOrganization = null;
    currentRole = null;
    currentDepartmentId = null;
    MODE = null;
    showScreen("modeScreen");
}
