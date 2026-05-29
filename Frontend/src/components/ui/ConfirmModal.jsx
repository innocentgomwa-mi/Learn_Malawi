/**
 * ConfirmModal — replaces browser confirm() everywhere in the app.
 *
 * Usage:
 *   const [dialog, setDialog] = useState(null);
 *
 *   // trigger:
 *   setDialog({
 *     title: "Delete quiz",
 *     message: "Are you sure you want to delete this quiz? This cannot be undone.",
 *     confirmLabel: "Delete",       // optional, default "Confirm"
 *     danger: true,                 // optional — makes confirm button red
 *     onConfirm: () => doDelete(),
 *   });
 *
 *   // render (anywhere in return):
 *   <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />
 */
import { useEffect, useRef } from "react";
import { AlertTriangle, Info } from "lucide-react";

export default function ConfirmModal({ dialog, onClose }) {
  const cancelRef = useRef(null);

  /* auto-focus cancel on open so pressing Enter doesn't accidentally confirm */
  useEffect(() => {
    if (dialog) cancelRef.current?.focus();
  }, [dialog]);

  /* close on Escape */
  useEffect(() => {
    if (!dialog) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dialog, onClose]);

  if (!dialog) return null;

  const { title, message, confirmLabel = "Confirm", danger = false, onConfirm } = dialog;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* icon + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`shrink-0 flex items-center justify-center rounded-full w-9 h-9 ${danger ? "bg-red-100" : "bg-amber-100"}`}>
            {danger
              ? <AlertTriangle className="h-4 w-4 text-red-600" />
              : <Info className="h-4 w-4 text-amber-600" />
            }
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{title}</p>
            {message && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>}
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-2 justify-end mt-5">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
