import { useState, useEffect, useRef } from 'react';
import { speak, stopSpeaking } from '@/hooks/useScreenReader';

export default function AccessibilityButton() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('screenReaderEnabled') === 'true';
  });
  const lastSpoken = useRef('');

  useEffect(() => {
    localStorage.setItem('screenReaderEnabled', enabled);
    if (!enabled) { stopSpeaking(); return; }

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
      if (!next) { stopSpeaking(); speak('Screen reader disabled.'); }
      return next;
    });
  }

  return (
    <div
      style={{ position: 'fixed', bottom: '90px', right: '24px', zIndex: 50 }}
      title={enabled ? 'Screen reader ON — click to turn off' : 'Screen reader OFF — click to turn on'}
    >
      <button
        onClick={toggle}
        aria-label={enabled ? 'Disable screen reader' : 'Enable screen reader'}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          transition: 'all 0.3s ease',
          background: enabled ? '#16a34a' : '#374151',
          color: 'white',
          animation: enabled ? 'a11y-pulse 2s infinite' : 'none',
        }}
      >
        {enabled ? '🔊' : '🔇'}
      </button>
      <style>{`
        @keyframes a11y-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(22,163,74,0); }
        }
      `}</style>
    </div>
  );
}
