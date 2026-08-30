import { api } from './api';

// SWR fetcher — uses the existing api wrapper (credentials + auth header).
export const fetcher = (url) => api.get(url);
