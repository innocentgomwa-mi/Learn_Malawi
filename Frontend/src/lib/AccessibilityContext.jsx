import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAccessibilitySettings, saveAccessibilitySettings } from '@/api';

const AccessibilityContext = createContext(/** @type {any} */ (null));

const DEFAULT_ACCESSIBILITY_SETTINGS = {
  highContrast: false,
  largeText: false,
  dyslexiaFont: false,
  lineSpacing: false,
  reducedMotion: false,
  screenReader: false,
};

const ACCESSIBILITY_CLASSES = {
  highContrast: 'accessibility-high-contrast',
  largeText: 'accessibility-large-text',
  dyslexiaFont: 'accessibility-dyslexia-font',
  lineSpacing: 'accessibility-line-spacing',
  reducedMotion: 'accessibility-reduced-motion',
};

function applyAccessibilityClasses(settings) {
  if (typeof document === 'undefined') return;

  Object.entries(settings).forEach(([key, enabled]) => {
    const className = ACCESSIBILITY_CLASSES[key];
    if (!className) return;
    document.documentElement.classList.toggle(className, Boolean(enabled));
  });
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await fetchAccessibilitySettings();
        setSettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS, ...stored });
      } catch {
        setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    applyAccessibilityClasses(settings);
  }, [settings, isLoaded]);

  const saveSettings = async (nextSettings) => {
    setSettings(nextSettings);
    try {
      await saveAccessibilitySettings(nextSettings);
    } catch {
      // ignore save failures, keep local state
    }
  };

  const toggle = async (key) => {
    if (!(key in DEFAULT_ACCESSIBILITY_SETTINGS)) return;
    const nextSettings = { ...settings, [key]: !settings[key] };
    await saveSettings(nextSettings);
  };

  const reset = async () => {
    await saveSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, toggle, reset, isLoaded }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
