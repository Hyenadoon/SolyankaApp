import { apiFetch } from '../lib/api';
import type { AuthResponse, MeResponse } from '../types/api';

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiFetch<MeResponse>('/auth/me');
}
