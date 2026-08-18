import { SWRConfiguration } from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('API request failed');
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
  focusThrottleInterval: 5000,
};

// Custom hooks for common data
export const swrKeys = {
  screens: '/api/screens',
  media: '/api/media',
  playlists: '/api/playlists',
  templates: '/api/templates',
  queue: '/api/queue',
  schedules: '/api/schedules',
  settings: '/api/settings',
  authMe: '/api/auth/me',
  branches: '/api/branches',
} as const;
