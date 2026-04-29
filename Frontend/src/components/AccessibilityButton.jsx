import { useState, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from '@/hooks/useScreenReader';

export default function AccessibilityButton() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('screenReaderEnabled') === 'true';
  });
  const lastSpoken = useRef('');

  useEffect(() => {
    localStorage.setItem('screenReaderEnabled', enabled);
    if (!enabled) {
      stopSpeaking();
      return;
    }

    speak('Screen reader enabled. Hover over any text to hear it read aloud.');

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
    };
  }, [enabled]);

  function toggle() {
    setEnabled(prev => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
        speak('Screen reader disabled.');
      }
      return next;
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? 'Disable screen reader' : 'Enable screen reader'}
      title={enabled ? 'Screen reader ON — click to turn off' : 'Screen reader OFF — click to turn on'}
      className={`
        fixed bottom-24 right-5 z-50
        w-13 h-13 rounded-full shadow-lg
        flex items-center justify-center
        text-xl transition-all duration-300
        border-2 focus:outline-none focus:ring-4 focus:ring-offset-2
        ${enabled
          ? 'bg-green-600 border-green-400 text-white focus:ring-green-400 animate-pulse'
          : 'bg-gray-700 border-gray-500 text-gray-200 hover:bg-gray-600 focus:ring-gray-400'
        }
      `}
    >
      {enabled ? '🔊' : '🔇'}
      <span className="sr-only">{enabled ? 'Screen reader on' : 'Screen reader off'}</span>
    </button>
  );
}
