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
        header.classList.remove('hidden');
        headerUsername.textContent = playerName;
        authForm.classList.add('hidden');
        levelSelect.classList.remove('hidden');
    } else {
        header.classList.add('hidden');
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
        if (username.length < 3 || username.length > 20) {
            showFeedback(authFeedback, 'Имя должно быть от 3 до 20 символов', 'error');
            return;
        }
        localStorage.setItem('playerName', username);
        header.classList.remove('hidden');
        headerUsername.textContent = username;
        authForm.classList.add('hidden');
        levelSelect.classList.remove('hidden');
    };

    // Обработка выхода
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('playerName');
            header.classList.add('hidden');
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