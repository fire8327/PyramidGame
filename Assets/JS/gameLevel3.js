document.addEventListener('DOMContentLoaded', () => {
    // Переменные состояния игры
    let score = 0;               // Текущий счёт игрока
    let timeLeft = 180;          // Оставшееся время на уровень (в секундах)
    let timerId;                 // Идентификатор таймера
    let currentStage = 1;        // Текущий этап (1–3)
    let pyramid = [];            // Массив ступенек в пирамиде
    let spawnIntervalId;         // Идентификатор интервала для спавна ступенек

    // Объект конфигурации игры
    const config = {
        blockCount: 7,           // Количество ступенек, необходимых для завершения пирамиды
        minWidth: 16,            // Минимальная ширина ступеньки (в пикселях)
        maxWidth: 128,           // Максимальная ширина ступеньки (в пикселях)
        step: 16,                // Шаг изменения ширины между ступеньками
        correctBonus: 30,        // Бонус к счёту за правильную пирамиду
        wrongPenalty: 25,        // Штраф за неправильную пирамиду
        spawnInterval: 2000,     // Интервал спавна новых ступенек (в миллисекундах)
        fallDuration: 5000       // Начальная длительность анимации падения ступеньки (в миллисекундах)
    };

    // Инициализация уровня
    function initLevel() {
        score = 0; // Обнуляем счёт
        updateScore(); // Обновляем отображение счёта
        document.getElementById('current-stage').textContent = currentStage; // Устанавливаем текущий этап
        document.getElementById('username').textContent = localStorage.getItem('playerName') || 'Гость'; // Устанавливаем имя игрока
        
        // Настраиваем кнопку выхода
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('playerName'); // Удаляем имя игрока из localStorage
            window.location.href = '../index.html'; // Перенаправляем на главную страницу
        });

        startGame(); // Запускаем игру
        document.getElementById('action-btn').addEventListener('click', checkPyramid); // Настраиваем кнопку проверки
    }

    // Запуск игры: сброс этапа, таймера и спавна ступенек
    function startGame() {
        resetStage(); // Сбрасываем этап
        startTimer(); // Запускаем таймер
        startSpawning(); // Запускаем спавн ступенек
    }

    // Сброс этапа для новой попытки
    function resetStage() {
        clearInterval(spawnIntervalId); // Останавливаем спавн ступенек
        pyramid = []; // Очищаем пирамиду
        document.getElementById('sourceArea').innerHTML = ''; // Очищаем левый блок
        document.getElementById('targetArea').innerHTML = ''; // Очищаем правый блок
    }

    // Генерация новой падающей ступеньки
    function generateBlock() {
        // Получаем доступные номера, которые еще не в пирамиде
        const availableNumbers = Array.from({ length: config.blockCount }, (_, i) => i + 1)
            .filter(num => !pyramid.some(block => block.number === num));
        
        if (availableNumbers.length === 0) return; // Если все номера в пирамиде, не спавним

        // Выбираем случайный номер из доступных
        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const width = config.maxWidth - (config.step * (7 - number)); // Вычисляем ширину на основе номера
        const block = document.createElement('div'); // Создаем новый div
        
        // Устанавливаем стили и классы для ступеньки
        block.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        block.style.cssText = `width: ${width}px; position: absolute; left: ${Math.random() * (document.getElementById('sourceArea').clientWidth - width)}px; top: 0;`;
        block.textContent = number; // Устанавливаем номер
        block.dataset.number = number; // Сохраняем номер в data-атрибуте
        block.dataset.width = width; // Сохраняем ширину в data-атрибуте

        // Создаем анимацию падения
        const animation = block.animate(
            [{ transform: 'translateY(0)' }, { transform: `translateY(${document.getElementById('sourceArea').clientHeight - 24}px)` }],
            { duration: config.fallDuration, easing: 'linear', fill: 'forwards' }
        );

        document.getElementById('sourceArea').appendChild(block); // Добавляем ступеньку в левый блок

        // Добавляем обработчик клика для перемещения в пирамиду
        block.addEventListener('click', () => {
            animation.pause(); // Останавливаем анимацию
            moveToPyramid(block); // Перемещаем ступеньку в пирамиду
        });

        // Удаляем ступеньку после завершения анимации
        setTimeout(() => block.remove(), config.fallDuration);
    }

    // Запуск спавна ступенек с интервалом
    function startSpawning() {
        generateBlock(); // Генерируем первую ступеньку сразу
        spawnIntervalId = setInterval(generateBlock, config.spawnInterval); // Запускаем спавн с интервалом
    }

    // Перемещение ступеньки в пирамиду
    function moveToPyramid(block) {
        pyramid.push({ 
            number: parseInt(block.dataset.number), 
            width: parseInt(block.dataset.width) 
        }); // Добавляем ступеньку в пирамиду
        pyramid.sort((a, b) => b.width - a.width); // Сортируем пирамиду по убыванию ширины
        updatePyramidDisplay(); // Обновляем отображение пирамиды
        block.remove(); // Удаляем ступеньку из левого блока
    }

    // Обновление отображения пирамиды
    function updatePyramidDisplay() {
        const targetArea = document.getElementById('targetArea'); // Получаем правый блок
        targetArea.innerHTML = ''; // Очищаем правый блок
        
        pyramid.forEach(block => { // Проходим по всем ступенькам в пирамиде
            const pyramidBlock = document.createElement('div'); // Создаем новый div
            pyramidBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
            pyramidBlock.style.width = `${block.width}px`; // Устанавливаем ширину
            pyramidBlock.textContent = block.number; // Устанавливаем номер
            pyramidBlock.dataset.number = block.number; // Сохраняем номер в data-атрибуте
            pyramidBlock.addEventListener('dblclick', () => returnToSource(pyramidBlock)); // Обработчик двойного клика для возврата
            targetArea.appendChild(pyramidBlock); // Добавляем ступеньку в правый блок
        });
    }

    // Возвращение ступеньки из пирамиды в левый блок
    function returnToSource(block) {
        const number = parseInt(block.dataset.number); // Получаем номер ступеньки
        pyramid = pyramid.filter(b => b.number !== number); // Удаляем ступеньку из пирамиды
        updatePyramidDisplay(); // Обновляем отображение пирамиды

        const newBlock = document.createElement('div'); // Создаем новую ступеньку
        newBlock.className = 'h-6 bg-lime-500 cursor-pointer rounded-full border-2 border-lime-700 flex items-center justify-center text-white';
        newBlock.style.cssText = `width: ${block.dataset.width}px; position: absolute; left: ${Math.random() * (document.getElementById('sourceArea').clientWidth - parseInt(block.dataset.width))}px; top: 0;`;
        newBlock.textContent = number; // Устанавливаем номер
        newBlock.dataset.number = number; // Сохраняем номер
        newBlock.dataset.width = block.dataset.width; // Сохраняем ширину

        // Создаем анимацию падения
        const animation = newBlock.animate(
            [{ transform: 'translateY(0)' }, { transform: `translateY(${document.getElementById('sourceArea').clientHeight - 24}px)` }],
            { duration: config.fallDuration, easing: 'linear', fill: 'forwards' }
        );

        document.getElementById('sourceArea').appendChild(newBlock); // Добавляем ступеньку в левый блок
        setTimeout(() => newBlock.remove(), config.fallDuration); // Удаляем после анимации
    }

    // Проверка правильности пирамиды
    function checkPyramid() {
        if (pyramid.length < config.blockCount) { // Проверяем, собраны ли все ступеньки
            showFeedback('Недостаточно блоков! Нужно собрать все 7 ступенек.', false);
            return;
        }

        const isCorrect = Array.from({ length: 7 }, (_, i) => 7 - i)
            .every((num, idx) => num === pyramid[idx].number); // Проверяем порядок номеров (7-1 снизу вверх)

        if (isCorrect) {
            score += config.correctBonus; // Добавляем бонус
            
            if (currentStage < 3) {
                showFeedback(`Этап ${currentStage} пройден! Переход к этапу ${currentStage + 1}`, true);
                setTimeout(() => {
                    currentStage++; // Увеличиваем номер этапа
                    document.getElementById('current-stage').textContent = currentStage;
                    resetStage(); // Сбрасываем этап
                    // УВЕЛИЧЕНИЕ СКОРОСТИ ПАДЕНИЯ: Уменьшаем fallDuration на 500 мс, но не ниже 1000 мс
                    config.fallDuration = Math.max(1000, config.fallDuration - 500);
                    startSpawning(); // Запускаем спавн для нового этапа
                }, 1500);
            } else {
                showFeedback('Все этапы пройдены! Уровень 3 завершён!', true);
                finishLevel(); // Завершаем уровень
            }
        } else {
            score = Math.max(0, score - config.wrongPenalty); // Вычитаем штраф
            showFeedback('Неправильно! Пирамида должна быть от 7 (снизу) до 1 (сверху).', false);
        }
        updateScore(); // Обновляем счёт
    }

    // Запуск таймера игры
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--; // Уменьшаем время на 1 секунду
            document.getElementById('timer').textContent = `Осталось: ${timeLeft} сек`; // Обновляем текст таймера
            if (timeLeft <= 0) {
                clearInterval(timerId); // Останавливаем таймер
                showFeedback('Время вышло! Игра завершена', false); // Показываем сообщение о конце
                setTimeout(() => window.location.reload(), 3000); // Перезагружаем страницу через 3 секунды
            }
        }, 1000); // Интервал 1 секунда
    }

    // Обновление отображения счёта
    function updateScore() {
        document.getElementById('current-score').textContent = score; // Устанавливаем текущий счёт в интерфейсе
    }

    // Отображение обратной связи
    function showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback'); // Получаем элемент обратной связи
        feedback.textContent = message; // Устанавливаем текст
        feedback.className = `text-lg font-semibold text-center mt-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`; // Устанавливаем цвет текста
    }

    // Завершение уровня и подготовка к странице результатов
    function finishLevel() {
        clearInterval(timerId); // Останавливаем таймер
        clearInterval(spawnIntervalId); // Останавливаем спавн ступенек
        savePlayerScore(); // Сохраняем счёт игрока
        
        const btn = document.getElementById('action-btn'); // Получаем кнопку действия
        btn.textContent = 'Топ игроков'; // Меняем текст кнопки
        btn.removeEventListener('click', checkPyramid); // Удаляем старый обработчик
        btn.addEventListener('click', () => window.location.href = 'results.html'); // Переход на страницу топа
    }

    // Сохранение счёта игрока в localStorage
    function savePlayerScore() {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) return; // Если имени нет, ничего не делаем

        // Сохраняем лучший результат для уровня 3
        const levelScores = JSON.parse(localStorage.getItem(`levelScores_${playerName}`)) || {};
        levelScores.level3 = Math.max(levelScores.level3 || 0, score);
        localStorage.setItem(`levelScores_${playerName}`, JSON.stringify(levelScores));

        // Обновляем общий счёт в рейтинге
        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        const playerIndex = rating.findIndex(p => p.username === playerName);
        if (playerIndex !== -1) {
            rating[playerIndex].score = (levelScores.level1 || 0) + (levelScores.level2 || 0) + (levelScores.level3 || 0);
        } else {
            rating.push({ username: playerName, score: (levelScores.level1 || 0) + (levelScores.level2 || 0) + (levelScores.level3 || 0) });
        }
        localStorage.setItem('rating', JSON.stringify(rating));
    }

    initLevel(); // Запускаем уровень
});