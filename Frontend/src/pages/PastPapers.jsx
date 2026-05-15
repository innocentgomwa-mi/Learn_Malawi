// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/lib/AuthContext";
import { fetchPastPapers } from "@/api";
import { getSavedPapers, savePaperOffline, removePaperOffline } from "@/lib/offlineCache";
import RequireAccount from "@/components/RequireAccount";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import { FileText, Search, Download, BookOpen } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];
const LEVEL_COLORS = {
  PSLC: "bg-emerald-100 text-emerald-700",
  JCE: "bg-blue-100 text-blue-700",
  MSCE: "bg-purple-100 text-purple-700",
};


const getFileUrl = (url) => {
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${url}`;
};

export default function PastPapers() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [savedPapers, setSavedPapers] = useState([]);
  const [isDeviceOnline, setIsDeviceOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsDeviceOnline(online);
      if (!online) {
        setSavedPapers(getSavedPapers());
      }
    };

    setSavedPapers(getSavedPapers());
    updateStatus();

    window.addEventListener('offline', updateStatus);
    window.addEventListener('online', updateStatus);
    return () => {
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('online', updateStatus);
    };
  }, []);

  const { data: papers = [], isLoading: loading } = useQuery({
    queryKey: ['pastPapers'],
    queryFn: fetchPastPapers,
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated && isDeviceOnline,
  });

  const papersToDisplay = isDeviceOnline ? papers : savedPapers;

  const saveOfflinePaper = (paper) => {
    savePaperOffline(paper);
    setSavedPapers(getSavedPapers());
  };

  const removeOfflinePaper = (paperId) => {
    removePaperOffline(paperId);
    setSavedPapers(getSavedPapers());
  };

  const isSavedPaper = (paperId) => {
    return savedPapers.some((p) => p.id === paperId);
  };

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Past Papers" />;
  }

  const filtered = papersToDisplay.filter((p) => {
    const matchLevel = level === "All" || p.level === level;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subject?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.year).includes(search);
    return matchLevel && matchSearch;
  });

  // Group by year
  const grouped = filtered.reduce((acc, paper) => {
    const key = paper.year || "Unknown Year";
    if (!acc[key]) acc[key] = [];
    acc[key].push(paper);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" /> Past Papers
        </h1>
        <p className="text-muted-foreground">PSLC, JCE & MSCE past examination papers with marking schemes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by subject, year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                level === l ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No past papers found yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Papers will be uploaded soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="font-poppins font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-primary rounded-full" />
                {year} Papers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[year].map((paper) => (
                  <div key={paper.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${LEVEL_COLORS[paper.level] || "bg-muted text-muted-foreground"}`}>
                        {paper.level}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{paper.year}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{paper.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{paper.subject}</p>
                    {paper.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{paper.description}</p>}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {paper.paperUrl && (
                          <a href={getFileUrl(paper.paperUrl)} target="_blank" rel="noopener noreferrer"
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-lg hover:opacity-90">
                            <Download className="h-3.5 w-3.5" /> Paper
                          </a>
                        )}
                        {paper.markingSchemeUrl && (
                          <a href={getFileUrl(paper.markingSchemeUrl)} target="_blank" rel="noopener noreferrer"
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold py-2 rounded-lg hover:opacity-90">
                            <BookOpen className="h-3.5 w-3.5" /> Scheme
                          </a>
                        )}
                        {!paper.paper_url && !paper.marking_scheme_url && (
                          <span className="text-xs text-muted-foreground italic">Coming soon</span>
                        )}
                      </div>
                      <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                        <SaveOfflineButton
                          isSaved={isSavedPaper(paper.id)}
                          onSave={() => saveOfflinePaper(paper)}
                          onRemove={() => removeOfflinePaper(paper.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}