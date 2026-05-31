export function initUI(apiCallbacks) {
    console.log("UI init (stub)");
    apiCallbacks.onLoadRecipes().then(recipes => {
        console.log("Recipes loaded:", recipes);
    });
}