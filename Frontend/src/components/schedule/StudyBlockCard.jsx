import React from "react";
import { Clock, BookOpen, MoreVertical, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const BLOCK_COLORS = {
  indigo: "bg-[hsl(245,58%,51%)]/10 border-[hsl(245,58%,51%)]/30 text-[hsl(245,58%,51%)]",
  teal: "bg-[hsl(172,50%,45%)]/10 border-[hsl(172,50%,45%)]/30 text-[hsl(172,50%,45%)]",
  amber: "bg-[hsl(34,80%,55%)]/10 border-[hsl(34,80%,55%)]/30 text-[hsl(34,80%,55%)]",
  rose: "bg-[hsl(330,65%,55%)]/10 border-[hsl(330,65%,55%)]/30 text-[hsl(330,65%,55%)]",
  sky: "bg-[hsl(200,70%,50%)]/10 border-[hsl(200,70%,50%)]/30 text-[hsl(200,70%,50%)]",
};

export default function StudyBlockCard({ block, resources, onEdit, onDelete }) {
  const colorClass = BLOCK_COLORS[block.color] || BLOCK_COLORS.indigo;
  const assignedResources = resources?.filter(r => block.resource_ids?.includes(r.id)) || [];

  return (
    <div className={`rounded-lg border p-3 ${colorClass} group relative transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm font-heading truncate">{block.title}</p>
          {block.subject && (
            <p className="text-xs opacity-70 mt-0.5">{block.subject}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(block)}>
              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(block.id)} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-xs opacity-60">
        <Clock className="h-3 w-3" />
        <span>{block.start_time} – {block.end_time}</span>
      </div>
      {assignedResources.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {assignedResources.slice(0, 2).map(r => (
            <Badge key={r.id} variant="secondary" className="text-[10px] px-1.5 py-0">
              <BookOpen className="h-2.5 w-2.5 mr-1" />
              {r.name}
            </Badge>
          ))}
          {assignedResources.length > 2 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{assignedResources.length - 2}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}