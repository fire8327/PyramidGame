// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных для игры
    let score = 0; // Текущий счет игрока (обнуляется при входе на уровень)
    let timeLeft = 40; // Оставшееся время в секундах
    let timerId; // Идентификатор таймера для его остановки
    const blocks = []; // Массив объектов блоков (элемент и ширина)

    // Конфигурация уровня
    const config = {
        blockCount: 7, // Количество блоков в пирамиде
        minWidth: 16, // Минимальная ширина блока
        maxWidth: 128, // Максимальная ширина блока
        step: 16, // Шаг изменения ширины при клике
        correctBonus: 20, // Бонус за правильное решение
        wrongPenalty: 15, // Штраф за ошибку
        bottomOffset: 20 // Отступ снизу для позиционирования блоков
    };

    // Инициализация уровня
    function init() {
        const playerName = localStorage.getItem('playerName'); // Получаем имя игрока из localStorage
        if (!playerName) window.location.href = '../index.html'; // Если имени нет, перенаправляем на главную
        document.getElementById('username').textContent = playerName; // Устанавливаем имя в шапке

        // Настраиваем кнопку выхода
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName'); // Удаляем имя из localStorage
            window.location.href = '../index.html'; // Перенаправляем на главную страницу
        });

        generateBlocks(); // Генерируем блоки для игры
        startTimer(); // Запускаем таймер
        document.getElementById('action-btn').addEventListener('click', checkSolution); // Настраиваем кнопку проверки
    }

    // Создание и размещение блоков в игровом поле
    function generateBlocks() {
        const gameArea = document.getElementById('gameArea'); // Получаем игровое поле
        gameArea.innerHTML = ''; // Очищаем поле перед генерацией

        // Создаем блоки со случайной шириной
        for (let i = 0; i < config.blockCount; i++) {
            const width = Math.floor(Math.random() * (config.maxWidth - config.minWidth + 1)) + config.minWidth; // Случайная ширина в диапазоне
            const block = document.createElement('div'); // Создаем новый элемент div
            block.className = 'absolute h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 transition-all'; // Устанавливаем стили
            block.style.width = `${width}px`; // Задаем ширину
            block.style.left = '50%'; // Центрируем по горизонтали
            block.style.transform = 'translateX(-50%)'; // Корректируем позицию
            block.style.bottom = `${i * 30 + config.bottomOffset}px`; // Устанавливаем вертикальную позицию
            block.dataset.width = width; // Сохраняем ширину в data-атрибуте

            // Добавляем обработчик правого клика для изменения размера
            block.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Предотвращаем контекстное меню
                toggleSize(block); // Изменяем размер блока
            });

            gameArea.appendChild(block); // Добавляем блок в игровое поле
            blocks.push({ element: block, width: width }); // Добавляем блок в массив
        }
    }

    // Изменение размера блока при правом клике
    function toggleSize(block) {
        const currentWidth = parseInt(block.dataset.width); // Получаем текущую ширину из data-атрибута
        let newWidth = currentWidth - config.step; // Уменьшаем ширину на шаг
        if (newWidth < config.minWidth) newWidth = config.maxWidth; // Если меньше минимума, возвращаем к максимуму

        block.style.width = `${newWidth}px`; // Устанавливаем новую ширину
        block.dataset.width = newWidth; // Обновляем data-атрибут
        blocks.find(b => b.element === block).width = newWidth; // Обновляем ширину в массиве блоков
    }

    // Проверка правильности пирамиды
    function checkSolution() {
        const isValid = blocks.every((block, index, arr) =>
            index === 0 || block.width <= arr[index - 1].width // Проверяем, что каждый блок не шире предыдущего
        );

        if (isValid) {
            score += config.correctBonus; // Добавляем бонус за успех
            showFeedback('Правильно! Уровень пройден', true); // Показываем сообщение об успехе
            finishGame(); // Завершаем уровень
        } else {
            score = Math.max(0, score - config.wrongPenalty); // Вычитаем штраф, но не ниже 0
            showFeedback('Неправильно! Продолжайте', false); // Показываем сообщение об ошибке
        }
        updateScore(); // Обновляем отображение счета
    }

    // Запуск таймера обратного отсчета
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--; // Уменьшаем время на 1 секунду
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`; // Обновляем текст таймера
            if (timeLeft <= 0) {
                clearInterval(timerId); // Останавливаем таймер
                showFeedback('Время вышло! Игра завершена', false); // Показываем сообщение о конце
                setTimeout(() => window.location.href = '../index.html', 3000); // Возвращаем на главную через 3 секунды
            }
        }, 1000); // Интервал 1 секунда
    }

    // Завершение уровня при успешной сборке
    function finishGame() {
        clearInterval(timerId); // Останавливаем таймер
        savePlayerScore(); // Сохраняем счет игрока
        const btn = document.getElementById('action-btn'); // Получаем кнопку действия
        btn.textContent = 'Следующий уровень'; // Меняем текст кнопки
        btn.removeEventListener('click', checkSolution); // Удаляем старый обработчик
        btn.addEventListener('click', () => window.location.href = 'gameLevel3.html'); // Переход на следующий уровень
    }

    // Обновление отображения текущего счета
    function updateScore() {
        document.getElementById('current-score').textContent = score; // Устанавливаем текущий счет в интерфейсе
    }

    // Отображение обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback'); // Получаем элемент обратной связи
        feedback.textContent = message; // Устанавливаем текст
        feedback.className = `text-lg font-semibold text-center ${isCorrect ? 'text-lime-600' : 'text-red-600'}`; // Устанавливаем цвет текста
    }

    // Сохранение счета игрока в localStorage
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return; // Если имени нет, ничего не делаем

        // Сохраняем лучший результат для уровня 2
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level2'] || 0;
        levelScores['level2'] = Math.max(currentLevelScore, score);
        localStorage.setItem(`levelScores_${playerName}`, JSON.stringify(levelScores));

        // Подсчитываем общий результат по всем уровням
        const totalScore = calculateTotalScore(playerName);

        // Обновляем рейтинг игроков
        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        const playerIndex = rating.findIndex(player => player.username === playerName);
        if (playerIndex !== -1) {
            rating[playerIndex].score = totalScore; // Обновляем существующий результат
        } else {
            rating.push({ username: playerName, score: totalScore }); // Добавляем нового игрока
        }
        localStorage.setItem('rating', JSON.stringify(rating));
    }

    // Подсчет общего результата игрока по всем уровням
    function calculateTotalScore(playerName) {
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        return (
            (levelScores['level1'] || 0) +
            (levelScores['level2'] || 0) +
            (levelScores['level3'] || 0)
        );
    }

    init(); // Запускаем уровень
});