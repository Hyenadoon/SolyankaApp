import { apiFetch } from '../lib/api';

export function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function register(email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiFetch('/auth/me');
}
