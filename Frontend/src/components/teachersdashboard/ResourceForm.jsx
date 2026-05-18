import { useState } from "react";
import { X, CalendarDays } from "lucide-react";

export default function ResourceForm({ fields, initial = {}, onSave, onCancel, title }) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handle = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-poppins font-bold text-foreground">{title}</h3>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {fields.map(({ key, label, type = "text", options, required }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-foreground mb-1">{label}{required && " *"}</label>
              {type === "textarea" ? (
                <textarea
                  value={data[key] || ""}
                  onChange={(e) => handle(key, e.target.value)}
                  rows={4}
                  required={required}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              ) : type === "select" ? (
                <select
                  value={data[key] || ""}
                  onChange={(e) => handle(key, e.target.value)}
                  required={required}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select…</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                (() => {
                  const commonProps = {
                    value: data[key] || "",
                    required,
                    className: "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary",
                  };

                  // For datetime/date inputs: prevent manual typing and open native picker on focus/click
                  if (type === "date" || type === "datetime-local" || type === "time") {
                    commonProps.id = `input-${key}`;
                    // For the scheduled_date field show a calendar button next to the input
                    if (key === 'scheduled_date') {
                      return (
                        <div className="flex items-center gap-2">
                          <input
                            {...commonProps}
                            type={type}
                            onChange={(e) => handle(key, e.target.value)}
                            onKeyDown={(e) => e.preventDefault()}
                            inputMode="none"
                            readOnly
                            onFocus={(e) => e.target.showPicker?.()}
                            onClick={(e) => e.target.showPicker?.()}
                            className={commonProps.className + " flex-1"}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById('input-scheduled_date');
                              if (!el) return;
                              // Prefer showPicker when available
                              if (el.showPicker) {
                                try { el.showPicker(); el.focus(); } catch (e) { el.focus(); }
                                return;
                              }
                              // Fallback: temporarily make editable and click/focus
                              const prevReadOnly = el.readOnly;
                              try {
                                el.readOnly = false;
                                el.click?.();
                                el.focus();
                              } finally {
                                el.readOnly = prevReadOnly;
                              }
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted"
                            title="Open calendar"
                          >
                            <CalendarDays className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    }

                    // For other date/time fields (e.g., scheduled_time) keep read-only picker behavior
                    return (
                      <input
                        {...commonProps}
                        type={type}
                        onChange={(e) => handle(key, e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        inputMode="none"
                        readOnly
                        onFocus={(e) => e.target.showPicker?.()}
                        onClick={(e) => e.target.showPicker?.()}
                      />
                    );
                  }

                  return (
                    <input
                      {...commonProps}
                      type={type}
                      onChange={(e) => handle(key, type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  );
                })()
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onCancel}
              className="flex-1 border border-border text-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2 rounded-xl hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}