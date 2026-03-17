import { apiFetch } from '../lib/api';
import type { CookingSessionResponse } from '../types/api';

export function createCookingSession(recipeId: number) {
  return apiFetch<CookingSessionResponse>('/cooking_sessions', {
    method: 'POST',
    body: JSON.stringify({ recipe_id: recipeId }),
  });
}

export function getCookingSession(sessionId: number) {
  return apiFetch<CookingSessionResponse>(`/cooking_sessions/${sessionId}`);
}

export function updateCookingStep(sessionId: number, stepId: number, completed: boolean) {
  return apiFetch<{ id: number; recipe_step_id: number; completed: boolean; completed_at: string | null }>(
    `/cooking_sessions/${sessionId}/steps/${stepId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    },
  );
}

export function finishCookingSession(sessionId: number) {
  return apiFetch<CookingSessionResponse>(`/cooking_sessions/${sessionId}/finish`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
