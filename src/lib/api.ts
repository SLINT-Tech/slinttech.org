const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8698/api';

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  details?: string;
  data: any;

  constructor(status: number, message: string, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = data?.details;
    this.data = data;
  }
}

export const getAuthToken = (): string | null =>
  localStorage.getItem('token') || localStorage.getItem('authToken');

const toSnakeCase = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamelCase = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());

const convertKeys = (value: any, convert: (key: string) => string): any => {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, convert));
  }

  if (value !== null && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [convert(key), convertKeys(item, convert)])
    );
  }

  return value;
};

export const camelizeKeys = (value: any) => convertKeys(value, toCamelCase);
export const snakeCaseKeys = (value: any) => convertKeys(value, toSnakeCase);

export const toIsoDateTime = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00Z`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const buildUrl = (path: string, query?: Query): string => {
  const url = `${API_BASE_URL}${path}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const buildHeaders = (auth: boolean, hasBody: boolean): HeadersInit => {
  const headers: Record<string, string> = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiRequest = async <T = any>(
  path: string,
  { method = 'GET', body, query, auth = true }: RequestOptions = {}
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: buildHeaders(auth, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(snakeCaseKeys(body)),
  });

  const text = await response.text();
  let payload: any = null;

  if (text) {
    try {
      payload = camelizeKeys(JSON.parse(text));
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
};

export const apiGet = <T = any>(path: string, query?: Query) =>
  apiRequest<T>(path, { method: 'GET', query });

export const apiPost = <T = any>(path: string, body?: unknown, query?: Query) =>
  apiRequest<T>(path, { method: 'POST', body, query });

export const apiPut = <T = any>(path: string, body?: unknown, query?: Query) =>
  apiRequest<T>(path, { method: 'PUT', body, query });

export const apiDelete = <T = any>(path: string, query?: Query) =>
  apiRequest<T>(path, { method: 'DELETE', query });

export const apiPublicPost = <T = any>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'POST', body, auth: false });

export const apiUpload = async <T = any>(path: string, formData: FormData): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: formData,
  });

  const text = await response.text();
  let payload: any = null;

  if (text) {
    try {
      payload = camelizeKeys(JSON.parse(text));
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      `Upload failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
};

export const apiDownload = async (
  path: string,
  query?: Query
): Promise<{ blob: Blob; fileName: string | null }> => {
  const response = await fetch(buildUrl(path, query), {
    headers: buildHeaders(true, false),
  });

  if (!response.ok) {
    const text = await response.text();
    let payload: any = null;
    try {
      payload = camelizeKeys(JSON.parse(text));
    } catch {
      payload = text;
    }
    const message =
      (payload && typeof payload === 'object' && payload.error) ||
      `Download failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  const contentDisposition = response.headers.get('Content-Disposition');
  const match = contentDisposition?.match(/filename="([^"]+)"|filename=([^\s;]+)/i);

  return {
    blob: await response.blob(),
    fileName: match ? match[1] || match[2] : null,
  };
};

export const saveBlob = (blob: Blob, fileName: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
