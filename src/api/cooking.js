import { apiFetch } from '../lib/api';

export function createCookingSession(recipeId) {
  return apiFetch('/cooking_sessions', {
    method: 'POST',
    body: JSON.stringify({ recipe_id: recipeId }),
  });
}

export function getCookingSession(sessionId) {
  return apiFetch(`/cooking_sessions/${sessionId}`);
}

export function updateCookingStep(sessionId, stepId, completed) {
  return apiFetch(`/cooking_sessions/${sessionId}/steps/${stepId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function finishCookingSession(sessionId) {
  return apiFetch(`/cooking_sessions/${sessionId}/finish`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
