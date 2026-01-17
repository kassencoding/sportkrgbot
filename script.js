// script.js

// ================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==================
let currentTheme = 'dark';   // 'dark' | 'light'
let currentLang  = 'ru';     // 'ru' | 'kz'

// ================== ПЕРЕВОДЫ ==================
const translations = {
    ru: {
        app_title: "Департамент физической культуры и спорта Карагандинской области",
        welcome_title: "Добро пожаловать!",
        welcome_subtitle: "Пожалуйста, выберите режим работы приложения.",
        employee_mode: "Я сотрудник",
        guest_mode: "Я гость",
        theme: "Тема",
        language: "Язык",

        // Guest tabs
        guest_tab_ai: "AI помощник",
        guest_tab_sections: "Секции",
        guest_tab_events: "Мероприятия",
        guest_tab_news: "Новости",
        guest_tab_request: "Заявка",

        // Guest AI
        guest_ai_title: "AI помощник",
        guest_ai_placeholder: "Задайте свой вопрос о спорте или услугах...",
        guest_ai_send: "Отправить",
        guest_ai_empty: "Пожалуйста, введите вопрос.",

        // Sections
        guest_sections_title: "Спортивные секции",
        guest_sections_search_placeholder: "Поиск секции по виду спорта или району",
        guest_sections_filter: "Фильтры",

        // Events
        guest_events_title: "Спортивные мероприятия",
        guest_events_filter: "Фильтры",
        guest_events_see_all: "Смотреть все",

        // News
        guest_news_title: "Новости спорта",

        // Request
        guest_request_title: "Заявка на информацию",
        guest_request_name: "ФИО",
        guest_request_phone: "Телефон",
        guest_request_topic: "Тема обращения",
        guest_request_message: "Сообщение",
        guest_request_send: "Отправить заявку",

        // Employee login
        employee_login_title: "Вход для сотрудников",
        employee_login_iin: "ИИН",
        employee_login_password: "Пароль",
        employee_login_button: "Войти",
        employee_login_error: "Неверный ИИН или пароль.",

        // Employee bottom tabs
        emp_tab_home: "Главная",
        emp_tab_tasks: "Задачи",
        emp_tab_db: "База знаний",
        emp_tab_profile: "Профиль",

        // Employee home
        emp_home_title: "Главная",
        emp_home_quick_actions: "Быстрые действия",
        emp_home_action_new_task: "Новая задача",
        emp_home_action_ai: "AI помощник",
        emp_home_action_db: "База знаний",
        emp_home_stats_title: "Статистика",
        emp_home_stats_tasks: "Задачи",
        emp_home_stats_requests: "Обращения",
        emp_home_stats_answers: "Ответы AI",

        // Employee tasks
        emp_tasks_title: "Мои задачи",
        emp_tasks_filter_all: "Все",
        emp_tasks_filter_active: "Активные",
        emp_tasks_filter_done: "Завершенные",
        emp_tasks_empty: "Пока нет задач.",
        emp_task_create_title: "Создание задачи",
        emp_task_create_subject: "Тема",
        emp_task_create_desc: "Описание",
        emp_task_create_priority: "Приоритет",
        emp_task_create_executor: "Исполнитель",
        emp_task_create_button: "Создать задачу",
        emp_task_created_ok: "Задача успешно создана.",

        // Employee DB
        emp_db_title: "База знаний",
        emp_db_search_placeholder: "Поиск по вопросам и ответам",
        emp_db_add_article: "Добавить запись",
        emp_db_edit: "Редактировать",
        emp_db_delete: "Удалить",
        emp_db_empty: "Записей пока нет.",
        emp_db_form_title: "Новая / редактирование записи",
        emp_db_form_question: "Вопрос",
        emp_db_form_answer: "Ответ",
        emp_db_form_tags: "Теги (через запятую)",
        emp_db_form_save: "Сохранить",
        emp_db_saved_ok: "Запись сохранена.",

        // Employee profile
        emp_profile_title: "Профиль",
        emp_profile_name: "ФИО",
        emp_profile_role: "Должность",
        emp_profile_region: "Регион / отдел",
        emp_profile_logout: "Выйти",

        // Common AI (employee side)
        emp_ai_title: "AI помощник сотрудника",
        emp_ai_placeholder: "Сформулируйте вопрос для AI...",
        emp_ai_send: "Отправить"
    },

    kz: {
        app_title: "Қарағанды облысының дене шынықтыру және спорт департаменті",
        welcome_title: "Қош келдіңіз!",
        welcome_subtitle: "Өтінеміз, қолдану режимін таңдаңыз.",
        employee_mode: "Мен қызметкермін",
        guest_mode: "Мен қонақпын",
        theme: "Тақырып",
        language: "Тіл",

        guest_tab_ai: "AI көмекші",
        guest_tab_sections: "Секциялар",
        guest_tab_events: "Іс-шаралар",
        guest_tab_news: "Жаңалықтар",
        guest_tab_request: "Өтініш",

        guest_ai_title: "AI көмекші",
        guest_ai_placeholder: "Спорт немесе қызметтер туралы сұрағыңызды қойыңыз...",
        guest_ai_send: "Жіберу",
        guest_ai_empty: "Өтінеміз, сұрақты жазыңыз.",

        guest_sections_title: "Спорт секциялары",
        guest_sections_search_placeholder: "Спорт түрі немесе аудан бойынша іздеу",
        guest_sections_filter: "Сүзгілер",

        guest_events_title: "Спорт іс-шаралары",
        guest_events_filter: "Сүзгілер",
        guest_events_see_all: "Барлығын көру",

        guest_news_title: "Спорт жаңалықтары",

        guest_request_title: "Ақпаратқа өтініш",
        guest_request_name: "Аты-жөні",
        guest_request_phone: "Телефон",
        guest_request_topic: "Өтініш тақырыбы",
        guest_request_message: "Хабарлама",
        guest_request_send: "Өтінішті жіберу",

        employee_login_title: "Қызметкерлерге кіру",
        employee_login_iin: "ЖСН",
        employee_login_password: "Құпиясөз",
        employee_login_button: "Кіру",
        employee_login_error: "ЖСН немесе құпиясөз қате.",

        emp_tab_home: "Басты",
        emp_tab_tasks: "Тапсырмалар",
        emp_tab_db: "Білім базасы",
        emp_tab_profile: "Профиль",

        emp_home_title: "Басты",
        emp_home_quick_actions: "Жылдам әрекеттер",
        emp_home_action_new_task: "Жаңа тапсырма",
        emp_home_action_ai: "AI көмекші",
        emp_home_action_db: "Білім базасы",
        emp_home_stats_title: "Статистика",
        emp_home_stats_tasks: "Тапсырмалар",
        emp_home_stats_requests: "Өтініштер",
        emp_home_stats_answers: "AI жауаптары",

        emp_tasks_title: "Менің тапсырмаларым",
        emp_tasks_filter_all: "Барлығы",
        emp_tasks_filter_active: "Белсенді",
        emp_tasks_filter_done: "Аяқталған",
        emp_tasks_empty: "Әзірге тапсырмалар жоқ.",
        emp_task_create_title: "Тапсырма құру",
        emp_task_create_subject: "Тақырып",
        emp_task_create_desc: "Сипаттама",
        emp_task_create_priority: "Басымдық",
        emp_task_create_executor: "Орындаушы",
        emp_task_create_button: "Тапсырма құру",
        emp_task_created_ok: "Тапсырма сәтті құрылды.",

        emp_db_title: "Білім базасы",
        emp_db_search_placeholder: "Сұрақтар мен жауаптар бойынша іздеу",
        emp_db_add_article: "Жазба қосу",
        emp_db_edit: "Өңдеу",
        emp_db_delete: "Жою",
        emp_db_empty: "Әзірге жазбалар жоқ.",
        emp_db_form_title: "Жаңа / өңдеу жазбасы",
        emp_db_form_question: "Сұрақ",
        emp_db_form_answer: "Жауап",
        emp_db_form_tags: "Тегтер (үтір арқылы)",
        emp_db_form_save: "Сақтау",
        emp_db_saved_ok: "Жазба сақталды.",

        emp_profile_title: "Профиль",
        emp_profile_name: "Аты-жөні",
        emp_profile_role: "Лауазым",
        emp_profile_region: "Өңір / бөлім",
        emp_profile_logout: "Шығу",

        emp_ai_title: "Қызметкердің AI көмекшісі",
        emp_ai_placeholder: "AI үшін сұрақты жазыңыз...",
        emp_ai_send: "Жіберу"
    }
};

// ================== ИНИЦИАЛИЗАЦИЯ ==================
document.addEventListener('DOMContentLoaded', () => {
    initMainScreen();
    initThemeToggle();
    initLanguageToggle();
    initGuestMode();
    initEmployeeMode();
    applyTheme();
    applyTranslations();
});

// ================== ОСНОВНОЙ ЭКРАН ==================
function initMainScreen() {
    const btnEmployee = document.getElementById('btnEmployeeMode');
    const btnGuest    = document.getElementById('btnGuestMode');

    if (btnEmployee) {
        btnEmployee.addEventListener('click', () => {
            showScreen('employeeLoginScreen');
        });
    }

    if (btnGuest) {
        btnGuest.addEventListener('click', () => {
            showScreen('guestScreen');
        });
    }
}

function showScreen(screenId) {
    const allScreens = document.querySelectorAll('.app-screen');
    allScreens.forEach(s => s.classList.add('hidden'));

    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// ================== ТЕМА (ТЁМНАЯ / СВЕТЛАЯ) ==================
function initThemeToggle() {
    const themeToggles = document.querySelectorAll('[data-theme-toggle]');

    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme();
        });
    });
}

function applyTheme() {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
        root.classList.remove('light-theme');
        root.classList.add('dark-theme');
    } else {
        root.classList.remove('dark-theme');
        root.classList.add('light-theme');
    }

    // Иконка солнце/луна
    const iconUrl = currentTheme === 'dark'
        ? 'https://api.iconify.design/ph/sun-bold.svg?color=white'
        : 'https://api.iconify.design/ph/moon-bold.svg?color=%23222';

    document.querySelectorAll('.theme-icon').forEach(img => {
        img.src = iconUrl;
    });
}

// ================== ЯЗЫК (RU / KZ) ==================
function initLanguageToggle() {
    const langButtons = document.querySelectorAll('[data-lang]');

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (!lang || !translations[lang]) return;
            currentLang = lang;
            applyTranslations();
        });
    });
}

function applyTranslations() {
    const t = translations[currentLang];

    // Текст по data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Placeholder'ы
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    // Активная подсветка кнопок языка
    const langButtons = document.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('lang-active');
        } else {
            btn.classList.remove('lang-active');
        }
    });
}

// ================== ГОСТЕВОЙ РЕЖИМ ==================
function initGuestMode() {
    initGuestTabs();
    initGuestAI();
    initGuestRequestForm();
}

function initGuestTabs() {
    const tabButtons = document.querySelectorAll('.guest-tab-button');
    const tabScreens = document.querySelectorAll('.guest-tab-screen');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabScreens.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const targetScreen = document.getElementById(target);
            if (targetScreen) targetScreen.classList.remove('hidden');
        });
    });

    // По умолчанию – AI вкладка
    const first = document.querySelector('.guest-tab-button');
    if (first) first.click();
}

function initGuestAI() {
    const input    = document.getElementById('guestAiInput');
    const btnSend  = document.getElementById('guestAiSend');
    const chatBody = document.getElementById('guestAiChatBody');

    if (!input || !btnSend || !chatBody) return;

    btnSend.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) {
            alert(translations[currentLang].guest_ai_empty);
            return;
        }

        appendChatMessage(chatBody, 'user', text);
        input.value = "";
        askBackendAI(text, 'guest')
            .then(answer => appendChatMessage(chatBody, 'ai', answer))
            .catch(() => appendChatMessage(chatBody, 'ai',
                "К сожалению, сейчас сервер недоступен. Попробуйте позже."
            ));
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnSend.click();
        }
    });
}

function appendChatMessage(container, role, text) {
    const msg = document.createElement('div');
    msg.classList.add('chat-message', role === 'user' ? 'chat-user' : 'chat-ai');
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function askBackendAI(question, mode) {
    // Заготовка под настоящий бекенд:
    // const apiUrl = 'https://gidcity-ai-backend-production.up.railway.app/ask';
    //
    // return fetch(apiUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ question, mode })
    // })
    // .then(res => res.json())
    // .then(data => data.answer || 'Нет ответа от AI.');

    // Пока просто фейковый ответ:
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('AI: (демо-ответ) Ваш вопрос получен и будет обработан.');
        }, 500);
    });
}

function initGuestRequestForm() {
    const form   = document.getElementById('guestRequestForm');
    const name   = document.getElementById('guestRequestName');
    const phone  = document.getElementById('guestRequestPhone');
    const topic  = document.getElementById('guestRequestTopic');
    const msg    = document.getElementById('guestRequestMessage');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Здесь можно отправить данные на ваш сервер
        console.log('Guest request:', {
            name:  name?.value,
            phone: phone?.value,
            topic: topic?.value,
            msg:   msg?.value
        });

        alert('Заявка отправлена. Спасибо!');
        form.reset();
    });
}

// ================== РЕЖИМ СОТРУДНИКА ==================
function initEmployeeMode() {
    initEmployeeLogin();
    initEmployeeTabs();
    initEmployeeAI();
    initEmployeeCreateTask();
    initEmployeeDBForm();
}

function initEmployeeLogin() {
    const form   = document.getElementById('employeeLoginForm');
    const iin    = document.getElementById('employeeLoginIIN');
    const pass   = document.getElementById('employeeLoginPassword');
    const error  = document.getElementById('employeeLoginError');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Заглушка: любой ИИН и пароль считаем валидными,
        // но можно добавить свою проверку
        if (!iin.value.trim() || !pass.value.trim()) {
            error.textContent = translations[currentLang].employee_login_error;
            error.classList.remove('hidden');
            return;
        }

        error.classList.add('hidden');
        showScreen('employeeMainScreen');
        // По умолчанию показываем вкладку "Главная"
        const firstTab = document.querySelector('.emp-tab-button');
        if (firstTab) firstTab.click();
    });
}

function initEmployeeTabs() {
    const tabButtons = document.querySelectorAll('.emp-tab-button');
    const tabScreens = document.querySelectorAll('.emp-tab-screen');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabScreens.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const targetScreen = document.getElementById(target);
            if (targetScreen) targetScreen.classList.remove('hidden');
        });
    });
}

function initEmployeeAI() {
    const input    = document.getElementById('empAiInput');
    const btnSend  = document.getElementById('empAiSend');
    const chatBody = document.getElementById('empAiChatBody');

    if (!input || !btnSend || !chatBody) return;

    btnSend.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        appendChatMessage(chatBody, 'user', text);
        input.value = "";
        askBackendAI(text, 'employee')
            .then(answer => appendChatMessage(chatBody, 'ai', answer))
            .catch(() => appendChatMessage(chatBody, 'ai',
                "К сожалению, сейчас сервер недоступен. Попробуйте позже."
            ));
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnSend.click();
        }
    });
}

// Создание задач (упрощённо, без реального сервера)
function initEmployeeCreateTask() {
    const form      = document.getElementById('empCreateTaskForm');
    const tasksList = document.getElementById('empTasksList');

    if (!form || !tasksList) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const subject   = form.querySelector('#empTaskSubject').value.trim();
        const desc      = form.querySelector('#empTaskDesc').value.trim();
        const priority  = form.querySelector('#empTaskPriority').value;
        const executor  = form.querySelector('#empTaskExecutor').value.trim();

        if (!subject) return;

        // В реальности отправляем на сервер, а тут просто добавляем карточку
        const card = document.createElement('div');
        card.classList.add('emp-task-card');
        card.innerHTML = `
            <div class="emp-task-card-header">
                <span class="emp-task-subject">${subject}</span>
                <span class="emp-task-priority emp-priority-${priority.toLowerCase()}">${priority}</span>
            </div>
            <div class="emp-task-card-body">
                <p>${desc}</p>
                <p class="emp-task-executor">Исполнитель: ${executor || 'Не назначен'}</p>
            </div>
        `;
        tasksList.prepend(card);

        alert(translations[currentLang].emp_task_created_ok);
        form.reset();
    });
}

// Работа с базой знаний (локальная имитация)
let empDbItems = [];
let empDbEditingIndex = null;

function initEmployeeDBForm() {
    const form      = document.getElementById('empDbForm');
    const list      = document.getElementById('empDbList');
    const searchInp = document.getElementById('empDbSearch');

    if (!form || !list) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q    = form.querySelector('#empDbQuestion').value.trim();
        const a    = form.querySelector('#empDbAnswer').value.trim();
        const tags = form.querySelector('#empDbTags').value.trim();

        if (!q || !a) return;

        const item = { question: q, answer: a, tags };
        if (empDbEditingIndex === null) {
            empDbItems.push(item);
        } else {
            empDbItems[empDbEditingIndex] = item;
            empDbEditingIndex = null;
        }

        renderEmpDbList();
        alert(translations[currentLang].emp_db_saved_ok);
        form.reset();
    });

    if (searchInp) {
        searchInp.addEventListener('input', () => {
            renderEmpDbList(searchInp.value.trim());
        });
    }

    renderEmpDbList();
}

function renderEmpDbList(search = '') {
    const list = document.getElementById('empDbList');
    if (!list) return;

    list.innerHTML = '';

    const filtered = empDbItems.filter(item => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            item.question.toLowerCase().includes(s) ||
            item.answer.toLowerCase().includes(s) ||
            item.tags.toLowerCase().includes(s)
        );
    });

    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.classList.add('emp-db-empty');
        empty.textContent = translations[currentLang].emp_db_empty;
        list.appendChild(empty);
        return;
    }

    filtered.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('emp-db-card');
        card.innerHTML = `
            <h4>${item.question}</h4>
            <p>${item.answer}</p>
            <div class="emp-db-tags">${item.tags}</div>
            <div class="emp-db-actions">
                <button class="btn-small" data-action="edit" data-index="${index}">
                    ${translations[currentLang].emp_db_edit}
                </button>
                <button class="btn-small btn-danger" data-action="delete" data-index="${index}">
                    ${translations[currentLang].emp_db_delete}
                </button>
            </div>
        `;
        list.appendChild(card);
    });

    list.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const idx    = parseInt(btn.getAttribute('data-index'), 10);
            if (Number.isNaN(idx)) return;

            if (action === 'edit') {
                editEmpDbItem(idx);
            } else if (action === 'delete') {
                deleteEmpDbItem(idx);
            }
        });
    });
}

function editEmpDbItem(index) {
    const form = document.getElementById('empDbForm');
    if (!form) return;

    const item = empDbItems[index];
    if (!item) return;

    form.querySelector('#empDbQuestion').value = item.question;
    form.querySelector('#empDbAnswer').value   = item.answer;
    form.querySelector('#empDbTags').value     = item.tags;
    empDbEditingIndex = index;
}

function deleteEmpDbItem(index) {
    empDbItems.splice(index, 1);
    renderEmpDbList();
}