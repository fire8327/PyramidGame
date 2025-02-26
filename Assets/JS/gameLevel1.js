// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных для игры
    let score = 0; // Текущий счет игрока (обнуляется при входе на уровень)
    let timeLeft = 40; // Оставшееся время в секундах
    let timerId; // Идентификатор таймера для его управления
    let blocks = []; // Массив объектов блоков (элемент, ширина, позиция)
    let selectedBlockIndex = -1; // Индекс выбранного блока (-1 = ничего не выбрано)

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
        score = 0; // Обнуляем счет для новой сессии
        updateScore(); // Обновляем отображение счета
        document.getElementById('username').textContent = localStorage.getItem('playerName'); // Устанавливаем имя игрока из localStorage
        document.getElementById('logout-btn').addEventListener('click', () => { // Настраиваем кнопку выхода
            localStorage.removeItem('playerName'); // Удаляем имя из localStorage
            window.location.href = '../index.html'; // Перенаправляем на главную страницу
        });
        generateBlocks(); // Генерируем блоки для игры
        startTimer(); // Запускаем таймер
        document.addEventListener('keydown', handleKeyPress); // Добавляем обработчик клавиш
        document.getElementById('action-btn').addEventListener('click', checkStage); // Настраиваем кнопку проверки
    }

    // Создание и размещение блоков в игровом поле
    function generateBlocks() {
        const gameArea = document.getElementById('gameArea'); // Получаем игровое поле
        gameArea.innerHTML = ''; // Очищаем поле
        blocks = []; // Обнуляем массив блоков

        // Создаем массив ширин и перемешиваем его
        const widths = Array.from({ length: config.blockCount }, (_, i) =>
            config.maxWidth - (i * config.step)
        ).sort(() => Math.random() - 0.5);

        // Создаем блоки на основе ширин
        widths.forEach((width, index) => {
            const block = document.createElement('div'); // Создаем новый элемент div
            block.className = `absolute bg-lime-500 h-6 cursor-pointer transition-all border-2 border-lime-700 rounded-full`; // Устанавливаем стили
            block.style.width = `${width}px`; // Задаем ширину
            block.style.left = '50%'; // Центрируем по горизонтали
            block.style.transform = 'translateX(-50%)'; // Корректируем позицию
            block.style.bottom = `${index * 30 + config.bottomOffset}px`; // Устанавливаем вертикальную позицию
            block.dataset.width = width; // Сохраняем ширину в data-атрибуте

            gameArea.appendChild(block); // Добавляем блок в игровое поле
            blocks.push({ element: block, width: width, position: index }); // Добавляем блок в массив
        });
    }

    // Обработка нажатий клавиш для перемещения блоков
    function handleKeyPress(e) {
        if (selectedBlockIndex === -1) return; // Если блок не выбран, ничего не делаем

        switch (e.key) { // Проверяем нажатую клавишу
            case 'ArrowUp':
                if (selectedBlockIndex < blocks.length - 1) moveBlock(1); // Перемещаем вверх, если не верхний блок
                break;
            case 'ArrowDown':
                if (selectedBlockIndex > 0) moveBlock(-1); // Перемещаем вниз, если не нижний блок
                break;
        }
    }

    // Перемещение выбранного блока вверх или вниз
    function moveBlock(direction) {
        const currentBlock = blocks[selectedBlockIndex]; // Текущий выбранный блок
        const targetIndex = selectedBlockIndex + direction; // Целевой индекс для перемещения
        const targetBlock = blocks[targetIndex]; // Целевой блок

        // Меняем местами блоки в массиве
        [blocks[selectedBlockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[selectedBlockIndex]];
        // Обновляем позиции всех блоков на экране
        blocks.forEach((block, index) => {
            block.element.style.bottom = `${index * 30 + config.bottomOffset}px`;
        });

        selectedBlockIndex = targetIndex; // Обновляем индекс выбранного блока
    }

    // Выбор блока при клике
    function selectBlock(index) {
        blocks.forEach(block =>
            block.element.classList.remove('shadow-[0px_0px_20px_-4px_black]') // Удаляем тень у всех блоков
        );
        selectedBlockIndex = index; // Устанавливаем новый выбранный индекс
        blocks[index].element.classList.add('shadow-[0px_0px_20px_-4px_black]'); // Добавляем тень выбранному блоку
    }

    // Проверка правильности сортировки пирамиды
    function checkStage() {
        const isSorted = blocks.every((block, index, arr) =>
            !index || block.width <= arr[index - 1].width // Проверяем, что каждый блок не шире предыдущего
        );

        if (isSorted) {
            score += config.correctBonus; // Добавляем бонус за успех
            showFeedback('Правильно! Уровень пройден!', true); // Показываем сообщение об успехе
            finishLevel(); // Завершаем уровень
        } else {
            score = Math.max(0, score - config.wrongPenalty); // Вычитаем штраф, но не ниже 0
            showFeedback('Неправильно! Продолжайте сортировку', false); // Показываем сообщение об ошибке
        }
        updateScore(); // Обновляем отображение счета
    }

    // Запуск таймера обратного отсчета
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--; // Уменьшаем время на 1 секунду
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`; // Обновляем текст таймера
            if (timeLeft <= 0) endGame(); // Завершаем игру, если время вышло
        }, 1000); // Интервал 1 секунда
    }

    // Обновление отображения текущего счета
    function updateScore() {
        document.getElementById('current-score').textContent = score;
    }

    // Отображение обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback'); // Получаем элемент обратной связи
        feedback.textContent = message; // Устанавливаем текст
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`; // Устанавливаем цвет текста
    }

    // Завершение игры при истечении времени
    function endGame() {
        clearInterval(timerId); // Останавливаем таймер
        showFeedback('Время вышло! Игра завершена', false); // Показываем сообщение о конце
        setTimeout(() => window.location.reload(), 3000); // Перезагружаем страницу через 3 секунды
    }

    // Завершение уровня при успешной сортировке
    function finishLevel() {
        clearInterval(timerId); // Останавливаем таймер
        savePlayerScore(); // Сохраняем счет игрока
        document.getElementById('action-btn').textContent = 'Следующий уровень'; // Меняем текст кнопки
        document.getElementById('action-btn').removeEventListener('click', checkStage); // Удаляем старый обработчик
        document.getElementById('action-btn').addEventListener('click', () => {
            window.location.href = 'gameLevel2.html'; // Переход на следующий уровень
        });
    }

    // Сохранение счета игрока в localStorage
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return; // Если имени нет, ничего не делаем

        // Сохраняем лучший результат для уровня 1
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level1'] || 0;
        levelScores['level1'] = Math.max(currentLevelScore, score);
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

    // Обработчик клика по игровому полю для выбора блоков
    document.getElementById('gameArea').addEventListener('click', (e) => {
        const blockElement = e.target.closest('[data-width]'); // Находим ближайший блок с атрибутом data-width
        if (blockElement) {
            const index = blocks.findIndex(b => b.element === blockElement); // Определяем индекс блока
            if (index !== -1) selectBlock(index); // Выбираем блок, если он найден
        }
    });

    initLevel(); // Запускаем уровень
});