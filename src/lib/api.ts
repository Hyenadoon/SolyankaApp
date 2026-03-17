import { getToken, clearToken } from './auth';

const FALLBACK_API_URL = 'http://localhost:3000/api/v1';
export const API_BASE_URL = (import.meta.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/$/, '');

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers || {});
  if (!(rest.body instanceof FormData)) {
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
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json() as { error?: string; errors?: string[] };
      errorMessage = errorBody.error || errorBody.errors?.join(', ') || errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
