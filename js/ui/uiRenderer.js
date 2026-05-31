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

    const modal = document.getElementById('ingredient-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.querySelector('.modal-close');

    const ingredientDetails = {
        fruit: "Драконий фрукт, Банан, Гранат, Дуриан, Арбуз, Ягоды",
        meat: "Мясо, Кусочек мяса, Монстромясо, Мясо птицы, Лягушачьи лапки",
        veggie: "Тыква, Морковь, Кукуруза, Баклажан, Грибы, Лишайник",
        filler: "Лёд, Ветки, Ягоды, Поганки, Крылья бабочки",
        sweetener: "Мёд, Пчелиные соты",
        honey: "Мёд",
        ice: "Лёд",
        twig: "Ветка"
    };

    function checkAuth() {
        const savedName = localStorage.getItem('username');
        if (savedName) {
            showMainScreen(savedName);
        } else {
            showWelcomeScreen();
        }
    }

    function showWelcomeScreen() {
        welcomeScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
    }

    function showMainScreen(username) {
        welcomeScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        userGreeting.textContent = `Выживший: ${username}`;
        loadData();
    }

    async function loadData() {
        recipesGrid.innerHTML = '<p>Расшифровка старинных рецептов...</p>';
        try {
            allRecipes = await onLoadRecipes();
            renderApp();
        } catch (error) {
            recipesGrid.innerHTML = `<p style="color: #aa2222;">Ошибка исследования: ${error.message || error}</p>`;
        }
    }

    function renderApp() {
        let processedRecipes = [...allRecipes];

        processedRecipes = onFilterChange(processedRecipes, currentCategory);
        processedRecipes = onSearch(processedRecipes, currentSearchQuery);
        processedRecipes = onSortChange(processedRecipes, currentSortField, currentSortOrder);

        renderGrid(processedRecipes);
        renderStats(processedRecipes);
    }

    function renderGrid(recipes) {
        recipesGrid.innerHTML = '';
        if (recipes.length === 0) {
            recipesGrid.innerHTML = '<p>Рецепты не найдены в этой глуши...</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            const ingredientsHTML = recipe.ingredients.map(ing => {
                return `<span class="ingredient-tag" data-type="${ing.type}">${ing.amount}x ${ing.type}</span>`;
            }).join(' ');

            const imagePath = `js/ui/images/${recipe.id}.png`;

            card.innerHTML = `
                <div>
                    <h4>${recipe.name}</h4>
                    <div class="recipe-image-container">
                        <img src="${imagePath}" alt="${recipe.name}" class="recipe-image" onerror="this.parentNode.style.display='none'">
                    </div>
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
                    <div class="recipe-ingredients">
                        <h5>Компоненты:</h5>
                        ${ingredientsHTML}
                    </div>
                </div>
                ${recipe.specialEffect ? `<div class="special-effect">Эффект: ${recipe.specialEffect}</div>` : ''}
            `;

            recipesGrid.appendChild(card);
        });
    }

    function renderStats(recipes) {
        const stats = onGetStatistics(recipes);

        statsContent.innerHTML = `
            <div class="stat-item"><span>Всего рецептов:</span> <strong>${stats.totalRecipes}</strong></div>
            <div class="stat-item"><span>Ср. здоровье:</span> <strong>${stats.avgHealth}</strong></div>
            <div class="stat-item"><span>Ср. голод:</span> <strong>${stats.avgHunger}</strong></div>
            <div class="stat-item"><span>Ср. рассудок:</span> <strong>${stats.avgSanity}</strong></div>
            <h4 style="margin: 20px 0 10px 0; font-size: 16px; color: var(--dst-parchment-dark); border-bottom: 1px dashed var(--dst-border-color); padding-bottom: 5px; text-transform: uppercase; text-align: center;">По категориям</h4>
            <div class="stat-item"><span>Здоровье:</span> <span>${stats.categoriesCount.health || 0}</span></div>
            <div class="stat-item"><span>Голод:</span> <span>${stats.categoriesCount.hunger || 0}</span></div>
            <div class="stat-item"><span>Рассудок:</span> <span>${stats.categoriesCount.sanity || 0}</span></div>
            <div class="stat-item"><span>Особое:</span> <span>${stats.categoriesCount.special || 0}</span></div>
        `;
    }

    welcomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = usernameInput.value.trim();
        if (name) {
            localStorage.setItem('username', name);
            showMainScreen(name);
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('username');
        usernameInput.value = '';
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

    recipesGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('ingredient-tag')) {
            const type = e.target.dataset.type;
            const items = ingredientDetails[type] || "Примеры неизвестны науке";

            modalTitle.textContent = `Группа: ${type}`;
            modalBody.innerHTML = `<strong>Подходящие элементы:</strong><br>${items}`;
            modal.classList.remove('hidden');
        }
    });

    modalClose.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    checkAuth();
}