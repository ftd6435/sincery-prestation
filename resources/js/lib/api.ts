import type { ApiErrorShape, ApiSuccessShape } from '../types/admin';

const API_PREFIX = '/api';

export const TOKEN_STORAGE_KEY = 'sincery.admin.token';
const TOKEN_REF_PREFIX = 'Bearer ';

/**
 * Low-level fetch wrapper around the Laravel Sanctum API.
 *
 * - Auto-prefixes relative URLs with /api
 * - Injects Accept + X-Requested-With headers + Bearer token (if any)
 * - Parses JSON; throws ApiRequestError on non-2xx with { message, errors, status }
 * - Intercepts 401 (unauthenticated) → clears token + fires global CustomEvent
 *   'sincery:auth:logged-out' so AdminAuthContext can clear its state
 * - Handles form-data (file uploads) by skipping JSON stringify + Content-Type header
 */

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[] | undefined>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    if (token === null) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch {
    /* ignore storage errors (private mode, quota) */
  }
}

export function clearStoredToken(): void {
  writeToken(null);
}

export function storeToken(token: string): void {
  writeToken(token);
}

function buildAbsoluteUrl(url: string): string {
  if (/^https?:/.test(url)) return url;
  if (url.startsWith(API_PREFIX + '/') || url === API_PREFIX) return url;
  if (url.startsWith('/')) return API_PREFIX + url;
  return `${API_PREFIX}/${url}`;
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function parseResponse<T>(response: Response): Promise<ApiSuccessShape<T>> {
  let payload: ApiSuccessShape<T> | ApiErrorShape | null = null;
  let text = '';

  try {
    text = await response.text();
  } catch {
    /* network / body stream errors */
  }

  if (text) {
    try {
      payload = JSON.parse(text) as ApiSuccessShape<T> | ApiErrorShape;
    } catch {
      payload = null;
    }
  }

  if (response.ok) {
    if (payload && typeof payload === 'object') {
      // Token is at root level for successResponseWithToken shape: { status, data, token }
      if ('token' in payload && typeof (payload as { token?: unknown }).token === 'string') {
        storeToken((payload as { token: string }).token);
      }
      if ('data' in payload) {
        return payload as ApiSuccessShape<T>;
      }
    }
    return { success: true, data: payload as unknown as T, message: undefined };
  }

  // error branch
  let message = `Erreur ${response.status}`;
  let errors: Record<string, string[] | undefined> | undefined = undefined;

  if (payload && typeof payload === 'object') {
    if ('message' in payload && typeof payload.message === 'string') {
      message = payload.message;
    }
    if ('errors' in payload && payload.errors && typeof payload.errors === 'object') {
      errors = payload.errors as Record<string, string[] | undefined>;
    }
  } else if (text) {
    message = text;
  }

  throw new ApiRequestError(message, response.status, errors);
}

export async function request<T>(
  method: RequestMethod,
  rawUrl: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const url = buildAbsoluteUrl(rawUrl);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(extraHeaders ?? {}),
  };

  const token = readToken();
  if (token) {
    headers.Authorization = TOKEN_REF_PREFIX + token;
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'same-origin',
  };

  if (body !== undefined) {
    if (method === 'GET') {
      throw new Error('GET requests cannot include a body');
    }
    if (isFormData(body)) {
      init.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    throw new ApiRequestError(
      cause instanceof Error ? cause.message : 'Erreur réseau',
      0,
    );
  }

  if (response.status === 401) {
    clearStoredToken();
    try {
      window.dispatchEvent(new CustomEvent('sincery:auth:logged-out'));
    } catch {
      /* ignore */
    }
  }

  const parsed = await parseResponse<T>(response);
  return parsed.data;
}

export const api = {
  get: <T>(url: string, extraHeaders?: Record<string, string>) =>
    request<T>('GET', url, undefined, extraHeaders),
  post: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('POST', url, body, extraHeaders),
  put: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('PUT', url, body, extraHeaders),
  patch: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('PATCH', url, body, extraHeaders),
  delete: <T>(url: string, extraHeaders?: Record<string, string>) =>
    request<T>('DELETE', url, undefined, extraHeaders),

  upload: <T>(url: string, formData: FormData) =>
    request<T>('POST', url, formData),
};

export function firstErrorByField(
  errors: Record<string, string[] | undefined> | undefined,
  field: string,
): string | null {
  const arr = errors?.[field];
  if (!arr || arr.length === 0) return null;
  return arr[0] ?? null;
}
