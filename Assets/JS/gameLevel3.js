document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 180;
    let timerId;
    let currentStage = 1;
    let pyramid = [];
    let spawnIntervalId;
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
        document.getElementById('current-stage').textContent = currentStage;
        document.getElementById('username').textContent = localStorage.getItem('playerName') || 'Гость';
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName');
            window.location.href = '../index.html';
        });

        startGame();
        document.getElementById('action-btn').addEventListener('click', checkPyramid);
    }

    function startGame() {
        resetStage();
        startTimer();
        startSpawning();
    }

    function resetStage() {
        clearInterval(spawnIntervalId);
        pyramid = [];
        document.getElementById('sourceArea').innerHTML = '';
        document.getElementById('targetArea').innerHTML = '';
    }

    function generateBlock() {
        const availableNumbers = Array.from({ length: config.blockCount }, (_, i) => i + 1)
            .filter(num => !pyramid.some(block => block.number === num));
        
        if (availableNumbers.length === 0) return;

        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const width = config.maxWidth - (config.step * (7 - number));
        const block = document.createElement('div');
        
        block.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        block.style.cssText = `width: ${width}px; position: absolute; left: ${Math.random() * (document.getElementById('sourceArea').clientWidth - width)}px; top: 0;`;
        block.textContent = number;
        block.dataset.number = number;
        block.dataset.width = width;

        const animation = block.animate(
            [{ transform: 'translateY(0)' }, { transform: `translateY(${document.getElementById('sourceArea').clientHeight - 24}px)` }],
            { duration: config.fallDuration, easing: 'linear', fill: 'forwards' }
        );

        document.getElementById('sourceArea').appendChild(block);

        block.addEventListener('click', () => {
            animation.pause();
            moveToPyramid(block);
        });

        setTimeout(() => block.remove(), config.fallDuration);
    }

    function startSpawning() {
        generateBlock();
        spawnIntervalId = setInterval(generateBlock, config.spawnInterval);
    }

    function moveToPyramid(block) {
        pyramid.push({ 
            number: parseInt(block.dataset.number), 
            width: parseInt(block.dataset.width) 
        });
        pyramid.sort((a, b) => b.width - a.width);
        updatePyramidDisplay();
        block.remove();
    }

    function updatePyramidDisplay() {
        const targetArea = document.getElementById('targetArea');
        targetArea.innerHTML = '';
        
        pyramid.forEach(block => {
            const pyramidBlock = document.createElement('div');
            pyramidBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
            pyramidBlock.style.width = `${block.width}px`;
            pyramidBlock.textContent = block.number;
            pyramidBlock.dataset.number = block.number;
            pyramidBlock.addEventListener('dblclick', () => returnToSource(pyramidBlock));
            
            targetArea.appendChild(pyramidBlock);
        });
    }

    function returnToSource(block) {
        const number = parseInt(block.dataset.number);
        pyramid = pyramid.filter(b => b.number !== number);
        updatePyramidDisplay();

        const newBlock = document.createElement('div');
        newBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        newBlock.style.cssText = `width: ${block.dataset.width}px; position: absolute; left: ${Math.random() * (document.getElementById('sourceArea').clientWidth - parseInt(block.dataset.width))}px; top: 0;`;
        newBlock.textContent = number;
        newBlock.dataset.number = number;
        newBlock.dataset.width = block.dataset.width;

        const animation = newBlock.animate(
            [{ transform: 'translateY(0)' }, { transform: `translateY(${document.getElementById('sourceArea').clientHeight - 24}px)` }],
            { duration: config.fallDuration, easing: 'linear', fill: 'forwards' }
        );

        document.getElementById('sourceArea').appendChild(newBlock);
        setTimeout(() => newBlock.remove(), config.fallDuration);
    }

    function checkPyramid() {
        if (pyramid.length < config.blockCount) {
            showFeedback('Недостаточно блоков! Нужно собрать все 7 ступенек.', false);
            return;
        }

        const isCorrect = Array.from({ length: 7 }, (_, i) => 7 - i)
            .every((num, idx) => num === pyramid[idx].number);

        if (isCorrect) {
            score += config.correctBonus;
            
            if (currentStage < 3) {
                showFeedback(`Этап ${currentStage} пройден! Переход к этапу ${currentStage + 1}`, true);
                setTimeout(() => {
                    currentStage++;
                    document.getElementById('current-stage').textContent = currentStage;
                    resetStage();
                    startSpawning();
                }, 1500);
            } else {
                showFeedback('Все этапы пройдены! Уровень 3 завершён!', true);
                finishLevel();
            }
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
            if (timeLeft <= 0) {
                clearInterval(timerId);
                showFeedback('Время вышло! Игра завершена', false);
                setTimeout(() => window.location.reload(), 3000);
            }
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

    function finishLevel() {
        clearInterval(timerId);
        clearInterval(spawnIntervalId);
        savePlayerScore();
        
        const btn = document.getElementById('action-btn');
        btn.textContent = 'Топ игроков';
        btn.removeEventListener('click', checkPyramid);
        btn.addEventListener('click', () => window.location.href = 'results.html');
    }

    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return;

        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        levelScores.level3 = Math.max(levelScores.level3 || 0, score);
        localStorage.setItem(`levelScores_${playerName}`, JSON.stringify(levelScores));

        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        const playerIndex = rating.findIndex(p => p.username === playerName);
        if (playerIndex !== -1) {
            rating[playerIndex].score = (levelScores.level1 || 0) + (levelScores.level2 || 0) + (levelScores.level3 || 0);
        } else {
            rating.push({ username: playerName, score: (levelScores.level1 || 0) + (levelScores.level2 || 0) + (levelScores.level3 || 0) });
        }
        localStorage.setItem('rating', JSON.stringify(rating));
    }

    initLevel();
});