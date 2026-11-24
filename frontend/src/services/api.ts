export const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  bodyData?: any;
}

export const apiClient = async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const token = localStorage.getItem('clearair_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (options.bodyData) {
    fetchOptions.body = JSON.stringify(options.bodyData);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      // Token might be expired, clear it
      localStorage.removeItem('clearair_token');
    }
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};
