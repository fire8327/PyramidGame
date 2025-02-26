document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let timeLeft = 40;
    let timerId;
    let blocks = [];
    let selectedBlockIndex = -1;

    const config = {
        blockCount: 7,
        minWidth: 16,
        maxWidth: 128,
        step: 16,
        correctBonus: 10,
        wrongPenalty: 5,
        bottomOffset: 20
    };

    function initLevel() {
        score = 0;
        updateScore();
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

    function selectBlock(index) {
        blocks.forEach(block =>
            block.element.classList.remove('shadow-[0px_0px_20px_-4px_black]')
        );
        selectedBlockIndex = index;
        blocks[index].element.classList.add('shadow-[0px_0px_20px_-4px_black]');
    }

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
        document.getElementById('action-btn').textContent = 'Следующий уровень';
        document.getElementById('action-btn').removeEventListener('click', checkStage);
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'gameLevel2.html';
        });
    }

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
    
    function calculateTotalScore(playerName) {
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        return (
            (levelScores['level1'] || 0) +
            (levelScores['level2'] || 0) +
            (levelScores['level3'] || 0)
        );
    }

    document.getElementById('gameArea').addEventListener('click', (e) => {
        const blockElement = e.target.closest('[data-width]');
        if (blockElement) {
            const index = blocks.findIndex(b => b.element === blockElement);
            if (index !== -1) selectBlock(index);
        }
    });

    initLevel();
});