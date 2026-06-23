import { apiFetch } from '../lib/api';

export function searchIngredients(query) {
  return apiFetch(`/ingredients/search?q=${encodeURIComponent(query)}`);
}
