import React from "react";

/**
 * @param {{ title: string; description?: string; children: React.ReactNode }} props
 */
export function SettingsSection({ title, description, children }) {
  return (
    <div className="bg-card rounded-xl border p-5 mb-4">
      <div className="mb-4">
        <h3 className="font-heading font-semibold text-base">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
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
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}