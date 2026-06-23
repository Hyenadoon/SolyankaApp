import { apiFetch } from '../lib/api';

export function recognizeFridge(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  return apiFetch('/fridge_recognition', {
    method: 'POST',
    body: formData,
  });
}
