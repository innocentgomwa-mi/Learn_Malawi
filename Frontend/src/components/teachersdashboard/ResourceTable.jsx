import { Pencil, Trash2, Plus, Loader2, Users } from "lucide-react";

export default function ResourceTable({ title, items, columns, loading, onAdd, onEdit, onDelete, onJoin }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-poppins font-bold text-foreground">{title}</h2>
            {onAdd && (
              <button onClick={onAdd}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-3 py-2 rounded-xl hover:opacity-90">
                <Plus className="h-4 w-4" /> Add New
              </button>
            )}
          </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No records yet. Add one!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((c) => (
                  <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-foreground">
                      {c.render ? c.render(item[c.key], item) : (item[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {onJoin && (
                          <button onClick={() => onJoin(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary">
                            <Users className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}