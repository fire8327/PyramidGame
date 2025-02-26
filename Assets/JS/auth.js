// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM для работы с формой авторизации и выбором уровней
    const authForm = document.getElementById('authForm'); // Форма входа
    const levelSelect = document.getElementById('levelSelect'); // Блок выбора уровней
    const usernameInput = document.getElementById('username'); // Поле ввода имени
    const header = document.getElementById('header'); // Шапка с именем пользователя
    const headerUsername = document.getElementById('header-username'); // Элемент для отображения имени в шапке
    const authFeedback = document.getElementById('authFeedback'); // Элемент для обратной связи при авторизации

    // Проверяем, есть ли сохраненное имя пользователя в localStorage
    const playerName = localStorage.getItem('playerName');
    if (playerName) {
        // Если имя есть (пользователь авторизован):
        header.classList.remove('hidden'); // Показываем шапку
        headerUsername.textContent = playerName; // Устанавливаем имя в шапке
        authForm.classList.add('hidden'); // Скрываем форму входа
        levelSelect.classList.remove('hidden'); // Показываем выбор уровней
    } else {
        // Если имени нет (пользователь не авторизован):
        header.classList.add('hidden'); // Скрываем шапку
        authForm.classList.remove('hidden'); // Показываем форму входа
        levelSelect.classList.add('hidden'); // Скрываем выбор уровней
    }

    // Функция для начала игры, вызывается при нажатии кнопки "Начать игру"
    window.startGame = () => {
        const username = usernameInput.value.trim(); // Получаем и очищаем введенное имя от пробелов
        if (!username) {
            // Если имя пустое, показываем ошибку
            showFeedback(authFeedback, 'Пожалуйста, введите ваше имя', 'error');
            return;
        }
        if (username.length < 3 || username.length > 20) {
            // Проверяем длину имени (валидация)
            showFeedback(authFeedback, 'Имя должно быть от 3 до 20 символов', 'error');
            return;
        }
        // Если все проверки пройдены:
        localStorage.setItem('playerName', username); // Сохраняем имя в localStorage
        header.classList.remove('hidden'); // Показываем шапку
        headerUsername.textContent = username; // Устанавливаем имя в шапке
        authForm.classList.add('hidden'); // Скрываем форму входа
        levelSelect.classList.remove('hidden'); // Показываем выбор уровней
    };

    // Настраиваем кнопку выхода
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        // Если кнопка существует, добавляем обработчик события
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('playerName'); // Удаляем имя из localStorage
            header.classList.add('hidden'); // Скрываем шапку
            authForm.classList.remove('hidden'); // Показываем форму входа
            levelSelect.classList.add('hidden'); // Скрываем выбор уровней
        });
    }

    // Функция для отображения сообщений обратной связи
    function showFeedback(element, message, type = 'info') {
        element.textContent = message; // Устанавливаем текст сообщения
        element.classList.remove('text-red-600', 'text-green-600'); // Удаляем старые цвета текста
        element.classList.add(type === 'error' ? 'text-red-600' : 'text-green-600'); // Устанавливаем цвет (красный для ошибок, зеленый для инфо)
        setTimeout(() => element.textContent = '', 3000); // Очищаем текст через 3 секунды
    }
});