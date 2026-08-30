'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

// Global SWR defaults: cache-first, background revalidation, deduped requests.
// This makes every dashboard/view reflect real-time DB state without a full
// reload while keeping payloads instant from the cache.
export default function Providers({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 4000,
        focusThrottleInterval: 10000,
        errorRetryCount: 3,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
