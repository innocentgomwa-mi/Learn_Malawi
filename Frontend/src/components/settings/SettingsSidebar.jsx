import React from "react";
import { User, Shield, BookOpen, Accessibility, Bell, BarChart2, Lock, Wifi, Gamepad2, Sparkles } from "lucide-react";

/**
 * @typedef {'account' | 'security' | 'learning' | 'accessibility' | 'notifications' | 'progress' | 'privacy' | 'data' | 'gamification' | 'smart'} SettingsSectionId
 */

/**
 * @typedef {{ id: SettingsSectionId; label: string; icon: import('lucide-react').LucideIcon }} SettingsNavItem
 */

/** @type {SettingsNavItem[]} */
const NAV = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "learning", label: "Learning Preferences", icon: BookOpen },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "progress", label: "Progress & Data", icon: BarChart2 },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "data", label: "Data Usage", icon: Wifi },
  { id: "gamification", label: "Gamification", icon: Gamepad2 },
  { id: "smart", label: "Smart Features", icon: Sparkles },
];

/**
 * @param {{ active: SettingsSectionId; onChange: (id: SettingsSectionId) => void }} props
 */
export default function SettingsSidebar({ active, onChange }) {
  return (
    <aside className="md:w-56 shrink-0">
      <nav className="bg-card rounded-xl border overflow-hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b last:border-0 ${
              active === id
                ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}