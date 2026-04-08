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
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    setLoading(true);
    loadAll().then(() => setLoading(false));
  }, [open]);

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

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close search with Escape
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
        aria-label="Toggle search"
        aria-expanded={open}
      >
        <Search className="h-4 w-4" />
      </button>

      <div
        className={`absolute top-full mt-2 left-1/2 z-50 w-[min(100vw-1rem,28rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ease-out md:left-auto md:right-0 md:translate-x-0 ${open ? 'opacity-100 scale-100 max-h-[32rem] pointer-events-auto' : 'opacity-0 scale-95 max-h-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, subject, level or topic…"
            className="flex-1 bg-transparent text-foreground outline-none text-sm placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() === "" ? (
            <p className="text-muted-foreground text-sm text-center py-8">Type to search all resources…</p>
          ) : results.length === 0 && !loading ? (
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