import { useAccessibility } from '@/lib/AccessibilityContext';
import { Eye, Type, Zap, BookOpen, AlignLeft, RotateCcw, CheckCircle, Info } from 'lucide-react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const SETTINGS = [
  {
    key: 'highContrast',
    icon: Eye,
    label: 'High Contrast Mode',
    description:
      'Increases colour contrast between text and backgrounds to improve readability for users with low vision or colour blindness.',
    preview: 'AAA',
    previewClass: 'bg-black text-yellow-300 font-bold text-lg px-3 py-1 rounded',
  },
  {
    key: 'largeText',
    icon: Type,
    label: 'Large Text',
    description:
      'Increases the base font size across the entire site, making all text easier to read without needing browser zoom.',
    preview: 'Aa',
    previewClass: 'text-2xl font-bold text-foreground',
  },
  {
    key: 'dyslexiaFont',
    icon: BookOpen,
    label: 'Dyslexia-Friendly Font',
    description:
      'Switches to a more readable font designed to reduce letter-confusion for users with dyslexia.',
    preview: 'Abc',
    previewClass: 'font-mono text-lg text-foreground tracking-wider',
  },
  {
    key: 'lineSpacing',
    icon: AlignLeft,
    label: 'Increased Line Spacing',
    description:
      'Adds extra space between lines of text, which helps users with visual processing difficulties read more comfortably.',
    preview: '≡',
    previewClass: 'text-2xl text-primary font-bold tracking-widest',
  },
  {
    key: 'reducedMotion',
    icon: Zap,
    label: 'Reduce Animations',
    description:
      'Disables or minimises animations and transitions for users sensitive to motion, including those with vestibular disorders.',
    preview: '✦',
    previewClass: 'text-2xl text-muted-foreground',
  },
];

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Accessibility() {
  const { isAuthenticated } = useAuth();
  const { settings, toggle, reset } = useAccessibility();
  const location = useLocation();
  const activeCount = Object.values(settings).filter(Boolean).length;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10" aria-label="Accessibility settings">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-foreground mb-2">Accessibility Settings</h1>
          <p className="text-muted-foreground">
            Customise Learn Malawi to work best for you. All changes are saved locally and apply immediately across the whole site.
          </p>
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            aria-label="Reset all accessibility settings to default"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl px-3 py-2 flex-shrink-0 transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset all
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div
          className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {activeCount} accessibility feature{activeCount > 1 ? 's' : ''} currently active
        </div>
      )}

      <div className="space-y-4" role="list">
        {SETTINGS.map(({ key, icon: Icon, label, description, preview, previewClass }) => (
          <div
            key={key}
            role="listitem"
            className={`bg-card border rounded-2xl p-5 transition-all ${
              settings[key] ? 'border-primary/40 shadow-sm' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`rounded-xl p-2.5 flex-shrink-0 ${
                  settings[key] ? 'bg-primary/10' : 'bg-muted'
                }`}
                aria-hidden="true"
              >
                <Icon className={`h-5 w-5 ${settings[key] ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-semibold text-foreground text-sm">{label}</h2>
                  {settings[key] && (
                    <span
                      className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium"
                      aria-label="enabled"
                    >
                      ON
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={previewClass} aria-hidden="true">
                  {preview}
                </span>
                <ToggleSwitch checked={settings[key]} onChange={() => toggle(key)} label={`Toggle ${label}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-muted border border-border rounded-2xl p-5" role="note">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-foreground text-sm mb-1">Screen Reader Compatibility</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Learn Malawi is built with semantic HTML, ARIA labels, and keyboard-navigable controls throughout. It is compatible with screen readers such as <strong>NVDA</strong>, <strong>JAWS</strong>, and <strong>VoiceOver</strong>. All interactive elements have descriptive labels, and page headings are structured for easy navigation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-muted border border-border rounded-2xl p-5" role="note">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-foreground text-sm mb-1">Keyboard Navigation</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can navigate the entire site using only a keyboard. Use <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs font-mono">Tab</kbd> to move between elements, <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd> or <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs font-mono">Space</kbd> to activate controls, and <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs font-mono">Shift+Tab</kbd> to go back.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
