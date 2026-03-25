import { apiFetch } from '../lib/api';
import { ALL_RECIPES_CATALOG } from '../data/allRecipesCatalog';

export function getRecommendations(maxMissing = 3) {
  return apiFetch(`/recipes/recommendations?max_missing=${maxMissing}`);
}

export function getAllRecipesCatalog() {
  return ALL_RECIPES_CATALOG.map((recipe) => ({ ...recipe }));
}

export function getCatalogRecipeById(id) {
  return ALL_RECIPES_CATALOG.find((recipe) => String(recipe.recipe_id) === String(id)) || null;
}
