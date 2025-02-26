document.addEventListener('DOMContentLoaded', () => {
    function loadRating() {
        const rating = JSON.parse(localStorage.getItem('rating')) || [];
        const sortedRating = rating.sort((a, b) => b.score - a.score);
        const container = document.getElementById('rating-list');

        if (sortedRating.length === 0) {
            container.innerHTML = `<div class="text-gray-400 text-center">Рейтинг пока пуст</div>`;
            return;
        }

        container.innerHTML = sortedRating.map((player, index) => `
            <div class="flex items-center gap-6 bg-white shadow-md justify-between p-3 rounded-xl">
                <div class="flex items-center gap-3">
                    <span class="text-lime-600 w-6">${index + 1}.</span>
                    <span class="text-gray-800">Игрок: ${player.username}</span>
                </div>
                <span class="bg-lime-600 text-white px-3 py-1.5 rounded-full">${player.score}</span>
            </div>
        `).join('');
    }

    loadRating();
});