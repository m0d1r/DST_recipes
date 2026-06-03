// Инициализация UI: получает колбэки для работы с данными
export function initUI({
    onLoadRecipes,
    onFilterChange,
    onSortChange,
    onSearch,
    onGetStatistics
}) {
    let allRecipes = [];
    let currentCategory = 'all';
    let currentSearchQuery = '';
    let currentSortField = 'name';
    let currentSortOrder = 'asc';
    let currentUsername = '';

    // DOM-элементы
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainScreen = document.getElementById('main-screen');
    const welcomeForm = document.getElementById('welcome-form');
    const usernameInput = document.getElementById('username-input');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

    const searchInput = document.getElementById('search-input');
    const sortFieldSelect = document.getElementById('sort-field');
    const sortOrderSelect = document.getElementById('sort-order');
    const tabsContainer = document.getElementById('tabs-container');

    const recipesGrid = document.getElementById('recipes-grid');
    const statsContent = document.getElementById('stats-content');

    // Показать экран приветствия (очистить поле)
    function showWelcomeScreen() {
        welcomeScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
        usernameInput.value = '';
    }

    // Показать главный экран, установить приветствие, загрузить данные
    function showMainScreen(username) {
        currentUsername = username;
        welcomeScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        userGreeting.textContent = `Привет, ${username}!`;
        loadData();
    }

    // Загрузка данных через колбэк
    async function loadData() {
        recipesGrid.innerHTML = '<p>Загрузка блюд из котла...</p>';
        try {
            allRecipes = await onLoadRecipes();
            if (allRecipes.length === 0) {
                recipesGrid.innerHTML = '<p>Не удалось загрузить блюда. Попробуйте позже.</p>';
            } else {
                renderApp();
            }
        } catch (error) {
            recipesGrid.innerHTML = `<p style="color: #aa2222;">Ошибка исследования: ${error.message || error}</p>`;
        }
    }

    // Полный рендер (применяет фильтр, поиск, сортировку)
    function renderApp() {
        let processed = [...allRecipes];
        processed = onFilterChange(processed, currentCategory);
        processed = onSearch(processed, currentSearchQuery);
        processed = onSortChange(processed, currentSortField, currentSortOrder);
        renderGrid(processed);
        renderStats(processed);
    }

    // Отрисовка карточек блюд
    function renderGrid(recipes) {
        recipesGrid.innerHTML = '';
        if (recipes.length === 0) {
            recipesGrid.innerHTML = '<p>Блюда не найдены в этой глуши...</p>';
            return;
        }
        for (const recipe of recipes) {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <h4>${recipe.name}</h4>
                <div class="recipe-stats">
                    <div class="stat-row">
                        <span class="stat-label">Здоровье:</span>
                        <span class="stat-val health">${recipe.health}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Голод:</span>
                        <span class="stat-val hunger">${recipe.hunger}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Рассудок:</span>
                        <span class="stat-val sanity">${recipe.sanity}</span>
                    </div>
                </div>
            `;
            recipesGrid.appendChild(card);
        }
    }

    // Отрисовка статистики
    function renderStats(recipes) {
        const stats = onGetStatistics(recipes);
        statsContent.innerHTML = `
            <div class="stat-item"><span>Всего блюд:</span> <strong>${stats.totalRecipes}</strong></div>
            <div class="stat-item"><span>Ср. здоровье:</span> <strong>${stats.avgHealth}</strong></div>
            <div class="stat-item"><span>Ср. голод:</span> <strong>${stats.avgHunger}</strong></div>
            <div class="stat-item"><span>Ср. рассудок:</span> <strong>${stats.avgSanity}</strong></div>
            <h4 style="margin: 20px 0 10px 0; font-size: 16px; color: var(--dst-parchment-dark); border-bottom: 1px dashed var(--dst-border-color); padding-bottom: 5px; text-transform: uppercase; text-align: center;">По категориям</h4>
            <div class="stat-item"><span>Здоровье:</span> <span>${stats.categoriesCount.health || 0}</span></div>
            <div class="stat-item"><span>Голод:</span> <span>${stats.categoriesCount.hunger || 0}</span></div>
            <div class="stat-item"><span>Рассудок:</span> <span>${stats.categoriesCount.sanity || 0}</span></div>
        `;
    }

    // Обработчики событий
    welcomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = usernameInput.value.trim();
        if (name) {
            showMainScreen(name);
        }
    });

    logoutBtn.addEventListener('click', () => {
        showWelcomeScreen();
    });

    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderApp();
    });

    sortFieldSelect.addEventListener('change', (e) => {
        currentSortField = e.target.value;
        renderApp();
    });

    sortOrderSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        renderApp();
    });

    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderApp();
        }
    });

    // Запуск: показать экран приветствия
    showWelcomeScreen();
}