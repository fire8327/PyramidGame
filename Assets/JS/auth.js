document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const levelSelect = document.getElementById('levelSelect');
    const usernameInput = document.getElementById('username');
    const header = document.getElementById('header');
    const headerUsername = document.getElementById('header-username');
    const authFeedback = document.getElementById('authFeedback');

    // Проверяем, авторизован ли пользователь
    const playerName = localStorage.getItem('playerName');
    if (playerName) {
        // Если пользователь уже вошёл:
        // 1. Показываем шапку
        header.classList.remove('hidden');
        headerUsername.textContent = playerName;

        // 2. Показываем выбор уровней
        authForm.classList.add('hidden');
        levelSelect.classList.remove('hidden');
    } else {
        // Если не вошёл:
        // 1. Скрываем шапку
        header.classList.add('hidden');

        // 2. Показываем форму входа
        authForm.classList.remove('hidden');
        levelSelect.classList.add('hidden');
    }

    // Обработка начала игры
    window.startGame = () => {
        const username = usernameInput.value.trim();
        if (!username) {
            showFeedback(authFeedback, 'Пожалуйста, введите ваше имя', 'error');
            return;
        }

        // Сохраняем имя пользователя в localStorage
        localStorage.setItem('playerName', username);

        // Показываем шапку
        header.classList.remove('hidden');
        headerUsername.textContent = username;

        // Показываем выбор уровней
        authForm.classList.add('hidden');
        levelSelect.classList.remove('hidden');
    };

    // Обработка выхода из аккаунта
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Удаляем имя пользователя из localStorage
            localStorage.removeItem('playerName');

            // Скрываем шапку
            header.classList.add('hidden');

            // Показываем форму входа
            authForm.classList.remove('hidden');
            levelSelect.classList.add('hidden');
        });
    }

    // Функция для отображения фидбека
    function showFeedback(element, message, type = 'info') {
        element.textContent = message;
        element.classList.remove('text-red-600', 'text-green-600');
        element.classList.add(type === 'error' ? 'text-red-600' : 'text-green-600');
        setTimeout(() => element.textContent = '', 3000);
    }
});