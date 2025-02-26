document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 25;
    let timerId;
    const blocks = [];
    const config = {
        blockCount: 7,
        minWidth: 30,
        maxWidth: 150,
        step: 20,
        correctBonus: 20,
        wrongPenalty: 10,
        bottomOffset: 20
    };

    function init() {
        const playerName = localStorage.getItem('playerName');
        if(!playerName) window.location.href = '../index.html';
        document.getElementById('username').textContent = playerName;

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });

        generateBlocks();
        startTimer();
        document.getElementById('action-btn').addEventListener('click', checkSolution);
    }

    function generateBlocks() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';

        for(let i = 0; i < config.blockCount; i++) {
            const block = document.createElement('div');
            block.className = 'absolute h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 transition-all';
            block.style.width = `${config.maxWidth}px`;
            block.style.left = '50%';
            block.style.transform = 'translateX(-50%)';
            block.style.bottom = `${i * 30 + config.bottomOffset}px`;
            block.dataset.width = config.maxWidth;

            // Правый клик + запрет контекстного меню
            block.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleSize(block);
            });
            
            gameArea.appendChild(block);
            blocks.push({ element: block, width: config.maxWidth });
        }
    }

    function toggleSize(block) {
        const currentWidth = parseInt(block.dataset.width);
        let newWidth = currentWidth - config.step;

        // Циклическое изменение размеров
        if(newWidth < config.minWidth) {
            newWidth = config.maxWidth;
        }

        block.style.width = `${newWidth}px`;
        block.dataset.width = newWidth;
        blocks.find(b => b.element === block).width = newWidth;
    }

    function checkSolution() {
        const isValid = blocks.every((block, index, arr) => 
            index === 0 || block.width <= arr[index - 1].width
        );

        if(isValid) {
            score += config.correctBonus;
            showFeedback('Правильно! Уровень пройден', true);
            finishGame();
        } else {
            score = Math.max(0, score - config.wrongPenalty);
            showFeedback('Неправильно! Продолжайте', false);
        }
        updateScore();
    }

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`;
            if(timeLeft <= 0) {
                clearInterval(timerId);
                showFeedback('Время вышло! Игра завершена', false);
                setTimeout(() => window.location.reload(), 3000);
            }
        }, 1000);
    }

    function finishGame() {
        clearInterval(timerId);
        const btn = document.getElementById('action-btn');
        btn.textContent = 'Следующий уровень';
        btn.removeEventListener('click', checkSolution);
        btn.addEventListener('click', () => window.location.href = 'gameLevel3.html');
    }

    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center ${isCorrect ? 'text-lime-600' : 'text-red-600'}`;
    }

    init();
});