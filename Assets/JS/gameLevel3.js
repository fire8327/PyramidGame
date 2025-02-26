document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 60;
    let timerId;
    let pyramid = [];

    // Конфигурация уровня
    const config = {
        blockCount: 7,       // Количество ступенек
        minWidth: 64,        // Минимальная ширина (w-16 = 64px)
        maxWidth: 128,       // Максимальная ширина (w-32 = 128px)
        step: 8,             // Шаг изменения ширины
        correctBonus: 10,    // Бонус за правильный ответ
        wrongPenalty: 5,     // Штраф за ошибку
        spawnInterval: 2000, // Интервал спавна (2 сек)
        fallDuration: 5000   // Длительность падения (5 сек)
    };

    // Инициализация уровня
    function initLevel() {
        score = 0;
        updateScore();
        document.getElementById('username').textContent = localStorage.getItem('playerName') || 'Гость';
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });
        startSpawning();
        startTimer();
        document.getElementById('action-btn').addEventListener('click', checkPyramid);
    }

    // Генерация блока
    function generateBlock() {
        const number = Math.floor(Math.random() * config.blockCount) + 1;
        const width = config.maxWidth - (config.step * (7 - number));
        const block = document.createElement('div');
        block.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        block.style.width = `${width}px`;
        block.style.position = 'absolute';
        block.textContent = number;
        block.dataset.number = number;
        block.dataset.width = width;

        const sourceArea = document.getElementById('sourceArea');
        const containerWidth = sourceArea.clientWidth;
        const containerHeight = sourceArea.clientHeight;
        const leftPosition = Math.random() * (containerWidth - width);
        block.style.left = `${leftPosition}px`;
        block.style.top = '0';

        // Анимация падения
        const animation = block.animate([
            { transform: 'translateY(0)' },
            { transform: `translateY(${containerHeight - 24}px)` } // 24px = h-6
        ], {
            duration: config.fallDuration,
            easing: 'linear',
            fill: 'forwards'
        });

        sourceArea.appendChild(block);

        // Обработка клика
        block.addEventListener('click', () => {
            animation.pause();
            moveToPyramid(block);
        });

        // Удаление блока после падения
        setTimeout(() => {
            if (block.parentNode) block.remove();
        }, config.fallDuration);
    }

    // Запуск спавна блоков
    function startSpawning() {
        generateBlock();
        setInterval(generateBlock, config.spawnInterval);
    }

    // Перенос блока в правую область
    function moveToPyramid(block) {
        const targetArea = document.getElementById('targetArea');
        const pyramidBlock = document.createElement('div');
        pyramidBlock.className = 'h-6 bg-lime-500 rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        pyramidBlock.textContent = block.dataset.number;
        pyramidBlock.dataset.number = block.dataset.number;
        pyramidBlock.dataset.width = block.dataset.width;
        pyramidBlock.style.width = `${block.dataset.width}px`;
        targetArea.appendChild(pyramidBlock);
        pyramid.push({ number: parseInt(block.dataset.number), width: parseInt(block.dataset.width) });
        block.remove();
    }

    // Проверка пирамиды
    function checkPyramid() {
        if (pyramid.length < config.blockCount) {
            showFeedback('Недостаточно блоков! Нужно собрать все 7 ступенек.', false);
            return;
        }
        const expectedOrder = Array.from({ length: 7 }, (_, i) => 7 - i); // [7, 6, 5, 4, 3, 2, 1]
        const currentOrder = pyramid.map(block => block.number);
        const isCorrect = expectedOrder.every((num, index) => num === currentOrder[index]);
        if (isCorrect) {
            score += config.correctBonus;
            showFeedback('Правильно! Уровень пройден!', true);
            finishLevel();
        } else {
            score = Math.max(0, score - config.wrongPenalty);
            showFeedback('Неправильно! Пирамида должна быть от 7 (снизу) до 1 (сверху).', false);
        }
        updateScore();
    }

    // Таймер
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    // Обновление счета
    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    // Показ обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`;
    }

    // Завершение игры
    function endGame() {
        clearInterval(timerId);
        showFeedback('Время вышло! Игра завершена', false);
        setTimeout(() => window.location.reload(), 3000);
    }

    // Завершение уровня
    function finishLevel() {
        clearInterval(timerId);
        document.getElementById('action-btn').textContent = 'Следующий уровень';
        document.getElementById('action-btn').removeEventListener('click', checkPyramid);
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }

    // Старт уровня
    initLevel();
});