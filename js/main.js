import { fetchAllRecipes, sortRecipes, filterByCategory, searchByName, getStatistics } from './data/recipesApi.js';
import { initUI } from './ui/uiRenderer.js';

async function loadRecipes() {
    try {
        const data = await fetchAllRecipes();
        console.log(`Loaded ${data.length} recipes from wiki`);
        return data;
    } catch (err) {
        console.error("Load error:", err);
        return [];
    }
}

initUI({
    onLoadRecipes: loadRecipes,
    onFilterChange: (recipes, category) => filterByCategory(recipes, category),
    onSortChange: (recipes, field, order) => sortRecipes(recipes, field, order),
    onSearch: (recipes, query) => searchByName(recipes, query),
    onGetStatistics: getStatistics
});