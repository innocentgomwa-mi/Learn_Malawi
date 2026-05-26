import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';

const GLOBAL_THEME_KEY = 'theme';

function getThemeStorageKey(user) {
  if (!user) return GLOBAL_THEME_KEY;
  return `theme_${user.id ?? user.email}`;
}

function getSavedTheme(key) {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value === 'dark' || value === 'light' ? value : null;
}

function getDefaultTheme() {
  if (typeof window === 'undefined') return 'light';
  const value = window.localStorage.getItem(GLOBAL_THEME_KEY);
  if (value === 'dark' || value === 'light') {
    return value;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const { user } = useAuth();
  const storageKey = getThemeStorageKey(user);

  const [dark, setDark] = useState(() => {
    const saved = getSavedTheme(storageKey);
    return (saved ?? getDefaultTheme()) === 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = getSavedTheme(storageKey);
    setDark((saved ?? getDefaultTheme()) === 'dark');
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (dark) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem(storageKey, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem(storageKey, 'light');
    }
  }, [dark, storageKey]);

  return (
    <button
      onClick={() => setDark((current) => !current)}
      className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors text-primary-foreground"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}