import { useEffect, useState } from "react";

/**
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch {
      // ignore invalid JSON
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }, [key, state]);

  return [state, setState];
}
