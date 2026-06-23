const STORAGE_KEYS = {
  token: 'solyanka_access_token',
  recipeCache: 'solyanka_recipe_cache',
};

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token) || '';
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function cacheRecipe(recipe) {
  if (!recipe?.recipe_id) return;
  const all = getCachedRecipes();
  all[String(recipe.recipe_id)] = recipe;
  localStorage.setItem(STORAGE_KEYS.recipeCache, JSON.stringify(all));
}

export function getCachedRecipe(id) {
  const all = getCachedRecipes();
  return all[String(id)] || null;
}

function getCachedRecipes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.recipeCache) || '{}');
  } catch {
    return {};
  }
}
