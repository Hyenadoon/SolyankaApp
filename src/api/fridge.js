import { apiFetch } from '../lib/api';

/**
 * Sends a photo of the fridge / groceries to the OpenAI Vision endpoint and
 * returns recognised products mapped to catalog ingredients.
 *
 * @param {File} file - image captured or picked by the user
 * @returns {Promise<{ suggested_ingredients: Array }>}
 */
export function recognizeFridge(file) {
  const formData = new FormData();
  formData.append('image', file);

  return apiFetch('/vision/analyze', {
    method: 'POST',
    body: formData,
  });
}
