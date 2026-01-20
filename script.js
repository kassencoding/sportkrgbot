const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll("[data-nav]");
const navItems = document.querySelectorAll(".bottom-nav .nav-item");
const taskList = document.getElementById("taskList");
const fileList = document.getElementById("fileList");
const createFileButton = document.getElementById("createFile");

let db = null;

const sampleTasks = [
  {
    title: "Подготовить отчет за квартал",
    description: "Составить и отправить квартальный отчет о проделанной работе",
    date: "15.12.2024",
    status: "active",
  },
  {
    title: "Срочно согласовать с департаментом",
    description: "Обсудить вопросы финансирования спортивных мероприятий",
    date: "12.12.2024",
    status: "urgent",
  },
];

const fileSamples = [
  {
    title: "Спортивная инфраструктура...",
    content: "В области функционирует 1381 спортивное сооружение",
    date: "16.01.2026",
  },
];

const showScreen = (id) => {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === id);
  });
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === id);
  });
};

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.nav;
    if (target) {
      showScreen(target);
    }
  });
});

const renderTasks = (tasks) => {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">${task.title}</div>
      <div class="meta">${task.description}</div>
      ${task.status === "urgent" ? '<div class="status pill danger">Срочно</div>' : ""}
      <div class="meta">${task.date}</div>
      <button class="btn primary">Выполнить</button>
    `;
    taskList.appendChild(card);
  });
};

const renderFiles = (files) => {
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">${file.title}</div>
      <div class="meta">${file.date}</div>
      <div class="meta">${file.content}</div>
      <div class="file-actions">
        <button class="btn ghost" data-edit="${index}">Редактировать</button>
        <button class="btn ghost" data-delete="${index}">Удалить</button>
      </div>
    `;
    fileList.appendChild(card);
  });
};

const initFirebase = () => {
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
  };

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase config is not set yet.");
    return;
  }

  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore(app);
};

const createFile = async () => {
  const title = document.getElementById("fileTitle").value.trim();
  const content = document.getElementById("fileContent").value.trim();
  if (!title || !content) return;

  if (!db) {
    const newFile = {
      title,
      content,
      date: new Date().toLocaleDateString("ru-RU"),
    };
    fileSamples.unshift(newFile);
    renderFiles(fileSamples);
    return;
  }

  await db.collection("files").add({
    title,
    content,
    date: new Date(),
  });
};

const loadFiles = async () => {
  if (!db) {
    renderFiles(fileSamples);
    return;
  }

  const snapshot = await db.collection("files").orderBy("date", "desc").get();
  const files = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate?.().toLocaleDateString("ru-RU") ?? "",
  }));
  renderFiles(files);
};

const loadTasks = async () => {
  if (!db) {
    renderTasks(sampleTasks);
    return;
  }

  const snapshot = await db.collection("tasks").orderBy("date", "desc").get();
  const tasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate?.().toLocaleDateString("ru-RU") ?? "",
  }));
  renderTasks(tasks);
};

createFileButton.addEventListener("click", () => {
  createFile();
});

initFirebase();
loadTasks();
loadFiles();
showScreen("screen-welcome");
