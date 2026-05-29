// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { fetchPastPapers, logActivity } from "@/api";
import { getSavedPapers, savePaperOffline, removePaperOffline } from "@/lib/offlineCache";
import RequireAccount from "@/components/RequireAccount";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import ResourcePageHero from "@/components/ResourcePageHero";
import ResourceSearchInput from "@/components/ResourceSearchInput";
import {
  PAGE_WRAP,
  LEVEL_INFO,
  filterButtonClass,
  YELLOW_BUTTON_SM,
  CARD_CLASS,
  SPINNER_CLASS,
} from "@/lib/resourcePageStyles";
import { FileText, Download, BookOpen } from "lucide-react";

const LEVELS = ["All", "PSLC", "JCE", "MSCE"];

const matchesOfflineSearch = (paper, term) => {
  if (!term.trim()) return true;
  const q = term.trim().toLowerCase();
  return (
    paper.title?.toLowerCase().includes(q) ||
    paper.subject?.toLowerCase().includes(q) ||
    String(paper.year ?? "").includes(q) ||
    paper.description?.toLowerCase().includes(q)
  );
};

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${url}`;
};

export default function PastPapers() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [lastSearchSignature, setLastSearchSignature] = useState("");
  const [savedPapers, setSavedPapers] = useState([]);
  const [isDeviceOnline, setIsDeviceOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [searchParams] = useSearchParams();
  const selectedPaperId = searchParams.get('selected_id') || '';

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

  const { data: papers = [], isLoading: loading, isFetching } = useQuery({
    queryKey: ['pastPapers', level, search],
    queryFn: () => fetchPastPapers({
      level: level === 'All' ? undefined : level,
      search: search.trim() || undefined,
      limit: 500,
    }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated && isDeviceOnline,
  });

  useEffect(() => {
    const signature = `${search.trim()}|${level}`;
    if (signature === lastSearchSignature) return;
    if (!search.trim() && level === 'All') return;

    const timer = setTimeout(() => {
      logActivity({
        action: 'resource_searched',
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || '',
        user_role: user?.role || 'student',
        resource_title: 'Past Papers',
        subject: search.trim() || 'all',
        metadata: JSON.stringify({ query: search.trim(), level }),
      }).catch(() => {});
      setLastSearchSignature(signature);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, level, user?.email, user?.full_name, user?.role, lastSearchSignature]);

  const papersToDisplay = isDeviceOnline
    ? papers
    : savedPapers.filter((p) => {
        const matchLevel = level === "All" || p.level === level;
        return matchLevel && matchesOfflineSearch(p, search);
      });

  const hasActiveFilters = Boolean(search.trim()) || level !== "All";

  const saveOfflinePaper = (paper) => {
    savePaperOffline(paper);
    setSavedPapers(getSavedPapers());
  };

  const removeOfflinePaper = (paperId) => {
    removePaperOffline(paperId);
    setSavedPapers(getSavedPapers());
  };

  const isSavedPaper = (paperId) => savedPapers.some((p) => p.id === paperId);

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Past Papers" />;
  }

  const grouped = papersToDisplay.reduce((acc, paper) => {
    const key = paper.year || "Unknown Year";
    if (!acc[key]) acc[key] = [];
    acc[key].push(paper);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  useEffect(() => {
    if (!selectedPaperId) return;
    const element = document.querySelector(`[data-paper-id="${CSS.escape(String(selectedPaperId))}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPaperId, papersToDisplay.length]);

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={FileText}
        title="Past Papers"
        subtitle="PSLC, JCE & MSCE past examination papers with marking schemes"
      />

      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <ResourceSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, subject, year, or description..."
          ariaLabel="Search past papers"
          isFetching={isFetching}
          isLoading={loading}
          className="relative min-w-0 flex-1"
        />
        <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
          {LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => setLevel(l)} className={filterButtonClass(level === l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className={SPINNER_CLASS} />
        </div>
      ) : papersToDisplay.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <p className="font-medium text-blue-950">
            {hasActiveFilters ? "No past papers match your search." : "No past papers found yet."}
          </p>
          <p className="mt-1 text-sm text-blue-900/70">
            {hasActiveFilters
              ? "Try a different keyword or clear your filters."
              : "Papers will be uploaded soon!"}
          </p>
        </div>
      ) : (
        <div className="mb-8 space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="mb-4 flex items-center gap-2 font-poppins text-lg font-bold text-blue-950">
                <span className="h-5 w-1.5 rounded-full bg-yellow-400" />
                {year} Papers
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[year].map((paper) => (
                  <div
                    key={paper.id}
                    data-paper-id={String(paper.id)}
                    className={`${CARD_CLASS} p-5 ${
                      selectedPaperId && String(paper.id) === String(selectedPaperId)
                        ? "border-yellow-400 ring-2 ring-yellow-300/50"
                        : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${LEVEL_INFO[paper.level]?.color || "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                        {paper.level}
                      </span>
                      <span className="text-xs font-medium text-blue-900/70">{paper.year}</span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-blue-950">{paper.title}</h3>
                    <p className="mb-4 text-xs text-blue-900/70">{paper.subject}</p>
                    {paper.description && <p className="mb-3 line-clamp-2 text-xs text-blue-900/60">{paper.description}</p>}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {paper.paperUrl && (
                          <a
                            href={getFileUrl(paper.paperUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => logActivity({
                              action: 'resource_viewed',
                              user_email: user?.email || 'anonymous',
                              user_name: user?.full_name || '',
                              user_role: user?.role || 'student',
                              resource_title: paper.title,
                              subject: paper.subject,
                              level: paper.level,
                              metadata: JSON.stringify({ resource_id: paper.id, resource_type: 'past_paper', target: 'paperUrl' }),
                            }).catch(() => {})}
                            className={`${YELLOW_BUTTON_SM} min-w-[120px] flex-1`}
                          >
                            <Download className="h-3.5 w-3.5" /> Paper
                          </a>
                        )}
                        {paper.markingSchemeUrl && (
                          <a
                            href={getFileUrl(paper.markingSchemeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => logActivity({
                              action: 'resource_viewed',
                              user_email: user?.email || 'anonymous',
                              user_name: user?.full_name || '',
                              user_role: user?.role || 'student',
                              resource_title: paper.title,
                              subject: paper.subject,
                              level: paper.level,
                              metadata: JSON.stringify({ resource_id: paper.id, resource_type: 'past_paper', target: 'markingSchemeUrl' }),
                            }).catch(() => {})}
                            className={`${YELLOW_BUTTON_SM} min-w-[120px] flex-1`}
                          >
                            <BookOpen className="h-3.5 w-3.5" /> Scheme
                          </a>
                        )}
                        {!paper.paper_url && !paper.marking_scheme_url && (
                          <span className="text-xs italic text-blue-900/60">Coming soon</span>
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
