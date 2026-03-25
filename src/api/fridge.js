import { apiFetch } from '../lib/api';

export function recognizeFridge() {
  return apiFetch('/fridge_recognition', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
