import React from "react";
import { User, Shield, BookOpen, Accessibility, Bell, BarChart2, Lock, Wifi, Gamepad2, Sparkles } from "lucide-react";
import { SETTINGS_NAV_ACTIVE, SETTINGS_NAV_INACTIVE } from "@/lib/resourcePageStyles";

/** @type {const} */
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
 * @param {{ active: string; onChange: (id: string) => void }} props
 */
export default function SettingsSidebar({ active, onChange }) {
  return (
    <aside className="shrink-0 md:w-56">
      <nav className="overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-sm">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex w-full items-center gap-3 border-b border-blue-100 px-4 py-3 text-left text-sm font-medium transition-colors last:border-0 ${
              active === id ? SETTINGS_NAV_ACTIVE : SETTINGS_NAV_INACTIVE
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active === id ? "text-yellow-600" : "text-blue-500"}`} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
