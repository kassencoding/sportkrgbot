// Firebase Init
const firebaseConfig = {
  apiKey: "AIzaSyCZ4lC-EnTU3Z90RQZLEJnUq8373pW_G24",
  authDomain: "gid-sport.firebaseapp.com",
  projectId: "gid-sport",
  storageBucket: "gid-sport.firebasestorage.app",
  messagingSenderId: "632213586370",
  appId: "1:632213586370:web:668ce6a30aa9df8aa4565b",
  measurementId: "G-VBMP6CQ9Q7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// =================== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===================
let MODE = null; // 'employee' или 'guest'
let currentOrganization = null;
let currentDepartmentId = null;
let currentRole = null;

// База данных по должности (employeeDB[role] = [{title,text},...])
let employeeDB = {};
// Список поручений
let tasks = [];

// Текущий пользователь (сотрудник) и его чат
let currentUserId = null;
let aiChatHistory = [];

// Секретный пароль админа (скрытый вход в админ-панель)
const ADMIN_SECRET_PASSWORD = "superadmin09";

// Структура таблицы поручения
let table = {
    columns: [{ id: 0, title: "Колонка 1", type: "text" }],
    rows: [[""]]
};

// Новый стейт для выбора сотрудника
let currentEmployeeCategory = null; // 'management' | 'org' | 'region'
let currentUnitList = []; // список подразделений (отделов, организаций)
let currentUnit = null;   // выбранное подразделение
let selectedEmployee = null; // объект с данными выбранного сотрудника

// Тема интерфейса
let currentTheme = "light";

// =================== НАСТРОЙКИ ИНТЕРФЕЙСА (КНОПКИ) ===================
// Описываем все кнопки, которые админ может настраивать
const UI_BUTTONS = [
    { id: "employee_create_task", type: "employee", defaultLabel: "Создать поручение" },
    { id: "employee_tasks", type: "employee", defaultLabel: "Поручения" },
    { id: "employee_database", type: "employee", defaultLabel: "База данных" },
    { id: "employee_ai_assistant", type: "employee", defaultLabel: "ИИ-ассистент" },
    { id: "employee_profile", type: "employee", defaultLabel: "Профиль" },

    { id: "guest_ai", type: "guest", defaultLabel: "Спросить у ИИ" },
    { id: "guest_request", type: "guest", defaultLabel: "Запросить информацию" },
    { id: "guest_calendar", type: "guest", defaultLabel: "Календарь мероприятий" },
    { id: "guest_sections", type: "guest", defaultLabel: "Список спортивных секций" },
    { id: "guest_results", type: "guest", defaultLabel: "Действующие и старые результаты" },

    { id: "org_management", type: "org", defaultLabel: "Управление" },
    { id: "org_orgs", type: "org", defaultLabel: "Подведомственные организации" },
    { id: "org_regions", type: "org", defaultLabel: "Отделы спорта" }
];

let uiButtonsConfig = {}; // { [id]: { label, iconDataUrl } }

// Загрузка настроек интерфейса (пока из localStorage)
function loadUiButtonsConfig() {
    uiButtonsConfig = loadLocal("uiButtonsConfig", {});
}

// Сохранение настроек интерфейса
function saveUiButtonsConfig() {
    saveLocal("uiButtonsConfig", uiButtonsConfig);
}

// Применение настроек интерфейса к реальным кнопкам на экране
function applyUiButtonsConfig() {
    UI_BUTTONS.forEach(meta => {
        const cfg = uiButtonsConfig[meta.id];
        const btn = document.querySelector(`[data-button-id="${meta.id}"]`);
        if (!btn) return;

        const titleEl = btn.querySelector(".menu-btn-title");
        if (titleEl) {
            titleEl.textContent = (cfg && cfg.label) || meta.defaultLabel;
        }

        if (cfg && cfg.iconDataUrl) {
            const iconEl = btn.querySelector(".menu-btn-icon");
            if (iconEl) {
                iconEl.innerHTML = `<img src="${cfg.iconDataUrl}" width="26" height="26" />`;
            }
        }
    });
}


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

// Типовые должности для подведомственных организаций / отделов спорта
const ORG_ROLES = [
    "Руководитель организации",
    "Старший тренер",
    "Тренер",
    "Методист",
    "Администратор",
    "Специалист по спорту"
];

// =================== ТЕМА (СВЕТЛАЯ / ТЁМНАЯ) ===================
function applyTheme(theme) {
    currentTheme = theme === "dark" ? "dark" : "light";
    if (currentTheme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }

    // Обновляем иконки, если они есть
    const empIcon = document.getElementById("themeIconEmployee");
    const guestIcon = document.getElementById("themeIconGuest");
    const iconPath =
        currentTheme === "dark"
            ? "img/icon-theme-dark.svg"
            : "img/icon-theme-light.svg";

    if (empIcon) empIcon.src = iconPath;
    if (guestIcon) guestIcon.src = iconPath;

    saveLocal("uiTheme", currentTheme);
}

function initTheme() {
    const saved = loadLocal("uiTheme", "light");
    applyTheme(saved || "light");
}

function toggleTheme() {
    const next = currentTheme === "light" ? "dark" : "light";
    applyTheme(next);
}

// =================== ИНИЦИАЛИЗАЦИЯ ===================
window.onload = () => {
    // Глобальное состояние по сотрудникам будет подгружаться после выбора и входа
    employeeDB = {};
    tasks = [];

    const guestProfile = loadLocal("guestProfile", null);
    if (guestProfile) {
        document.getElementById("guestFio").value = guestProfile.fio || "";
        document.getElementById("guestPhone").value = guestProfile.phone || "";
        document.getElementById("guestIin").value = guestProfile.iin || "";
    }

    const guestAvatar = loadLocal("guestAvatar", null);
    if (guestAvatar) setGuestAvatar(guestAvatar);

    // Загружаем и применяем настройки интерфейса
    loadUiButtonsConfig();
    initTheme();
    applyUiButtonsConfig();

    showScreen("modeScreen");
};

// =================== ВЫБОР РЕЖИМА ===================
function selectMode(mode) {
    MODE = mode;
    if (mode === "employee") {
        // Новый поток: выбор категории сотрудника
        currentEmployeeCategory = null;
        currentUnitList = [];
        currentUnit = null;
        selectedEmployee = null;
        showScreen("employeeCategoryScreen");
    } else {
        // Гостевой режим
        showScreen("guestHome");
    }
}

// =================== НОВЫЙ ВЫБОР СОТРУДНИКА ===================

// Получаем главную организацию (управление)
function getMainOrg() {
    return ORGANIZATIONS.find(o => o.type === "main") || {
        type: "main",
        level: 0,
        name: "Управление физической культуры и спорта Карагандинской области"
    };
}

function selectEmployeeCategory(category) {
    // category: 'management' | 'org' | 'region'
    currentEmployeeCategory = category;
    currentUnitList = [];
    currentUnit = null;
    selectedEmployee = null;

    const titleEl = document.getElementById("employeeUnitTitle");
    const listEl = document.getElementById("employeeUnitList");
    if (!listEl) return;

    listEl.innerHTML = "";

    if (category === "management") {
        if (titleEl) titleEl.textContent = "Выбор отдела управления";

        currentUnitList = MAIN_DEPARTMENTS.map(d => ({
            type: "dept",
            id: d.id,
            name: d.name
        }));

    } else if (category === "org") {
        if (titleEl) titleEl.textContent = "Выбор подведомственной организации";

        currentUnitList = ORGANIZATIONS
            .filter(o => o.type === "org")
            .map(o => ({
                type: "org",
                org: o,
                name: o.name
            }));

    } else if (category === "region") {
        if (titleEl) titleEl.textContent = "Выбор отдела спорта";

        currentUnitList = ORGANIZATIONS
            .filter(o => o.type === "region")
            .map(o => ({
                type: "region",
                org: o,
                name: o.name
            }));
    }

    currentUnitList.forEach((u, idx) => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = u.name || (u.org && u.org.name) || "Подразделение";
        div.onclick = () => selectEmployeeUnit(idx);
        listEl.appendChild(div);
    });

    showScreen("employeeUnitScreen");
}

function backFromEmployeeUnit() {
    // Возврат к выбору категории
    showScreen("employeeCategoryScreen");
}

function selectEmployeeUnit(index) {
    if (index < 0 || index >= currentUnitList.length) return;
    currentUnit = currentUnitList[index];

    const titleEl = document.getElementById("employeePersonTitle");
    const listEl = document.getElementById("employeePersonList");
    if (!listEl) return;
    listEl.innerHTML = "";

    let persons = [];
    if (currentEmployeeCategory === "management") {
        const dept = MAIN_DEPARTMENTS.find(d => d.id === currentUnit.id);
        persons = dept ? dept.employees : [];
        if (titleEl) titleEl.textContent = "Выбор сотрудника отдела";
    } else {
        // Временно используем типовые роли
        persons = ORG_ROLES.slice();
        if (titleEl) titleEl.textContent = "Выбор должности";
    }

    persons.forEach(p => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.textContent = p;
        div.onclick = () => selectEmployeePerson(p);
        listEl.appendChild(div);
    });

    showScreen("employeePersonScreen");
}

function backFromEmployeePerson() {
    showScreen("employeeUnitScreen");
}

// Вспомогательная: получаем название организации для выбранного сотрудника
function getSelectedOrgName() {
    if (!currentEmployeeCategory) return "Организация";

    if (currentEmployeeCategory === "management") {
        const mainOrg = getMainOrg();
        return mainOrg.name;
    }

    if (currentUnit && currentUnit.org) {
        return currentUnit.org.name;
    }

    return "Организация";
}

// Генерация ключа для хранения пароля
function normalizeForKey(str) {
    return (str || "")
        .toString()
        .toLowerCase()
        .replace(/[()\.\,\s«»"'/№\-]+/g, "");
}

function extractFioFromEmployeeLine(line) {
    // Формат: "Должность (ФИО)"
    const text = (line || "").toString();
    const open = text.lastIndexOf("(");
    const close = text.lastIndexOf(")");
    if (open !== -1 && close !== -1 && close > open) {
        return text.substring(open + 1, close).trim();
    }
    return text.trim();
}

function getPasswordKeyForSelected() {
    if (!selectedEmployee) return null;
    const orgName = getSelectedOrgName();

    let base;
    if (currentEmployeeCategory === "management") {
        const fio = extractFioFromEmployeeLine(selectedEmployee.person);
        base = normalizeForKey(fio);
    } else {
        // Пока в подведомственных и отделах спорта у нас только роль
        base = normalizeForKey(selectedEmployee.person);
    }

    const orgKey = normalizeForKey(orgName);
    return `pass_${base}_${orgKey}`;
}


// Генерация userId для выбранного сотрудника (ФИО/должность + организация)
function getUserIdForSelected() {
    if (!selectedEmployee) return null;
    const orgName = getSelectedOrgName();

    let base;
    if (selectedEmployee.category === "management") {
        const fio = extractFioFromEmployeeLine(selectedEmployee.person);
        base = normalizeForKey(fio);
    } else {
        // Для подведомственных организаций пока используем должность
        base = normalizeForKey(selectedEmployee.person);
    }

    const orgKey = normalizeForKey(orgName);
    return `${base}_${orgKey}`;
}

// Ключи для localStorage под конкретного пользователя
function getEmployeeDBKey() {
    return currentUserId ? `employeeDB_${currentUserId}` : "employeeDB";
}
function getTasksKey() {
    return currentUserId ? `tasks_${currentUserId}` : "tasks";
}
function getAIChatKey() {
    if ((MODE === "employee" || MODE === "admin") && currentUserId) return `aiChat_${currentUserId}`;
    return "aiChat_guest";
}
function getEmployeeAvatarKey() {
    return currentUserId ? `employeeAvatar_${currentUserId}` : "employeeAvatar";
}

// Загрузка/сохранение базы данных сотрудника
function loadEmployeeDBForCurrentUser() {
    const key = getEmployeeDBKey();
    employeeDB = loadLocal(key, {});
}
function saveEmployeeDBForCurrentUser() {
    const key = getEmployeeDBKey();
    saveLocal(key, employeeDB);
}

// Загрузка/сохранение поручений сотрудника
function loadTasksForCurrentUser() {
    const key = getTasksKey();
    tasks = loadLocal(key, []);

    // Если поручений нет — создаём образцы (они будут индивидуальны для сотрудника)
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
        saveTasksForCurrentUser();
    }
}
function saveTasksForCurrentUser() {
    const key = getTasksKey();
    saveLocal(key, tasks);
}

// Загрузка/сохранение чата с ИИ
function loadAIChatForCurrentUser() {
    const key = getAIChatKey();
    aiChatHistory = loadLocal(key, []);

    const chat = document.getElementById("aiChat");
    if (!chat) return;
    chat.innerHTML = "";

    aiChatHistory.forEach(msg => {
        const div = document.createElement("div");
        div.className = "chat-message " + msg.type;
        div.innerHTML = `<div class="chat-bubble">${msg.text}</div>`;
        chat.appendChild(div);
    });
    chat.scrollTop = chat.scrollHeight;
}
function saveAIChatForCurrentUser() {
    const key = getAIChatKey();
    saveLocal(key, aiChatHistory);
}

function selectEmployeePerson(personText) {
    selectedEmployee = {
        category: currentEmployeeCategory,
        unit: currentUnit,
        person: personText
    };

    const orgLabel = document.getElementById("loginOrgLabel");
    const roleLabel = document.getElementById("loginRoleLabel");
    const orgName = getSelectedOrgName();

    if (orgLabel) orgLabel.textContent = orgName;
    if (roleLabel) roleLabel.textContent = personText;

    const passInput = document.getElementById("employeePasswordInput");
    if (passInput) passInput.value = "";

    showScreen("employeePasswordScreen");
}

function backFromPassword() {
    showScreen("employeePersonScreen");
}

function backFromCreatePassword() {
    showScreen("employeePasswordScreen");
}

// Вход сотрудника по паролю
function loginEmployee() {
    if (!selectedEmployee) {
        alert("Сначала выберите сотрудника.");
        return;
    }

    const passInput = document.getElementById("employeePasswordInput");
    if (!passInput) return;
    const pwd = passInput.value.trim();
    if (!pwd) {
        alert("Введите пароль.");
        return;
    }

    // ==== СКРЫТЫЙ ВХОД АДМИНА ПО СУПЕР-ПАРОЛЮ ====
    if (pwd === ADMIN_SECRET_PASSWORD) {
        enterAdminMode();
        return;
    }
    // ==== КОНЕЦ БЛОКА АДМИНА ====

    const key = getPasswordKeyForSelected();
    if (!key) {
        alert("Не удалось определить ключ пароля.");
        return;
    }

    const savedPwd = loadLocal(key, null);

    if (!savedPwd) {
        // Первый вход — нужен только пароль 123
        if (pwd !== "123") {
            alert("При первом входе используйте пароль 123.");
            return;
        }

        // Идём на экран создания нового пароля
        const orgLabel = document.getElementById("createPassOrgLabel");
        const roleLabel = document.getElementById("createPassRoleLabel");
        const orgName = getSelectedOrgName();

        if (orgLabel) orgLabel.textContent = orgName;
        if (roleLabel) roleLabel.textContent = selectedEmployee.person || "Сотрудник";

        const p1 = document.getElementById("employeeNewPassword1");
        const p2 = document.getElementById("employeeNewPassword2");
        if (p1) p1.value = "";
        if (p2) p2.value = "";

        showScreen("employeeCreatePasswordScreen");
        return;
    }

    // Сохранённый пароль уже есть — проверяем
    if (pwd !== savedPwd) {
        alert("Неверный пароль.");
        return;
    }

    // Успешный вход
    proceedEmployeeLoginAfterPassword();
}
// Сохранение нового пароля и вход
function saveNewEmployeePassword() {
    if (!selectedEmployee) {
        alert("Сначала выберите сотрудника.");
        return;
    }

    const p1 = document.getElementById("employeeNewPassword1");
    const p2 = document.getElementById("employeeNewPassword2");
    if (!p1 || !p2) return;

    const v1 = p1.value.trim();
    const v2 = p2.value.trim();

    if (!v1 || !v2) {
        alert("Введите новый пароль и его подтверждение.");
        return;
    }
    if (v1 !== v2) {
        alert("Пароли не совпадают.");
        return;
    }

    const key = getPasswordKeyForSelected();
    if (!key) {
        alert("Не удалось сохранить пароль.");
        return;
    }

    saveLocal(key, v1);
    alert("Пароль сохранён.");

    proceedEmployeeLoginAfterPassword();
}

// Общая логика после успешной проверки пароля
function proceedEmployeeLoginAfterPassword() {
    const orgName = getSelectedOrgName();
    const mainOrg = getMainOrg();

    if (currentEmployeeCategory === "management") {
        currentOrganization = mainOrg;
        currentDepartmentId = selectedEmployee.unit ? selectedEmployee.unit.id : null;
    } else if (selectedEmployee.unit && selectedEmployee.unit.org) {
        currentOrganization = selectedEmployee.unit.org;
        currentDepartmentId = null;
    } else {
        currentOrganization = mainOrg;
        currentDepartmentId = null;
    }

    MODE = "employee";

    // Выбранная "роль" — текст person
    const roleText = selectedEmployee.person || "Сотрудник";
    currentRole = roleText;

    // Устанавливаем текущего пользователя и подгружаем его данные
    currentUserId = getUserIdForSelected();
    loadEmployeeDBForCurrentUser();
    loadTasksForCurrentUser();
    loadAIChatForCurrentUser();

    // Обновляем шапку и профиль, как раньше делал selectRole
    const orgLabel = currentOrganization ? currentOrganization.name : orgName;

    document.getElementById("empOrg").textContent = orgLabel;
    document.getElementById("empRole").textContent = roleText;

    document.getElementById("profileOrg").textContent = orgLabel;
    document.getElementById("profileRole").textContent = roleText;

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
    const dataUrl = loadLocal(getEmployeeAvatarKey(), null);
    if (dataUrl) {
        setEmployeeAvatar(dataUrl);
    } else {
        const img = document.getElementById("employeeAvatarImg");
        const ph = document.getElementById("employeeAvatarPlaceholder");
        if (img && ph) {
            img.style.display = "none";
            ph.style.display = "block";
        }

        const img2 = document.getElementById("employeeAvatarImg_profile");
        const ph2 = document.getElementById("employeeAvatarPlaceholder_profile");
        if (img2 && ph2) {
            img2.style.display = "none";
            ph2.style.display = "block";
        }
    }
}

function triggerEmployeePhoto() {
    const input = document.getElementById("employeeAvatarInput");
    if (input) input.click();
}

function handleEmployeePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        saveLocal(getEmployeeAvatarKey(), dataUrl);
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
    const input = document.getElementById("guestAvatarInput");
    if (input) input.click();
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
    loadAIChatForCurrentUser();
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
    saveEmployeeDBForCurrentUser();
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
    saveEmployeeDBForCurrentUser();
}
function updateDbText(i, v) {
    employeeDB[currentRole][i].text = v;
    saveEmployeeDBForCurrentUser();
}

// =================== КОНТЕКСТ ДЛЯ ИИ ИЗ БАЗЫ СОТРУДНИКА ===================
function buildEmployeeContext() {
    if (!MODE || MODE !== "employee") return "";
    if (!currentRole || !employeeDB[currentRole] || employeeDB[currentRole].length === 0) return "";

    const sections = employeeDB[currentRole];
    const orgName = currentOrganization ? currentOrganization.name : "Организация не выбрана";
    const roleName = currentRole;

    const contextParts = sections.map(sec => {
        const title = (sec.title || "").trim();
        const text = (sec.text || "").trim();
        return `${title ? title + ": " : ""}${text}`;
    });

    const contextText = contextParts.join("\n\n");

    return `
Должность: ${roleName}
Организация: ${orgName}

Внутренняя база сотрудника (служебная информация):
${contextText}
    `.trim();
}

// =================== ИИ-ЧАТ ===================
async function sendAI() {
    const input = document.getElementById("aiMessage");
    const text = input.value.trim();
    if (!text) return;

    addAIMessage("user", text);
    input.value = "";

    let questionForBackend = text;
    const employeeContext = buildEmployeeContext();

    if (employeeContext) {
        questionForBackend =
            "Ниже предоставлен служебный контекст сотрудника Управления физической культуры и спорта Карагандинской области.\n" +
            "Отвечай, опираясь в первую очередь на эти данные. Если точной информации нет, делай аккуратные выводы и обязательно помечай, что это оценка.\n\n" +
            employeeContext +
            "\n\nВопрос сотрудника:\n" +
            text;
    } else if (MODE === "guest") {
        questionForBackend =
            "Ты — ИИ-ассистент гостевого режима Управления физической культуры и спорта Карагандинской области. " +
            "Отвечай населению кратко и официально. Вопрос:\n" +
            text;
    }

    try {
        const res = await fetch(
            "https://gidcity-ai-backend-production.up.railway.app/ask",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: questionForBackend })
            }
        );

        if (!res.ok) {
            console.error("Backend error:", res.status);
            addAIMessage("bot", generateAIAnswer(text));
            return;
        }

        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            console.error("JSON parse error:", e);
        }

        let answer = generateAIAnswer(text);

        if (data) {
            if (typeof data === "string") answer = data;
            else if (typeof data.answer === "string") answer = data.answer;
            else if (typeof data.response === "string") answer = data.response;
            else if (typeof data.reply === "string") answer = data.reply;
        }

        addAIMessage("bot", answer);
    } catch (err) {
        console.error("Fetch error:", err);
        addAIMessage("bot", generateAIAnswer(text));
    }
}

function addAIMessage(type, text) {
    const chat = document.getElementById("aiChat");
    const div = document.createElement("div");
    div.className = "chat-message " + type;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    // Сохраняем историю чата для текущего пользователя / гостя
    aiChatHistory.push({ type, text });
    saveAIChatForCurrentUser();
}

function generateAIAnswer(q) {
    const query = q.toLowerCase();

    if (MODE === "employee") {
        if (!currentRole || !employeeDB[currentRole] || employeeDB[currentRole].length === 0) {
            return "Для вашей должности база данных пока пустая. Заполните разделы в «База данных», чтобы ИИ мог опираться на ваши материалы.";
        }

        const sections = employeeDB[currentRole];

        const fullText = sections
            .map(s => ((s.title || "") + ". " + (s.text || "")))
            .join(" \n")
            .toLowerCase();

        if (fullText.includes(query)) {
            const matchedSections = sections.filter(s => {
                const t = ((s.title || "") + " " + (s.text || "")).toLowerCase();
                return t.includes(query);
            });

            const top = matchedSections.slice(0, 3).map(s => {
                const t = (s.text || "").trim();
                return `• ${s.title || "Раздел"} — ${t || "описание отсутствует"}`;
            });

            if (top.length > 0) {
                return (
                    "Нашёл информацию по вашему вопросу в вашей служебной базе данных:\n\n" +
                    top.join("\n\n") +
                    "\n\n(Ответ сгенерирован на основе ваших служебных разделов. При необходимости уточните данные в базе.)"
                );
            }
        }

        return "В вашей служебной базе данных точного ответа не нашлось. Дополните разделы в «База данных» или переформулируйте вопрос.";
    }

    // Гостевой режим — резервный ответ, если backend недоступен
    return "Сейчас ИИ-ассистент гостевого режима недоступен. Пожалуйста, попробуйте повторить запрос позже или обратитесь в Управление физической культуры и спорта Карагандинской области.";
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
    saveTasksForCurrentUser();

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
    currentEmployeeCategory = null;
    currentUnitList = [];
    currentUnit = null;
    selectedEmployee = null;
    currentUserId = null;
    aiChatHistory = [];
    const chat = document.getElementById("aiChat");
    if (chat) chat.innerHTML = "";
    showScreen("modeScreen");
}


// =================== РЕЖИМ АДМИНА ===================
function enterAdminMode() {
    MODE = "admin";
    currentUserId = "admin_master";

    currentOrganization = { name: "Админ-панель" };
    currentDepartmentId = null;
    currentRole = "Главный администратор";

    loadEmployeeDBForCurrentUser();
    loadTasksForCurrentUser();
    loadAIChatForCurrentUser();

    if (document.getElementById("empOrg")) document.getElementById("empOrg").textContent = "Админ-панель";
    if (document.getElementById("empRole")) document.getElementById("empRole").textContent = "Главный администратор";

    if (document.getElementById("profileOrg")) document.getElementById("profileOrg").textContent = "Админ-панель";
    if (document.getElementById("profileRole")) document.getElementById("profileRole").textContent = "Главный администратор";

    syncEmployeeAvatarProfile();
    showScreen("adminPanelScreen");
}

function openInterfaceSettings() {
    // Построение списка на экране настроек
    const container = document.getElementById("interfaceSettingsList");
    if (!container) {
        alert("Экран настроек интерфейса не найден.");
        return;
    }
    container.innerHTML = "";

    UI_BUTTONS.forEach(meta => {
        const cfg = uiButtonsConfig[meta.id] || {};
        const card = document.createElement("div");
        card.className = "card interface-card";
        card.innerHTML = `
            <div class="profile-label">Кнопка: ${meta.id}</div>
            <label>Подпись</label>
            <input type="text" value="${(cfg.label || meta.defaultLabel).replace(/"/g, '&quot;')}"
                   oninput="updateUiButtonLabel('${meta.id}', this.value)" />

            <label style="margin-top:8px;">Иконка</label>
            <div class="interface-icon-row">
                <button class="btn btn-secondary btn-small" onclick="triggerUiButtonIcon('${meta.id}')">
                    Выбрать иконку
                </button>
                <input type="file" accept="image/*" id="uiIconInput_${meta.id}"
                       style="display:none" onchange="handleUiButtonIconChange('${meta.id}', this)" />
                <div class="interface-icon-preview">
                    ${
                        cfg.iconDataUrl
                            ? `<img src="${cfg.iconDataUrl}" alt="icon" />`
                            : "<span class='hint'>По умолчанию</span>"
                    }
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    showScreen("interfaceSettingsScreen");
}

function updateUiButtonLabel(id, value) {
    if (!uiButtonsConfig[id]) uiButtonsConfig[id] = {};
    uiButtonsConfig[id].label = value;
    saveUiButtonsConfig();
    applyUiButtonsConfig();
}

function triggerUiButtonIcon(id) {
    const input = document.getElementById("uiIconInput_" + id);
    if (input) input.click();
}

function handleUiButtonIconChange(id, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        if (!uiButtonsConfig[id]) uiButtonsConfig[id] = {};
        uiButtonsConfig[id].iconDataUrl = reader.result;
        saveUiButtonsConfig();
        applyUiButtonsConfig();
        // Обновим превью
        openInterfaceSettings();
    };
    reader.readAsDataURL(file);
}


function sendAdminBroadcast() {
    const area = document.getElementById("adminBroadcastText");
    const text = area ? area.value.trim() : "";
    if (!text) {
        alert("Введите текст сообщения.");
        return;
    }

    const msgs = loadLocal("globalAdminMessages", []);
    msgs.push({ id: Date.now(), text, time: new Date().toISOString() });
    saveLocal("globalAdminMessages", msgs);

    alert("Сообщение сохранено локально.");
    if (area) area.value = "";
}



// ================= FIRESTORE UI SYNC (ADDED) =================

// Документ с настройками кнопок (общий для всех)
const uiDocRef = db.collection("settings").doc("uiButtons");

// Переопределяем загрузку настроек интерфейса
function loadUiButtonsConfig() {
    // Подпишемся на изменения из Firestore
    uiDocRef.onSnapshot((doc) => {
        const data = doc.exists ? doc.data() : {};
        uiButtonsConfig = data || {};
        // Кладём в localStorage как кеш
        saveLocal("uiButtonsConfig", uiButtonsConfig);
        applyUiButtonsConfig();
    }, (err) => {
        console.error("Firestore uiButtons onSnapshot error", err);
        // Резервный вариант — берём из localStorage
        uiButtonsConfig = loadLocal("uiButtonsConfig", {});
        applyUiButtonsConfig();
    });
}

// Переопределяем сохранение настроек интерфейса
function saveUiButtonsConfig() {
    // Локальный кеш
    saveLocal("uiButtonsConfig", uiButtonsConfig);
    // Отправляем в Firestore (общий документ)
    uiDocRef.set(uiButtonsConfig, { merge: true }).catch(err => {
        console.error("save uiButtons to Firestore error", err);
    });
}

// Переопределяем применение настроек к кнопкам (добавляем hidden и order)
function applyUiButtonsConfig() {
    UI_BUTTONS.forEach((meta, index) => {
        const id = meta.id;
        const cfg = uiButtonsConfig[id] || {};

        const btn = document.querySelector(`[data-button-id="${id}"]`);
        if (!btn) return;

        // Подпись
        const titleEl = btn.querySelector(".menu-btn-title");
        if (titleEl) {
            titleEl.textContent = cfg.label || meta.defaultLabel;
        }

        // Иконка
        const iconEl = btn.querySelector(".menu-btn-icon");
        if (iconEl && cfg.iconDataUrl) {
            iconEl.innerHTML = `<img src="${cfg.iconDataUrl}" width="26" height="26" />`;
        }

        // Скрытие
        if (cfg.hidden) {
            btn.style.display = "none";
        } else {
            btn.style.display = "";
        }

        // Порядок
        const order = typeof cfg.order === "number" ? cfg.order : index;
        btn.style.order = order;
    });
}

// Обновление подписи кнопки из экрана настроек
function updateUiButtonLabel(id, value) {
    if (!uiButtonsConfig[id]) uiButtonsConfig[id] = {};
    uiButtonsConfig[id].label = value;
    saveUiButtonsConfig();
}

// Переключение скрытия кнопки
function toggleUiButtonHidden(id, hidden) {
    if (!uiButtonsConfig[id]) uiButtonsConfig[id] = {};
    uiButtonsConfig[id].hidden = hidden;
    saveUiButtonsConfig();
}

// Перемещение кнопки вверх/вниз
function moveUiButton(id, delta) {
    // Собираем текущий список id по порядку
    const ids = UI_BUTTONS.map(b => b.id);
    // Сортируем по order
    ids.sort((a, b) => {
        const oa = (uiButtonsConfig[a] && typeof uiButtonsConfig[a].order === "number")
            ? uiButtonsConfig[a].order
            : ids.indexOf(a);
        const ob = (uiButtonsConfig[b] && typeof uiButtonsConfig[b].order === "number")
            ? uiButtonsConfig[b].order
            : ids.indexOf(b);
        return oa - ob;
    });

    const index = ids.indexOf(id);
    if (index < 0) return;

    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= ids.length) return;

    const tmp = ids[index];
    ids[index] = ids[newIndex];
    ids[newIndex] = tmp;

    ids.forEach((btnId, i) => {
        if (!uiButtonsConfig[btnId]) uiButtonsConfig[btnId] = {};
        uiButtonsConfig[btnId].order = i;
    });

    saveUiButtonsConfig();
}

// Загрузка иконки кнопки (base64 в Firestore)
function handleUiButtonIconChange(id, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        if (!uiButtonsConfig[id]) uiButtonsConfig[id] = {};
        uiButtonsConfig[id].iconDataUrl = reader.result;
        saveUiButtonsConfig();
        // Обновим экран, если открыт
        if (typeof openInterfaceSettings === "function") {
            openInterfaceSettings();
        }
    };
    reader.readAsDataURL(file);
}



// Ensure welcome mode buttons work: bind click handlers if missing
function bindModeButtons() {
  try {
    const emp = document.querySelector('.welcome-buttons .btn.btn-primary');
    const guest = document.querySelector('.welcome-buttons .btn.btn-secondary');
    if (emp && !emp.getAttribute('data-bound')) {
      emp.addEventListener('click', ()=> selectMode && selectMode('employee'));
      emp.setAttribute('data-bound','1');
    }
    if (guest && !guest.getAttribute('data-bound')) {
      guest.addEventListener('click', ()=> selectMode && selectMode('guest'));
      guest.setAttribute('data-bound','1');
    }
  } catch(e){ console.warn('bindModeButtons', e); }
}
// call on load
setTimeout(bindModeButtons, 300);

function changeLanguage(lang) {
  try { if (typeof saveLocal === 'function') saveLocal('uiLang', lang); } catch(e) {}
  if (typeof applyLanguage === 'function') applyLanguage(lang);
}


setTimeout(function(){ try{ applyThemeToggleIcon && applyThemeToggleIcon(); }catch(e){} }, 500);



/* HOTFIX: robust UI bindings, theme & language helpers (inserted by assistant) */
window.addEventListener('error', function(e){ try{ console.error('Global error:', e && e.message, 'at', e && (e.filename+':'+e.lineno)); }catch(_){}});
try{ if (typeof selectMode === 'function' && !window.selectMode) window.selectMode = selectMode; }catch(e){};
(function bindWelcomeButtonsRobust(){
  let attempts = 0;
  const maxAttempts = 30;
  const tryBind = function(){
    attempts++;
    const btnEmployee = document.getElementById('btnEmployeeMode') || document.querySelector('.welcome-buttons .btn.btn-primary');
    const btnGuest = document.getElementById('btnGuestMode') || document.querySelector('.welcome-buttons .btn.btn-secondary');
    if (btnEmployee && !btnEmployee.dataset.bound) {
      btnEmployee.addEventListener('click', function(e){ try{ (window.selectMode || selectMode) && (window.selectMode || selectMode)('employee'); }catch(err){ console.warn('selectMode error', err); } });
      btnEmployee.dataset.bound = '1';
    }
    if (btnGuest && !btnGuest.dataset.bound) {
      btnGuest.addEventListener('click', function(e){ try{ (window.selectMode || selectMode) && (window.selectMode || selectMode)('guest'); }catch(err){ console.warn('selectMode error', err); } });
      btnGuest.dataset.bound = '1';
    }
    if ((btnEmployee && btnEmployee.dataset.bound) && (btnGuest && btnGuest.dataset.bound)) return;
    if (attempts < maxAttempts) setTimeout(tryBind, 200);
    else console.warn('bindWelcomeButtonsRobust: elements not found after attempts');
  };
  setTimeout(tryBind, 150);
})();

function applyTheme(theme) {
  try {
    window.currentTheme = (theme === 'dark' ? 'dark' : 'light');
    if (window.currentTheme === 'dark') document.body.classList.add('dark'); else document.body.classList.remove('dark');
    const iconPath = (window.currentTheme === 'dark') ? 'img/icon-theme-dark.svg' : 'img/icon-theme-light.svg';
    const el1 = document.getElementById('themeIconEmployee') || document.getElementById('theme-icon');
    const el2 = document.getElementById('themeIconGuest');
    if (el1) try{ el1.src = iconPath; }catch(e){}
    if (el2) try{ el2.src = iconPath; }catch(e){}
    try { if (typeof saveLocal === 'function') saveLocal('uiTheme', window.currentTheme); } catch(e){}
  } catch(e){ console.warn('applyTheme error', e); }
}

function applyThemeToggleIconFromConfig() {
  try {
    const cfg = (window.uiButtonsConfig && (uiButtonsConfig['theme_toggle'] || uiButtonsConfig['theme']));
    const el = document.getElementById('themeIconEmployee') || document.getElementById('theme-icon') || document.querySelector('.theme-toggle-btn img');
    if (!el) return;
    if (cfg && cfg.iconDataUrl) el.src = cfg.iconDataUrl;
    else { const path = (window.currentTheme === 'dark') ? 'img/icon-theme-dark.svg' : 'img/icon-theme-light.svg'; el.src = path; }
  } catch(e){ console.warn('applyThemeToggleIconFromConfig', e); }
}

function applyLanguage(lang) {
  try {
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : (TRANSLATIONS && TRANSLATIONS.ru) || {};
    const wt = document.querySelector('.welcome-title'); if (wt && t.welcome_title) wt.textContent = t.welcome_title;
    const ws = document.querySelector('.welcome-subtitle'); if (ws && t.welcome_subtitle) ws.textContent = t.welcome_subtitle;
    const be = document.getElementById('btnEmployeeMode') || document.querySelector('.welcome-buttons .btn.btn-primary');
    const bg = document.getElementById('btnGuestMode') || document.querySelector('.welcome-buttons .btn.btn-secondary');
    if (be && t.btn_employee) be.textContent = t.btn_employee;
    if (bg && t.btn_guest) bg.textContent = t.btn_guest;
    try { const sel = document.getElementById('languageToggle'); if (sel) sel.value = lang; } catch(e){}
    if (t.ui_buttons && window.UI_BUTTONS) {
      UI_BUTTONS.forEach(meta => {
        const newLabel = t.ui_buttons[meta.id];
        if (newLabel) {
          const btn = document.querySelector('[data-button-id="'+meta.id+'"]');
          if (btn) { const titleEl = btn.querySelector('.menu-btn-title') || btn.querySelector('.menu-btn-text'); if (titleEl) titleEl.textContent = newLabel; }
        }
      });
    }
  } catch(e) { console.warn('applyLanguage error', e); }
}

function changeLanguage(lang) {
  try { if (!lang || (typeof TRANSLATIONS === 'undefined') || !TRANSLATIONS[lang]) lang = 'ru'; if (typeof saveLocal === 'function') saveLocal('uiLang', lang); applyLanguage(lang); } catch(e) { console.warn('changeLanguage error', e); }
}

try { const savedLang = (typeof loadLocal === 'function') ? loadLocal('uiLang','ru') : 'ru'; setTimeout(function(){ applyLanguage(savedLang); try{ applyThemeToggleIconFromConfig(); } catch(e){} }, 200); } catch(e) {}
/* end HOTFIX */
