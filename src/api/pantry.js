import { apiFetch } from '../lib/api';

export function getPantryItems() {
  return apiFetch('/pantry_items');
}

export function createPantryItem(payload) {
  return apiFetch('/pantry_items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deletePantryItem(id) {
  return apiFetch(`/pantry_items/${id}`, {
    method: 'DELETE',
  });
}
