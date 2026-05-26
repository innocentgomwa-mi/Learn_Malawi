import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudyNotes } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudyNotes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["study-notes"],
    queryFn: fetchStudyNotes,
  });
  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Study Notes</h1>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No study notes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(note => (
            <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
              <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{note.subject} {note.level && `· ${note.level}`}</p>
              {note.description && <p className="text-sm line-clamp-2">{note.description}</p>}
              {note.fileUrl && (
                <a href={note.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-2 inline-block">
                  View PDF →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
