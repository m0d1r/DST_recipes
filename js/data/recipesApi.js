const API_BASE = 'https://dontstarve.fandom.com/api.php';
let cachedRecipes = null;

export async function fetchAllRecipes() {
    if (cachedRecipes) {
        return cachedRecipes;
    }

    try {
        const url = `${API_BASE}?action=parse&page=Crock_Pot_Recipes&format=json&origin=*`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        const html = data.parse.text['*'];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const tables = doc.querySelectorAll('table.wikitable');
        if (tables.length === 0) throw new Error('Table not found');
        
        const recipeTable = tables[0];
        const rows = recipeTable.querySelectorAll('tr');
        
        const recipes = [];
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length < 5) continue;
            
            const nameCell = cells[0];
            const name = nameCell.textContent.trim();
            const id = name.toLowerCase().replace(/[^\w]/g, '_');
            
            const effectsCell = cells[1];
            const effectsText = effectsCell.textContent;
            let health = 0, hunger = 0, sanity = 0;
            const healthMatch = effectsText.match(/\+?(\d+)\s*HP/i);
            const hungerMatch = effectsText.match(/\+?(\d+)\s*Hunger/i);
            const sanityMatch = effectsText.match(/\+?(\d+)\s*Sanity/i);
            if (healthMatch) health = parseInt(healthMatch[1]);
            if (hungerMatch) hunger = parseInt(hungerMatch[1]);
            if (sanityMatch) sanity = parseInt(sanityMatch[1]);
            
            let category = 'hunger';
            if (health > 30) category = 'health';
            else if (sanity > 20) category = 'sanity';
            
            const specials = ['bananapop', 'icecream', 'cooling'];
            if (specials.some(s => id.includes(s))) category = 'special';
            
            const ingredientsCell = cells[2];
            const ingredientsText = ingredientsCell.textContent;
            const ingredients = [];
            const parts = ingredientsText.split(/[,+]/);
            for (let part of parts) {
                const match = part.match(/(\d*\.?\d*)\s*(.+)/);
                if (match) {
                    let amount = parseFloat(match[1]) || 1;
                    let type = match[2].trim().toLowerCase();
                    if (type.includes('meat')) type = 'meat';
                    else if (type.includes('fruit')) type = 'fruit';
                    else if (type.includes('veggie')) type = 'veggie';
                    else if (type.includes('filler')) type = 'filler';
                    else if (type.includes('sweet')) type = 'sweetener';
                    else if (type.includes('ice')) type = 'ice';
                    else if (type.includes('twig')) type = 'twig';
                    else if (type.includes('honey')) type = 'honey';
                    ingredients.push({ type, amount });
                }
            }
            
            recipes.push({
                id,
                name,
                category,
                health,
                hunger,
                sanity,
                ingredients,
                specialEffect: category === 'special' ? 'cooling' : null
            });
        }
        
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
    const categoriesCount = { health: 0, hunger: 0, sanity: 0, special: 0 };
    for (const r of recipes) {
        sumHealth += r.health;
        sumHunger += r.hunger;
        sumSanity += r.sanity;
        if (categoriesCount.hasOwnProperty(r.category)) categoriesCount[r.category]++;
        else categoriesCount[r.category] = 1;
    }
    return {
        totalRecipes: total,
        avgHealth: total ? +(sumHealth / total).toFixed(1) : 0,
        avgHunger: total ? +(sumHunger / total).toFixed(1) : 0,
        avgSanity: total ? +(sumSanity / total).toFixed(1) : 0,
        categoriesCount
    };
}