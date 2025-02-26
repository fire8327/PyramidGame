// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация переменных для игры
    let score = 0; // Текущий счет игрока (обнуляется при входе на уровень)
    let timeLeft = 60; // Оставшееся время в секундах
    let timerId; // Идентификатор таймера для его остановки
    let pyramid = []; // Массив объектов ступенек в правом блоке (номер и ширина)
    let spawnedBlocks = new Set(); // Множество для отслеживания уже заспавненных номеров (не используется в текущей версии)

    // Конфигурация уровня
    const config = {
        blockCount: 7, // Количество ступенек в пирамиде
        minWidth: 16, // Минимальная ширина ступеньки
        maxWidth: 128, // Максимальная ширина ступеньки
        step: 16, // Шаг изменения ширины между ступеньками
        correctBonus: 30, // Бонус за правильное решение
        wrongPenalty: 25, // Штраф за ошибку
        spawnInterval: 2000, // Интервал спавна новых ступенек (2 секунды)
        fallDuration: 5000 // Длительность падения ступеньки (5 секунд)
    };

    // Инициализация уровня
    function initLevel() {
        score = 0; // Обнуляем счет для новой сессии
        updateScore(); // Обновляем отображение счета
        document.getElementById('username').textContent = localStorage.getItem('playerName') || 'Гость'; // Устанавливаем имя игрока из localStorage или "Гость"
        document.getElementById('logout-btn').addEventListener('click', () => { // Настраиваем кнопку выхода
            localStorage.removeItem('playerName'); // Удаляем имя из localStorage
            window.location.href = '../index.html'; // Перенаправляем на главную страницу
        });
        startSpawning(); // Запускаем процесс спавна ступенек
        startTimer(); // Запускаем таймер
        document.getElementById('action-btn').addEventListener('click', checkPyramid); // Настраиваем кнопку проверки
    }

    // Генерация новой ступеньки в левом блоке
    function generateBlock() {
        // Получаем номера, которые еще не в пирамиде
        const availableNumbers = Array.from({ length: config.blockCount }, (_, i) => i + 1)
            .filter(num => !pyramid.some(block => block.number === num)); // Фильтруем уже использованные номера
        if (availableNumbers.length === 0) return; // Если все номера в пирамиде, прекращаем спавн

        // Выбираем случайный номер из доступных
        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const width = config.maxWidth - (config.step * (7 - number)); // Вычисляем ширину на основе номера
        const block = document.createElement('div'); // Создаем новый элемент div
        block.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white'; // Устанавливаем стили
        block.style.width = `${width}px`; // Задаем ширину
        block.style.position = 'absolute'; // Абсолютное позиционирование
        block.textContent = number; // Устанавливаем номер как текст
        block.dataset.number = number; // Сохраняем номер в data-атрибуте
        block.dataset.width = width; // Сохраняем ширину в data-атрибуте

        const sourceArea = document.getElementById('sourceArea'); // Получаем левый блок
        const containerWidth = sourceArea.clientWidth; // Ширина контейнера
        const containerHeight = sourceArea.clientHeight; // Высота контейнера
        const leftPosition = Math.random() * (containerWidth - width); // Случайная позиция по горизонтали
        block.style.left = `${leftPosition}px`; // Устанавливаем горизонтальную позицию
        block.style.top = '0'; // Начальная позиция сверху

        // Создаем анимацию падения
        const animation = block.animate([
            { transform: 'translateY(0)' }, // Начало (сверху)
            { transform: `translateY(${containerHeight - 24}px)` } // Конец (внизу, 24px = высота h-6)
        ], {
            duration: config.fallDuration, // Длительность анимации
            easing: 'linear', // Линейное движение
            fill: 'forwards' // Оставляем блок в конечной позиции
        });

        sourceArea.appendChild(block); // Добавляем блок в левый контейнер

        // Добавляем обработчик клика для перемещения в пирамиду
        block.addEventListener('click', () => {
            animation.pause(); // Останавливаем анимацию
            moveToPyramid(block); // Перемещаем блок в пирамиду
        });

        // Удаляем блок после окончания анимации, если он еще в DOM
        setTimeout(() => {
            if (block.parentNode) block.remove();
        }, config.fallDuration);
    }

    // Запуск периодического спавна ступенек
    function startSpawning() {
        generateBlock(); // Генерируем первую ступеньку сразу
        setInterval(generateBlock, config.spawnInterval); // Запускаем спавн с интервалом
    }

    // Перемещение ступеньки из левого блока в правый
    function moveToPyramid(block) {
        pyramid.push({ number: parseInt(block.dataset.number), width: parseInt(block.dataset.width) }); // Добавляем ступеньку в пирамиду
        pyramid.sort((a, b) => b.width - a.width); // Сортируем пирамиду по убыванию ширины
        updatePyramidDisplay(); // Обновляем отображение пирамиды
        block.remove(); // Удаляем ступеньку из левого блока
    }

    // Обновление отображения пирамиды в правом блоке
    function updatePyramidDisplay() {
        const targetArea = document.getElementById('targetArea'); // Получаем правый блок
        targetArea.innerHTML = ''; // Очищаем правый блок
        pyramid.forEach((block, index) => { // Проходим по всем ступенькам в пирамиде
            const pyramidBlock = document.createElement('div'); // Создаем новый элемент для ступеньки
            pyramidBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white'; // Устанавливаем стили
            pyramidBlock.textContent = block.number; // Устанавливаем номер
            pyramidBlock.dataset.number = block.number; // Сохраняем номер в data-атрибуте
            pyramidBlock.dataset.width = block.width; // Сохраняем ширину в data-атрибуте
            pyramidBlock.style.width = `${block.width}px`; // Задаем ширину
            pyramidBlock.addEventListener('dblclick', () => returnToSource(pyramidBlock)); // Добавляем обработчик двойного клика
            targetArea.appendChild(pyramidBlock); // Добавляем ступеньку в правый блок
        });
    }

    // Возвращение ступеньки из правого блока в левый по двойному клику
    function returnToSource(block) {
        const number = parseInt(block.dataset.number); // Получаем номер ступеньки
        const width = parseInt(block.dataset.width); // Получаем ширину ступеньки
        pyramid = pyramid.filter(b => b.number !== number); // Удаляем ступеньку из пирамиды

        const sourceArea = document.getElementById('sourceArea'); // Получаем левый блок
        const newBlock = document.createElement('div'); // Создаем новый элемент для ступеньки
        newBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white'; // Устанавливаем стили
        newBlock.style.width = `${width}px`; // Задаем ширину
        newBlock.style.position = 'absolute'; // Абсолютное позиционирование
        newBlock.textContent = number; // Устанавливаем номер
        newBlock.dataset.number = number; // Сохраняем номер в data-атрибуте
        newBlock.dataset.width = width; // Сохраняем ширину в data-атрибуте

        const containerWidth = sourceArea.clientWidth; // Ширина контейнера
        const containerHeight = sourceArea.clientHeight; // Высота контейнера
        const leftPosition = Math.random() * (containerWidth - width); // Случайная позиция по горизонтали
        newBlock.style.left = `${leftPosition}px`; // Устанавливаем горизонтальную позицию
        newBlock.style.top = '0'; // Начальная позиция сверху

        // Создаем анимацию падения
        const animation = newBlock.animate([
            { transform: 'translateY(0)' },
            { transform: `translateY(${containerHeight - 24}px)` }
        ], {
            duration: config.fallDuration,
            easing: 'linear',
            fill: 'forwards'
        });

        sourceArea.appendChild(newBlock); // Добавляем ступеньку в левый блок
        newBlock.addEventListener('click', () => { // Добавляем обработчик клика для возврата в пирамиду
            animation.pause();
            moveToPyramid(newBlock);
        });

        // Удаляем ступеньку после окончания анимации, если она еще в DOM
        setTimeout(() => {
            if (newBlock.parentNode) newBlock.remove();
        }, config.fallDuration);

        updatePyramidDisplay(); // Обновляем правый блок после удаления ступеньки
    }

    // Проверка правильности пирамиды
    function checkPyramid() {
        if (pyramid.length < config.blockCount) { // Проверяем, собраны ли все 7 ступенек
            showFeedback('Недостаточно блоков! Нужно собрать все 7 ступенек.', false);
            return;
        }
        const expectedOrder = Array.from({ length: 7 }, (_, i) => 7 - i); // Ожидаемый порядок номеров (7-1 снизу вверх)
        const currentOrder = pyramid.map(block => block.number); // Текущий порядок номеров
        const isCorrect = expectedOrder.every((num, index) => num === currentOrder[index]); // Проверяем совпадение
        if (isCorrect) {
            score += config.correctBonus; // Добавляем бонус за успех
            showFeedback('Правильно! Уровень пройден!', true); // Показываем сообщение об успехе
            finishLevel(); // Завершаем уровень
        } else {
            score = Math.max(0, score - config.wrongPenalty); // Вычитаем штраф, но не ниже 0
            showFeedback('Неправильно! Пирамида должна быть от 7 (снизу) до 1 (сверху).', false); // Сообщение об ошибке
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

    // Завершение уровня при успешной сборке
    function finishLevel() {
        clearInterval(timerId); // Останавливаем таймер
        savePlayerScore(); // Сохраняем счет игрока
        document.getElementById('action-btn').textContent = 'Топ игроков'; // Меняем текст кнопки
        document.getElementById('action-btn').removeEventListener('click', checkPyramid); // Удаляем старый обработчик
        document.getElementById('action-btn').addEventListener('click', () => { // Переход на страницу топа
            window.location.href = 'results.html';
        });
    }

    // Сохранение счета игрока в localStorage
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return; // Если имени нет, ничего не делаем

        // Сохраняем лучший результат для уровня 3
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        const currentLevelScore = levelScores['level3'] || 0;
        levelScores['level3'] = Math.max(currentLevelScore, score);
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

    initLevel(); // Запускаем уровень
});