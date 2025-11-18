document.addEventListener("DOMContentLoaded", () => {

    // 1. АНИМАЦИЯ ЗАПУСКА
    const splashScreen = document.getElementById("splashScreen");
    const splashText = document.getElementById("splashText");
    const appContainer = document.getElementById("appContainer");

    // Через 2 секунды меняем текст
    setTimeout(() => {
        splashText.style.opacity = '0';
        setTimeout(() => {
            splashText.innerText = "Добро пожаловать в GiDCity!";
            splashText.style.opacity = '1';
        }, 500); // Время на исчезание
    }, 2000);

    // Через 4 секунды (2+2) скрываем splash и показываем приложение
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        appContainer.style.display = 'block'; // Показываем приложение
        
        // Через 0.5 сек (когда splash исчез) убираем его, чтобы не мешал
        setTimeout(() => {
            splashScreen.style.display = 'none';
            document.body.style.overflow = 'auto'; // Возвращаем прокрутку
        }, 500);
    }, 4000);


    // 2. ОБНОВЛЕНИЕ ДАТЫ В КАЛЕНДАРЕ
    const dateElement = document.getElementById("currentDate");
    const today = new Date();
    dateElement.innerText = today.toLocaleDateString('ru-RU');


    // 3. ЛОГИКА МОДАЛЬНЫХ ОКОН
    const modals = document.querySelectorAll(".modal");
    
    // Кнопки, открывающие окна
    document.getElementById("calendarButton").onclick = () => showModal("calendarModal");
    document.getElementById("settingsButton").onclick = () => showModal("settingsModal");
    document.getElementById("notificationsButton").onclick = () => showModal("notificationsModal");

    // Функция показа окна
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "block";
    }

    // Закрытие окон (по крестику или кнопке "Закрыть")
    const closeButtons = document.querySelectorAll(".close-button, .close-btn");
    closeButtons.forEach(button => {
        button.onclick = () => {
            const modalId = button.getAttribute("data-modal-id");
            document.getElementById(modalId).style.display = "none";
        };
    });

    // Закрытие окна по клику на темный фон
    window.onclick = (event) => {
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    };


    // 4. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (УСЛУГИ / РАБОТА)
    const navToggles = document.querySelectorAll(".nav-toggle");
    const contentTabs = document.querySelectorAll(".content-tab");

    navToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const targetTab = toggle.getAttribute("data-tab"); // "services" или "work"

            // Обновляем кнопки
            navToggles.forEach(btn => btn.classList.remove("active"));
            toggle.classList.add("active");

            // Обновляем контент
            contentTabs.forEach(tab => {
                if (tab.id === targetTab) {
                    tab.classList.add("active");
                } else {
                    tab.classList.remove("active");
                }
            });
        });
    });

});
