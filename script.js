// === GLOBAL STATE ===
let currentUserType = null; 
let selectedOrganization = null;
let selectedDepartment = null;
let selectedEmployee = null;
let databaseSections = [];
let taskTables = [];

// === DOM ELEMENTS ===
const screens = {
    welcome: document.getElementById("welcomeScreen"),
    mode: document.getElementById("modeScreen"),
    orgSelect: document.getElementById("organizationScreen"),
    deptSelect: document.getElementById("departmentScreen"),
    employeeSelect: document.getElementById("employeeScreen"),
    employeeHome: document.getElementById("employeeHomeScreen"),
    guestHome: document.getElementById("guestHomeScreen"),
    databaseEditor: document.getElementById("databaseEditor"),
    taskCreator: document.getElementById("taskCreator"),
    aiChat: document.getElementById("aiChat")
};

function showScreen(name) {
    Object.values(screens).forEach(s => s.style.display = "none");
    screens[name].style.display = "block";
}

// === START FLOW ===
document.getElementById("startButton").addEventListener("click", () => {
    showScreen("mode");
});

// === MODE SELECTION ===
document.getElementById("employeeButton").addEventListener("click", () => {
    currentUserType = "employee";
    loadOrganizations();
    showScreen("orgSelect");
});

document.getElementById("guestButton").addEventListener("click", () => {
    currentUserType = "guest";
    showScreen("guestHome");
});

// === ORGANIZATIONS ===
const organizations = [
    {
        name: "Управление физической культуры и спорта",
        departments: [
            {
                name: "Руководство",
                employees: ["Руководитель", "Заместитель руководителя"]
            },
            {
                name: "Отдел кадров",
                employees: ["Специалист отдела кадров"]
            },
            {
                name: "Отдел организационной работы",
                employees: ["Главный специалист", "Специалист"]
            },
            {
                name: "Отдел экономики",
                employees: ["Главный экономист", "Экономист"]
            },
            {
                name: "Отдел высшего спорта",
                employees: ["Руководитель высшего спорта"]
            },
            {
                name: "Отдел массового спорта",
                employees: [
                    "Әшірбек Н.Ж. — Руководитель отдела",
                    "Сотрудник отдела 1",
                    "Сотрудник отдела 2",
                    "Сотрудник отдела 3"
                ]
            }
        ]
    }
];

// === LOAD ORGANIZATIONS ===
function loadOrganizations() {
    const list = document.getElementById("orgList");
    list.innerHTML = "";

    organizations.forEach((org) => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerText = org.name;
        div.onclick = () => selectOrganization(org);
        list.appendChild(div);
    });
}

function selectOrganization(org) {
    selectedOrganization = org;
    loadDepartments(org);
    showScreen("deptSelect");
}

// === LOAD DEPARTMENTS ===
function loadDepartments(org) {
    const list = document.getElementById("deptList");
    list.innerHTML = "";

    org.departments.forEach((dept) => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerText = dept.name;
        div.onclick = () => selectDepartment(dept);
        list.appendChild(div);
    });
}

function selectDepartment(dept) {
    selectedDepartment = dept;
    loadEmployees(dept);
    showScreen("employeeSelect");
}

// === LOAD EMPLOYEES ===
function loadEmployees(dept) {
    const list = document.getElementById("employeeList");
    list.innerHTML = "";

    dept.employees.forEach((emp) => {
        const div = document.createElement("div");
        div.className = "list-item";
        div.innerText = emp;
        div.onclick = () => selectEmployee(emp);
        list.appendChild(div);
    });
}

function selectEmployee(employeeName) {
    selectedEmployee = employeeName;
    document.getElementById("employeeTitle").innerText = employeeName;
    showScreen("employeeHome");
}

// === DATABASE EDITOR ===
document.getElementById("openDatabaseBtn").addEventListener("click", () => {
    renderDatabaseEditor();
    showScreen("databaseEditor");
});

document.getElementById("addDbSection").addEventListener("click", () => {
    const name = prompt("Название раздела?");
    if (name) {
        databaseSections.push({ title: name, text: "" });
        renderDatabaseEditor();
    }
});

function renderDatabaseEditor() {
    const container = document.getElementById("databaseSections");
    container.innerHTML = "";

    databaseSections.forEach((sec, index) => {
        const div = document.createElement("div");
        div.className = "db-section";

        div.innerHTML = `
            <h3>${sec.title}</h3>
            <textarea oninput="editDbText(${index}, this.value)">${sec.text}</textarea>
        `;

        container.appendChild(div);
    });
}

function editDbText(index, value) {
    databaseSections[index].text = value;
}

// === TASK CREATOR (TABLE BUILDER) ===
document.getElementById("createTaskBtn").addEventListener("click", () => {
    buildTaskTable();
    showScreen("taskCreator");
});

function buildTaskTable() {
    const container = document.getElementById("taskTable");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "task-table";

    const header = table.insertRow();
    header.innerHTML = `
        <th>Название</th>
        <th>Тип</th>
        <th>Данные</th>
    `;

    // Example starter row
    addRow(table);

    container.appendChild(table);

    document.getElementById("addTableRow").onclick = () => addRow(table);
}

// Add new row
function addRow(table) {
    const row = table.insertRow();

    row.innerHTML = `
        <td><input type="text" placeholder="Название"></td>
        <td>
            <select>
                <option value="text">Текст</option>
                <option value="number">Число</option>
                <option value="date">Дата</option>
            </select>
        </td>
        <td><input type="text"></td>
    `;
}

// === AI CHAT (basic local simulation) ===
document.getElementById("sendAiMessage").addEventListener("click", () => {
    const input = document.getElementById("aiInput");
    const chat = document.getElementById("aiChatMessages");

    if (input.value.trim() === "") return;

    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg user";
    userMsg.innerText = input.value;
    chat.appendChild(userMsg);

    setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.className = "chat-msg bot";
        botMsg.innerText = "ИИ-ассистент скоро будет подключён.";
        chat.appendChild(botMsg);
    }, 500);

    input.value = "";
});
