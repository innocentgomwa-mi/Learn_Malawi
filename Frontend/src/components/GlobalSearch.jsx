import { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen, FileText, Play, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  note: { icon: BookOpen, color: "text-emerald-600", label: "Study Note", path: "/study-notes" },
  paper: { icon: FileText, color: "text-blue-600", label: "Past Paper", path: "/past-papers" },
  tutorial: { icon: Play, color: "text-purple-600", label: "Tutorial", path: "/tutorials" },
};

const SAMPLE_NOTES = [
  { id: "note-1", title: "Malawi History Overview", subject: "History", level: "JCE", _type: "note", topic: "Independence" },
  { id: "note-2", title: "Essential Mathematics Formulas", subject: "Mathematics", level: "MSCE", _type: "note" },
  { id: "note-3", title: "Chichewa Grammar Guide", subject: "Chichewa", level: "PSLC", _type: "note" },
];

const SAMPLE_PAPERS = [
  { id: "paper-1", title: "PSLC Science Paper 2023", subject: "Science", level: "PSLC", _type: "paper" },
  { id: "paper-2", title: "JCE English Paper 2022", subject: "English", level: "JCE", _type: "paper" },
  { id: "paper-3", title: "MSCE Mathematics Paper 2024", subject: "Mathematics", level: "MSCE", _type: "paper" },
];

const SAMPLE_TUTORIALS = [
  { id: "tut-1", title: "Basic Algebra Review", subject: "Mathematics", level: "MSCE", type: "video", _type: "tutorial" },
  { id: "tut-2", title: "Biology: Plant Cells", subject: "Science", level: "JCE", type: "animation", _type: "tutorial" },
  { id: "tut-3", title: "English Composition Tips", subject: "English", level: "PSLC", type: "audio", _type: "tutorial" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const allData = useRef(null);

  const loadAll = async () => {
    if (allData.current) return;
    allData.current = [
      ...SAMPLE_NOTES,
      ...SAMPLE_PAPERS,
      ...SAMPLE_TUTORIALS,
    ];
  };

  useEffect(() => {
    setLoading(true);
    loadAll().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim() || !allData.current) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = allData.current.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.level?.toLowerCase().includes(q) ||
      item.topic?.toLowerCase().includes(q)
    ).slice(0, 10);
    setResults(filtered);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 max-w-xl z-50">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search all resources..."
          className="w-full rounded-full border border-border bg-card px-12 py-3 text-sm text-foreground outline-none shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={`absolute left-0 right-0 z-[60] mt-2 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all duration-200 ${open ? 'opacity-100 scale-100 max-h-80' : 'opacity-0 scale-95 max-h-0 pointer-events-none'}`}>
        <div className="max-h-80 overflow-y-auto">
          {query.trim() === "" ? (
            <p className="text-muted-foreground text-sm text-center py-8">Type to search all resources…</p>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No results found for "{query}"</p>
          ) : (
            <div className="py-2">
              {results.map(item => {
                const cfg = TYPE_CONFIG[item._type];
                const Icon = cfg.icon;
                return (
                  <Link
                    key={item.id}
                    to={cfg.path}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subject} · {item.level} {item.topic ? `· ${item.topic}` : ""}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-muted ${cfg.color}`}>{cfg.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
