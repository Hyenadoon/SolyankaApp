import { apiFetch } from '../lib/api';
import type { FridgeRecognitionResponse } from '../types/api';

export function recognizeFridge() {
  return apiFetch<FridgeRecognitionResponse>('/fridge_recognition', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
