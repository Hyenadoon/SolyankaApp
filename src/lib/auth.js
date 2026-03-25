const TOKEN_KEY = 'solyanka_access_token';
const RECIPE_CACHE_KEY = 'solyanka_recipe_cache';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function cacheRecipe(recipe) {
  if (!recipe?.recipe_id) return;
  const all = getCachedRecipes();
  all[String(recipe.recipe_id)] = recipe;
  localStorage.setItem(RECIPE_CACHE_KEY, JSON.stringify(all));
}

export function getCachedRecipe(id) {
  const all = getCachedRecipes();
  return all[String(id)] || null;
}

function getCachedRecipes() {
  try {
    return JSON.parse(localStorage.getItem(RECIPE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}
