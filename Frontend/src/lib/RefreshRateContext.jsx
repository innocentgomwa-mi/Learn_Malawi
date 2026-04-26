import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * @typedef {{ value: number; label: string }} RefreshOption
 * @typedef {{
 *   refreshSeconds: number;
 *   setRefreshSeconds: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   refreshOptions: RefreshOption[];
 * }} RefreshRateContextValue
 * @typedef {{ children: import('react').ReactNode }} RefreshRateProviderProps
 */

const STORAGE_KEY = 'learnmalawi_refresh_rate_seconds';
const DEFAULT_REFRESH_SECONDS = 0;
const REFRESH_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 15, label: 'Every 15 seconds' },
  { value: 30, label: 'Every 30 seconds' },
  { value: 60, label: 'Every minute' },
  { value: 120, label: 'Every 2 minutes' },
];

const RefreshRateContext = createContext(/** @type {RefreshRateContextValue | null} */ (null));

/** @param {RefreshRateProviderProps} props */
export function RefreshRateProvider({ children }) {
  const [refreshSeconds, setRefreshSeconds] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_REFRESH_SECONDS;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return DEFAULT_REFRESH_SECONDS;
    }

    const parsed = Number(storedValue);
    return Number.isNaN(parsed) || parsed < 0 ? DEFAULT_REFRESH_SECONDS : parsed;
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(refreshSeconds));
  }, [refreshSeconds]);

  const value = useMemo(
    () => ({ refreshSeconds, setRefreshSeconds, refreshOptions: REFRESH_OPTIONS }),
    [refreshSeconds]
  );

  return <RefreshRateContext.Provider value={value}>{children}</RefreshRateContext.Provider>;
}

export function useRefreshRate() {
  const context = useContext(RefreshRateContext);
  if (!context) {
    throw new Error('useRefreshRate must be used within a RefreshRateProvider');
  }
  return context;
}
