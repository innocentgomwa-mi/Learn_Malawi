import React from "react";
import { BookOpen, ExternalLink, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeIcons = {
  textbook: "📖",
  video: "🎬",
  article: "📄",
  notes: "📝",
  practice_exam: "📋",
  other: "📎",
};

export default function ResourceList({ resources, onAdd, onEdit, onDelete }) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Resources
        </h3>
        <Button size="sm" variant="outline" onClick={onAdd} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      <ScrollArea className="max-h-[300px]">
        {resources.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No resources yet. Add your study materials!</p>
        ) : (
          <div className="space-y-2">
            {resources.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <span className="text-base">{typeIcons[r.type] || "📎"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {r.subject && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{r.subject}</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">{r.type?.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(r)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(r.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}