export const mockRecipes = [
    {
        id: "dragonpie",
        name: "Пирог с драконьим фруктом",
        category: "health",
        health: 40,
        hunger: 75,
        sanity: 5,
        ingredients: [
            { type: "fruit", amount: 1 },
            { type: "meat", amount: 1 },
            { type: "veggie", amount: 1 }
        ],
        specialEffect: null
    },
    {
        id: "meatballs",
        name: "Фрикадельки",
        category: "hunger",
        health: 3,
        hunger: 62,
        sanity: 5,
        ingredients: [
            { type: "meat", amount: 0.5 },
            { type: "filler", amount: 3 }
        ]
    },
    {
        id: "bananapop",
        name: "Банановое мороженое",
        category: "special",
        health: 20,
        hunger: 12,
        sanity: 33,
        ingredients: [
            { type: "fruit", amount: 1 },
            { type: "ice", amount: 1 },
            { type: "twig", amount: 1 }
        ],
        specialEffect: "cooling"
    },
    {
        id: "pumpkincookie",
        name: "Тыквенное печенье",
        category: "sanity",
        health: 0,
        hunger: 37,
        sanity: 15,
        ingredients: [
            { type: "veggie", amount: 1 },
            { type: "sweetener", amount: 2 }
        ]
    },
    {
        id: "honeyham",
        name: "Медовая ветчина",
        category: "hunger",
        health: 30,
        hunger: 75,
        sanity: 5,
        ingredients: [
            { type: "meat", amount: 2 },
            { type: "honey", amount: 1 }
        ]
    }
];

export async function fetchAllRecipes() {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...mockRecipes]), 100);
    });
}

export function sortRecipes(recipes, field, order) {
    const sorted = [...recipes];
    if (field === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        sorted.sort((a, b) => a[field] - b[field]);
    }
    return order === "desc" ? sorted.reverse() : sorted;
}

export function filterByCategory(recipes, category) {
    if (category === "all") return [...recipes];
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
        categoriesCount[r.category]++;
    }
    return {
        totalRecipes: total,
        avgHealth: total ? +(sumHealth / total).toFixed(1) : 0,
        avgHunger: total ? +(sumHunger / total).toFixed(1) : 0,
        avgSanity: total ? +(sumSanity / total).toFixed(1) : 0,
        categoriesCount
    };
}