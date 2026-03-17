import { apiFetch } from '../lib/api';
import type { PantryItem } from '../types/api';

export function getPantryItems() {
  return apiFetch<PantryItem[]>('/pantry_items');
}

export function createPantryItem(payload: {
  ingredient_id: number;
  amount?: number | null;
  unit?: string | null;
}) {
  return apiFetch<PantryItem>('/pantry_items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deletePantryItem(id: number) {
  return apiFetch<void>(`/pantry_items/${id}`, {
    method: 'DELETE',
  });
}
