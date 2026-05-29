import React from "react";

export const SETTINGS_SAVE_BTN =
  "inline-flex items-center justify-center rounded-xl border border-yellow-300 bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-950 shadow-sm hover:bg-yellow-300";

export const SETTINGS_OUTLINE_BTN =
  "inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:border-yellow-300 hover:bg-yellow-50";

/**
 * @param {{ title: string; description?: string; children: React.ReactNode }} props
 */
export function SettingsSection({ title, description, children }) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-blue-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-blue-100 pb-3">
        <h3 className="font-poppins text-base font-bold text-blue-950">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-blue-900/60">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * @param {{ label: string; description?: string; children: React.ReactNode }} props
 */
export function SettingsRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-50 bg-blue-50/30 px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-blue-950">{label}</p>
        {description && <p className="mt-0.5 text-xs text-blue-900/60">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
