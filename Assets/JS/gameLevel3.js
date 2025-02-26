document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 90;
    let timerId;
    let pyramid = [];

    const config = {
        blockCount: 7,
        minWidth: 16,
        maxWidth: 128,
        step: 16,
        correctBonus: 30,
        wrongPenalty: 25,
        spawnInterval: 2000,
        fallDuration: 5000
    };

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

        const animation = block.animate([
            { transform: 'translateY(0)' },
            { transform: `translateY(${containerHeight - 24}px)` }
        ], {
            duration: config.fallDuration,
            easing: 'linear',
            fill: 'forwards'
        });

        sourceArea.appendChild(block);

        block.addEventListener('click', () => {
            animation.pause();
            moveToPyramid(block);
        });

        setTimeout(() => {
            if (block.parentNode) block.remove();
        }, config.fallDuration);
    }

    function startSpawning() {
        generateBlock();
        setInterval(generateBlock, config.spawnInterval);
    }

    function moveToPyramid(block) {
        pyramid.push({ number: parseInt(block.dataset.number), width: parseInt(block.dataset.width) });
        pyramid.sort((a, b) => b.width - a.width);
        updatePyramidDisplay();
        block.remove();
    }

    function updatePyramidDisplay() {
        const targetArea = document.getElementById('targetArea');
        targetArea.innerHTML = '';
        pyramid.forEach((block, index) => {
            const pyramidBlock = document.createElement('div');
            pyramidBlock.className = 'h-6 bg-lime-500 rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
            pyramidBlock.textContent = block.number;
            pyramidBlock.dataset.width = block.width;
            pyramidBlock.style.width = `${block.width}px`;
            targetArea.appendChild(pyramidBlock);
        });
    }

    function checkPyramid() {
        if (pyramid.length < config.blockCount) {
            showFeedback('Недостаточно блоков! Нужно собрать все 7 ступенек.', false);
            return;
        }
        const expectedOrder = Array.from({ length: 7 }, (_, i) => 7 - i);
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

    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`;
            if (timeLeft <= 0) endGame();
        }, 1000);
    }

    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`;
    }

    function endGame() {
        clearInterval(timerId);
        showFeedback('Время вышло! Игра завершена', false);
        setTimeout(() => window.location.reload(), 3000);
    }

    function finishLevel() {
        clearInterval(timerId);
        savePlayerScore();
        document.getElementById('action-btn').textContent = 'Топ игроков';
        document.getElementById('action-btn').removeEventListener('click', checkPyramid);
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }

    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return;
    
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level3'] || 0;
        levelScores['level3'] = Math.max(currentLevelScore, score);
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
    
    function calculateTotalScore(playerName) {
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        return (
            (levelScores['level1'] || 0) +
            (levelScores['level2'] || 0) +
            (levelScores['level3'] || 0)
        );
    }

    initLevel();
});