import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPastPapers } from "@/api";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PastPapers() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["past-papers"],
    queryFn: fetchPastPapers,
  });
  const filtered = papers.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.subject?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "all" || p.level === level;
    return matchSearch && matchLevel;
  });
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Past Papers</h1>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search past papers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="PSLC">PSLC</SelectItem>
            <SelectItem value="JCE">JCE</SelectItem>
            <SelectItem value="MSCE">MSCE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No past papers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(paper => (
            <div key={paper.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
              <h3 className="font-semibold text-lg mb-1">{paper.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{paper.subject} {paper.level && `· ${paper.level}`} {paper.year && `· ${paper.year}`}</p>
              {paper.fileUrl && (
                <a href={paper.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  Download PDF →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
