import { useState } from "react";
import { Download, Trash2, CheckCircle } from "lucide-react";

/**
 * @typedef {{
 *   isSaved: boolean,
 *   onSave: () => void,
 *   onRemove: () => void,
 * }} SaveOfflineButtonProps
 */

/**
 * Reusable save-for-offline toggle button.
 * @param {SaveOfflineButtonProps} props
 */
export default function SaveOfflineButton({ isSaved, onSave, onRemove }) {
  const [flash, setFlash] = useState(false);

  const handleSave = () => {
    onSave();
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  };

  if (isSaved) {
    return (
      <button
        onClick={onRemove}
        title="Remove from offline saves"
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Saved Offline
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      title="Save for offline reading"
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
        flash
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {flash ? <CheckCircle className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
      {flash ? "Saved!" : "Save Offline"}
    </button>
  );
}