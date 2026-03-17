import { apiFetch } from '../lib/api';
import type { RecommendationsResponse } from '../types/api';

export function getRecommendations(maxMissing = 3) {
  return apiFetch<RecommendationsResponse>(`/recipes/recommendations?max_missing=${maxMissing}`);
}
