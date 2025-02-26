// Ждем полной загрузки DOM перед выполнением кода
document.addEventListener('DOMContentLoaded', () => {
    // Функция для загрузки и отображения рейтинга игроков
    function loadRating() {
        // Получаем данные рейтинга из localStorage, если их нет — пустой массив
        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        // Сортируем рейтинг по убыванию очков
        const sortedRating = rating.sort((a, b) => b.score - a.score);
        // Получаем контейнер для списка рейтинга
        const container = document.getElementById('rating-list');

        // Если рейтинг пуст, показываем сообщение
        if (sortedRating.length === 0) {
            container.innerHTML = `<div class="text-gray-400 text-center">Рейтинг пока пуст</div>`;
            return; // Прерываем функцию
        }

        // Генерируем HTML для каждого игрока в рейтинге
        container.innerHTML = sortedRating.map((player, index) => `
            <div class="flex items-center gap-6 bg-white shadow-md justify-between p-3 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-lime-600 w-6">${index + 1}.</span> <!-- Номер места в рейтинге -->
                    <span class="text-gray-800">Игрок: ${player.username}</span> <!-- Имя игрока -->
                </div>
                <span class="bg-lime-600 text-white px-3 py-1.5 rounded-full">${player.score}</span> <!-- Общий счет игрока -->
            </div>
        `).join(''); // Преобразуем массив в строку HTML без разделителей
    }

    // Вызываем функцию загрузки рейтинга при загрузке страницы
    loadRating();
});