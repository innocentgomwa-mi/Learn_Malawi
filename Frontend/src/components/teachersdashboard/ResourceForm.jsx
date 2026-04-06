import { useState } from "react";
import { X } from "lucide-react";

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
                <input
                  type={type}
                  value={data[key] || ""}
                  onChange={(e) => handle(key, type === "number" ? Number(e.target.value) : e.target.value)}
                  required={required}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
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