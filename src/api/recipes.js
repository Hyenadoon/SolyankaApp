import { apiFetch } from '../lib/api';
import { ALL_RECIPES_CATALOG } from '../data/allRecipesCatalog';

export function getRecommendations(maxMissing = 3, options = {}) {
  const params = new URLSearchParams();
  params.set('max_missing', String(maxMissing));
  if (options.minMatchRatio != null) {
    params.set('min_match_ratio', String(options.minMatchRatio));
  }
  return apiFetch(`/recipes/recommendations?${params.toString()}`);
}

export function getAllRecipesCatalog() {
  return ALL_RECIPES_CATALOG.map((recipe) => ({ ...recipe }));
}

export function getCatalogRecipeById(id) {
  return ALL_RECIPES_CATALOG.find((recipe) => String(recipe.recipe_id) === String(id)) || null;
}
