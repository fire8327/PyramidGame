// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных для игры
    let score = 0; // Текущий счет игрока (обнуляется при входе на уровень)
    let timeLeft = 135; // Оставшееся время в секундах
    let timerId; // Идентификатор таймера для его управления
    let blocks = []; // Массив объектов блоков (элемент, ширина, позиция)
    let selectedBlockIndex = -1; // Индекс выбранного блока (-1 = ничего не выбрано)
    let currentStage = 1; // Текущий этап (1, 2 или 3)

    // Конфигурация уровня
    const config = {
        blockCount: 7, // Количество блоков в пирамиде
        minWidth: 16, // Минимальная ширина блока
        maxWidth: 128, // Максимальная ширина блока
        step: 16, // Шаг изменения ширины
        correctBonus: 10, // Бонус за правильное решение
        wrongPenalty: 5, // Штраф за ошибку
        bottomOffset: 20 // Отступ снизу для позиционирования блоков
    };

    // Инициализация уровня
    function initLevel() {
        score = 0;
        updateScore();
        document.getElementById('username').textContent = localStorage.getItem('playerName');
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });
        currentStage = 1;
        document.getElementById('current-stage').textContent = currentStage;
        generateBlocks();
        startTimer();
        document.addEventListener('keydown', handleKeyPress);
        document.getElementById('action-btn').addEventListener('click', checkStage);
    }

    // Создание и размещение блоков в игровом поле
    function generateBlocks() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        blocks = [];

        const widths = Array.from({ length: config.blockCount }, (_, i) =>
            config.maxWidth - (i * config.step)
        ).sort(() => Math.random() - 0.5);

        widths.forEach((width, index) => {
            const block = document.createElement('div');
            block.className = `absolute bg-lime-500 h-6 cursor-pointer transition-all border-2 border-lime-700 rounded-full`;
            block.style.width = `${width}px`;
            block.style.left = '50%';
            block.style.transform = 'translateX(-50%)';
            block.style.bottom = `${index * 30 + config.bottomOffset}px`;
            block.dataset.width = width;

            gameArea.appendChild(block);
            blocks.push({ element: block, width: width, position: index });
        });
    }

    // Обработка нажатий клавиш для перемещения блоков
    function handleKeyPress(e) {
        if (selectedBlockIndex === -1) return;

        switch (e.key) {
            case 'ArrowUp':
                if (selectedBlockIndex < blocks.length - 1) moveBlock(1);
                break;
            case 'ArrowDown':
                if (selectedBlockIndex > 0) moveBlock(-1);
                break;
        }
    }

    // Перемещение выбранного блока вверх или вниз
    function moveBlock(direction) {
        const currentBlock = blocks[selectedBlockIndex];
        const targetIndex = selectedBlockIndex + direction;
        const targetBlock = blocks[targetIndex];

        [blocks[selectedBlockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[selectedBlockIndex]];
        blocks.forEach((block, index) => {
            block.element.style.bottom = `${index * 30 + config.bottomOffset}px`;
        });

        selectedBlockIndex = targetIndex;
    }

    // Выбор блока при клике
    function selectBlock(index) {
        blocks.forEach(block =>
            block.element.classList.remove('shadow-[0px_0px_20px_-4px_black]')
        );
        selectedBlockIndex = index;
        blocks[index].element.classList.add('shadow-[0px_0px_20px_-4px_black]');
    }

    // Проверка правильности сортировки пирамиды с улучшенным фидбеком
    function checkStage() {
        const isSorted = blocks.every((block, index, arr) =>
            !index || block.width <= arr[index - 1].width
        );

        if (isSorted) {
            score += config.correctBonus; // Добавляем бонус за успех
            if (currentStage < 3) {
                // Сообщение о правильной сборке с указанием следующего этапа
                showFeedback(`Пирамида собрана правильно! Переход к этапу ${currentStage + 1}.`, true);
                setTimeout(() => { // Задержка 1 секунда перед переходом к следующему этапу
                    currentStage++;
                    document.getElementById('current-stage').textContent = currentStage;
                    generateBlocks();
                    selectedBlockIndex = -1;
                    showFeedback(''); // Очищаем фидбек после перехода
                }, 1000);
            } else {
                // Сообщение о завершении всех этапов
                showFeedback('Пирамида собрана правильно! Уровень 1 пройден!', true);
                setTimeout(finishLevel, 1000); // Задержка перед завершением уровня
            }
        } else {
            score = Math.max(0, score - config.wrongPenalty); // Вычитаем штраф
            // Сообщение о неправильной сборке
            showFeedback('Пирамида собрана неверно. Продолжайте сортировку.', false);
        }
        updateScore();
    }

    // Запуск таймера обратного отсчета
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    // Обновление отображения текущего счета
    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    // Отображение обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`;
    }

    // Завершение игры при истечении времени
    function endGame() {
        clearInterval(timerId);
        showFeedback('Время вышло! Игра завершена', false);
        setTimeout(() => window.location.reload(), 3000);
    }

    // Завершение уровня при успешной сортировке всех этапов
    function finishLevel() {
        clearInterval(timerId);
        savePlayerScore();
        document.getElementById('action-btn').textContent = 'Следующий уровень';
        document.getElementById('action-btn').removeEventListener('click', checkStage);
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'gameLevel2.html';
        });
    }

    // Сохранение счета игрока в localStorage
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return;

        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level1'] || 0;
        levelScores['level1'] = Math.max(currentLevelScore, score);
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

    // Подсчет общего результата игрока по всем уровням
    function calculateTotalScore(playerName) {
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        return (
            (levelScores['level1'] || 0) +
            (levelScores['level2'] || 0) +
            (levelScores['level3'] || 0)
        );
    }

    // Обработчик клика по игровому полю для выбора блоков
    document.getElementById('gameArea').addEventListener('click', (e) => {
        const blockElement = e.target.closest('[data-width]');
        if (blockElement) {
            const index = blocks.findIndex(b => b.element === blockElement);
            if (index !== -1) selectBlock(index);
        }
    });

    initLevel(); // Запускаем уровень
});