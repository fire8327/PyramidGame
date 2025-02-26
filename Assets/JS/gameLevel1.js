document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 40;
    let timerId;
    let blocks = [];
    let selectedBlockIndex = -1;

    // Конфигурация уровня
    const config = {
        blockCount: 7,
        minWidth: 64,   // w-16 (16 * 4 = 64px)
        maxWidth: 128,  // w-32 (32 * 4 = 128px)
        step: 16,
        correctBonus: 10,
        wrongPenalty: 5,
        bottomOffset: 20 // Отступ снизу в пикселях
    };

    // Инициализация уровня
    function initLevel() {
        // Сброс данных игрока
        score = 0;
        updateScore();
        
        // Настройка интерфейса
        document.getElementById('username').textContent = localStorage.getItem('playerName');
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });

        generateBlocks();
        startTimer();
        document.addEventListener('keydown', handleKeyPress);
        document.getElementById('action-btn').addEventListener('click', checkStage);
    }

    // Генерация блоков
    function generateBlocks() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        blocks = [];

        // Создаём массив ширин и перемешиваем
        const widths = Array.from({length: config.blockCount}, (_, i) => 
            config.maxWidth - (i * config.step)
        ).sort(() => Math.random() - 0.5);

        // Создаём блоки
        widths.forEach((width, index) => {
            const block = document.createElement('div');
            block.className = `absolute bg-lime-500 h-6 cursor-pointer transition-all 
                             border-2 border-lime-700 rounded-full`;
            block.style.width = `${width}px`;
            block.style.left = '50%';
            block.style.transform = 'translateX(-50%)';
            block.style.bottom = `${index * 30 + config.bottomOffset}px`; // Добавляем отступ снизу
            block.dataset.width = width;
            
            gameArea.appendChild(block);
            blocks.push({
                element: block,
                width: width,
                position: index
            });
        });
    }

    // Обработка клавиш
    function handleKeyPress(e) {
        if (selectedBlockIndex === -1) return;

        switch(e.key) {
            case 'ArrowUp':
                if (selectedBlockIndex < blocks.length - 1) moveBlock(1);
                break;
            case 'ArrowDown':
                if (selectedBlockIndex > 0) moveBlock(-1);
                break;
        }
    }

    // Перемещение блока
    function moveBlock(direction) {
        const currentBlock = blocks[selectedBlockIndex];
        const targetIndex = selectedBlockIndex + direction;
        const targetBlock = blocks[targetIndex];

        // Меняем блоки местами
        [blocks[selectedBlockIndex], blocks[targetIndex]] = 
        [blocks[targetIndex], blocks[selectedBlockIndex]];

        // Обновляем позиции
        blocks.forEach((block, index) => {
            block.element.style.bottom = `${index * 30 + config.bottomOffset}px`; // Учитываем отступ
        });

        selectedBlockIndex = targetIndex;
    }

    // Выбор блока
    function selectBlock(index) {
        blocks.forEach(block => 
            block.element.classList.remove('shadow-[0px_0px_20px_-4px_black]')
        );
        selectedBlockIndex = index;
        blocks[index].element.classList.add('shadow-[0px_0px_20px_-4px_black]');
    }

    // Проверка пирамиды
    function checkStage() {
        const isSorted = blocks.every((block, index, arr) => 
            !index || block.width <= arr[index - 1].width
        );

        if (isSorted) {
            score += config.correctBonus;
            showFeedback('Правильно! Уровень пройден!', true);
            finishLevel();
        } else {
            score = Math.max(0, score - config.wrongPenalty);
            showFeedback('Неправильно! Продолжайте сортировку', false);
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

    // Функции интерфейса
    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center mt-4 
                            ${isCorrect ? 'text-green-600' : 'text-red-600'}`;
    }

    function endGame() {
        clearInterval(timerId);
        showFeedback('Время вышло! Игра завершена', false);
        setTimeout(() => window.location.reload(), 3000);
    }

    function finishLevel() {
        clearInterval(timerId);
        document.getElementById('action-btn').textContent = 'Следующий уровень';
        document.getElementById('action-btn').removeEventListener('click', checkStage);
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'gameLevel2.html';
        });
    }

    // Обработчики событий
    document.getElementById('gameArea').addEventListener('click', (e) => {
        const blockElement = e.target.closest('[data-width]');
        if (blockElement) {
            const index = blocks.findIndex(b => b.element === blockElement);
            if (index !== -1) selectBlock(index);
        }
    });

    window.resetProgress = () => {
        localStorage.removeItem('levelProgress');
    }

    initLevel();
});