// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных
    let score = 0; // Текущий счёт
    let timeLeft = 120; // Общее время на уровень
    let timerId; // Идентификатор таймера
    let currentStage = 1; // Текущий этап (1–3)
    let exampleBlocks = []; // Блоки примера (правая часть)
    let playerBlocks = []; // Блоки игрока (левая часть)

    // Конфигурация уровня
    const config = {
        blockCount: 8, // Количество ступенек
        minWidth: 16, // Минимальная ширина
        maxWidth: 128, // Максимальная ширина (8 уровней: 16, 32, 48, 64, 80, 96, 112, 128)
        step: 16, // Шаг изменения ширины
        correctBonus: 20,
        wrongPenalty: 15,
        bottomOffset: 20 // Отступ снизу
    };

    // Инициализация уровня
    function init() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) window.location.href = '../index.html';
        document.getElementById('username').textContent = playerName;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });

        currentStage = 1;
        document.getElementById('current-stage').textContent = currentStage;
        generateBlocks();
        startTimer();
        document.getElementById('action-btn').addEventListener('click', checkSolution);
    }

    // Генерация блоков для примера и игрока
    function generateBlocks() {
        const exampleArea = document.getElementById('exampleArea');
        const playerArea = document.getElementById('playerArea');

        if (!exampleArea || !playerArea) {
            console.error('Ошибка: элементы exampleArea или playerArea не найдены');
            return;
        }

        exampleArea.innerHTML = '';
        playerArea.innerHTML = '';
        exampleBlocks = [];
        playerBlocks = [];

        // Генерация случайных ширин для примера
        const exampleWidths = Array.from({ length: config.blockCount }, () =>
            Math.floor(Math.random() * ((config.maxWidth - config.minWidth) / config.step + 1)) * config.step + config.minWidth
        );

        exampleWidths.forEach((width, index) => {
            const block = createBlock(width, index, false);
            exampleArea.appendChild(block);
            exampleBlocks.push({ element: block, width, index });
        });

        // Генерация случайных ширин для игрока
        const playerWidths = Array.from({ length: config.blockCount }, () =>
            Math.floor(Math.random() * ((config.maxWidth - config.minWidth) / config.step + 1)) * config.step + config.minWidth
        );
        playerWidths.forEach((width, index) => {
            const block = createBlock(width, index, true);
            playerArea.appendChild(block);
            playerBlocks.push({ element: block, width, index });
        });
    }

    // Создание блока
    function createBlock(width, index, isPlayerBlock) {
        const block = document.createElement('div');
        block.className = 'absolute h-6 bg-lime-500 rounded-full border-2 border-lime-700 transition-all flex items-center justify-center';
        block.dataset.index = index;
        if (isPlayerBlock) {
            block.classList.add('cursor-pointer');
            // Левый клик — увеличение
            block.addEventListener('click', () => increaseSize(block));
            // Правый клик — уменьшение
            block.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                decreaseSize(block);
            });
        }
        block.style.width = `${width}px`;
        block.style.left = '50%';
        block.style.transform = 'translateX(-50%)';
        block.style.bottom = `${index * 30 + config.bottomOffset}px`;
        block.dataset.width = width;

        const number = document.createElement('span');
        number.className = 'text-white font-bold';
        number.textContent = getNumberFromWidth(width); // Устанавливаем номер на основе размера
        block.appendChild(number);

        return block;
    }

    // Вычисление номера на основе ширины
    function getNumberFromWidth(width) {
        return Math.floor((width - config.minWidth) / config.step) + 1;
    }

    // Увеличение размера блока
    function increaseSize(block) {
        const index = parseInt(block.dataset.index);
        const playerBlock = playerBlocks.find(b => b.index === index);
        if (!playerBlock) return;

        let currentWidth = playerBlock.width;
        let newWidth = currentWidth + config.step;
        if (newWidth > config.maxWidth) newWidth = config.maxWidth; // Ограничение максимальной ширины

        playerBlock.width = newWidth;
        playerBlock.element.style.width = `${newWidth}px`;
        playerBlock.element.dataset.width = newWidth;

        // Обновляем номер
        const numberElement = playerBlock.element.querySelector('span');
        numberElement.textContent = getNumberFromWidth(newWidth);
    }

    // Уменьшение размера блока
    function decreaseSize(block) {
        const index = parseInt(block.dataset.index);
        const playerBlock = playerBlocks.find(b => b.index === index);
        if (!playerBlock) return;

        let currentWidth = playerBlock.width;
        let newWidth = currentWidth - config.step;
        if (newWidth < config.minWidth) newWidth = config.minWidth; // Ограничение минимальной ширины

        playerBlock.width = newWidth;
        playerBlock.element.style.width = `${newWidth}px`;
        playerBlock.element.dataset.width = newWidth;

        // Обновляем номер
        const numberElement = playerBlock.element.querySelector('span');
        numberElement.textContent = getNumberFromWidth(newWidth);
    }

    // Проверка решения
    function checkSolution() {
        const isCorrect = playerBlocks.every((block, index) =>
            block.width === exampleBlocks[index].width
        );

        if (isCorrect) {
            score += config.correctBonus;
            if (currentStage < 3) {
                showFeedback(`Этап ${currentStage} пройден! Переход к этапу ${currentStage + 1}`, true);
                setTimeout(() => {
                    currentStage++;
                    document.getElementById('current-stage').textContent = currentStage;
                    generateBlocks();
                    showFeedback('');
                }, 1000);
            } else {
                showFeedback('Все этапы пройдены! Уровень 2 завершён!', true);
                setTimeout(finishGame, 1000);
            }
        } else {
            score = Math.max(0, score - config.wrongPenalty);
            showFeedback('Размеры не совпадают. Продолжайте.', false);
        }
        updateScore();
    }

    // Запуск таймера
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                showFeedback('Время вышло! Игра завершена', false);
                setTimeout(() => window.location.href = '../index.html', 3000);
            }
        }, 1000);
    }

    // Завершение уровня
    function finishGame() {
        clearInterval(timerId);
        savePlayerScore();
        const btn = document.getElementById('action-btn');
        btn.textContent = 'Следующий уровень';
        btn.removeEventListener('click', checkSolution);
        btn.addEventListener('click', () => window.location.href = 'gameLevel3.html');
    }

    // Обновление счёта
    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    // Отображение обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-lime-600' : 'text-red-600'}`;
    }

    // Сохранение счёта
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return;

        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level2'] || 0;
        levelScores['level2'] = Math.max(currentLevelScore, score);
        localStorage.setItem(`levelScores_${playerName}`, JSON.stringify(levelScores));

        const totalScore = calculateTotalScore(playerName);

        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        const playerIndex = rating.findIndex(player => player.username === playerName);
        if (playerIndex !== -1) {
            rating[playerIndex].score = totalScore;
        } else {
            rating.push({ username: playerName, score: totalScore });
        }
        localStorage.setItem('rating', JSON.stringify(rating));
    }

    // Подсчёт общего результата
    function calculateTotalScore(playerName) {
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        return (
            (levelScores['level1'] || 0) +
            (levelScores['level2'] || 0) +
            (levelScores['level3'] || 0)
        );
    }

    init(); // Запуск уровня
});