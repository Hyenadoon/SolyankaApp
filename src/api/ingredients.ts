import { apiFetch } from '../lib/api';
import type { IngredientSearchItem } from '../types/api';

export function searchIngredients(query: string) {
  return apiFetch<IngredientSearchItem[]>(`/ingredients/search?q=${encodeURIComponent(query)}`);
}
