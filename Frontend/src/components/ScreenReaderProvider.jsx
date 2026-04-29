import { useEffect, useRef } from 'react';
import { speak, stopSpeaking } from '@/hooks/useScreenReader';

export default function ScreenReaderProvider({ children }) {
  const lastSpoken = useRef('');
  useEffect(() => {
    function getLabel(el) {
      return (
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.getAttribute('placeholder') ||
        el.getAttribute('alt') ||
        el.textContent?.trim()
      );
    }
    function handleMouseEnter(e) {
      const el = e.target;
      const tag = el.tagName.toLowerCase();
      const interactive = ['button', 'a', 'input', 'select', 'textarea', 'label'];
      const isText = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'li', 'td', 'th'];
      if (!interactive.includes(tag) && !isText.includes(tag)) return;
      const label = getLabel(el);
      if (!label || label === lastSpoken.current) return;
      let announcement = label;
      if (tag === 'button') announcement = `Button: ${label}`;
      if (tag === 'a') announcement = `Link: ${label}`;
      if (tag === 'input') announcement = `Input field: ${el.getAttribute('placeholder') || label}`;
      lastSpoken.current = label;
      speak(announcement);
    }
    function handleFocus(e) {
      const el = e.target;
      const label = getLabel(el);
      if (!label) return;
      const tag = el.tagName.toLowerCase();
      let announcement = label;
      if (tag === 'button') announcement = `Button: ${label}`;
      if (tag === 'a') announcement = `Link: ${label}`;
      if (tag === 'input') announcement = `Input: ${el.getAttribute('placeholder') || label}`;
      speak(announcement);
    }
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('focus', handleFocus, true);
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('focus', handleFocus, true);
      stopSpeaking();
    };
  }, []);
  return children;
}
