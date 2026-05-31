const API_BASE = 'https://dontstarve.fandom.com/api.php';
let cachedRecipes = null;

export async function fetchAllRecipes() {
    if (cachedRecipes) return cachedRecipes;
    try {
        const url = `${API_BASE}?action=parse&page=Crock_Pot&format=json&origin=*`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const html = data.parse.text['*'];
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const table = doc.querySelector('table.crockpot-recipes');
        if (!table) throw new Error('Table not found');
        const rows = table.querySelectorAll('tr');
        const recipes = [];
        for (let i = 2; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length < 10) continue;
            const name = cells[1]?.textContent.trim();
            if (!name) continue;
            let health = parseFloat(cells[3]?.textContent);
            if (isNaN(health)) health = 0;
            let hunger = parseFloat(cells[4]?.textContent);
            if (isNaN(hunger)) hunger = 0;
            let sanity = parseFloat(cells[5]?.textContent);
            if (isNaN(sanity)) sanity = 0;
            let category = 'hunger';
            if (health > 30) category = 'health';
            else if (sanity > 20) category = 'sanity';
            const id = name.toLowerCase().replace(/[^\w]/g, '_');
            recipes.push({
                id, name, category, health, hunger, sanity
            });
        }
        if (recipes.length === 0) throw new Error('No recipes parsed');
        cachedRecipes = recipes;
        return recipes;
    } catch (error) {
        console.error('API parse error:', error);
        return [];
    }
}

export function sortRecipes(recipes, field, order) {
    const sorted = [...recipes];
    if (field === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        sorted.sort((a, b) => a[field] - b[field]);
    }
    return order === 'desc' ? sorted.reverse() : sorted;
}

export function filterByCategory(recipes, category) {
    if (category === 'all') return [...recipes];
    return recipes.filter(r => r.category === category);
}

export function searchByName(recipes, query) {
    if (!query) return [...recipes];
    const lowerQuery = query.toLowerCase();
    return recipes.filter(r => r.name.toLowerCase().includes(lowerQuery));
}

export function getStatistics(recipes) {
    const total = recipes.length;
    let sumHealth = 0, sumHunger = 0, sumSanity = 0;
    const categoriesCount = { health: 0, hunger: 0, sanity: 0 };
    for (const r of recipes) {
        sumHealth += r.health;
        sumHunger += r.hunger;
        sumSanity += r.sanity;
        categoriesCount[r.category] = (categoriesCount[r.category] || 0) + 1;
    }
    return {
        totalRecipes: total,
        avgHealth: total ? +(sumHealth / total).toFixed(1) : 0,
        avgHunger: total ? +(sumHunger / total).toFixed(1) : 0,
        avgSanity: total ? +(sumSanity / total).toFixed(1) : 0,
        categoriesCount
    };
}