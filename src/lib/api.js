import { clearToken, getToken } from './auth';

const FALLBACK_API_URL = 'http://localhost:3000/api/v1';
export const API_BASE_URL = (import.meta.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders = new Headers(headers || {});

  if (!(rest.body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (response.status === 401 && auth) {
    clearToken();
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.error || payload.errors?.join(', ') || message;
    } catch {
      // whatever, backend said no and hid the body like a true professional
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}
