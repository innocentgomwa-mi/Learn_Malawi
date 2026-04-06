/**
 * @typedef {'PSLC' | 'JCE' | 'MSCE'} TutorialLevel
 * @typedef {'video' | 'animation' | 'audio'} TutorialType
 * @typedef {{
 *   id: string,
 *   title: string,
 *   subject: string,
 *   level: TutorialLevel,
 *   type: TutorialType,
 *   duration_minutes: number,
 *   description: string,
 *   url: string,
 *   thumbnail_url?: string,
 *   topic?: string
 * }} Tutorial
 */

import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { fetchTutorials } from "@/api";
import { Play, Search, Clock, Film, Volume2, Zap } from "lucide-react";

/** @type {Array<'All' | TutorialLevel>} */
const LEVELS = ["All", "primary", "secondary"];
/** @type {Array<'All' | TutorialType>} */
const TYPES = ["All", "video", "animation", "audio"];
/** @type {Record<TutorialType, typeof Film | typeof Zap | typeof Volume2>} */
const TYPE_ICONS = { video: Film, animation: Zap, audio: Volume2 };
/** @type {Record<TutorialType, string>} */
const TYPE_COLORS = {
  video: "bg-red-100 text-red-700",
  animation: "bg-purple-100 text-purple-700",
  audio: "bg-green-100 text-green-700",
};

/** @type {Tutorial[]} */

export default function Tutorials() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(/** @type { 'All' | TutorialLevel } */ ("All"));
  const [type, setType] = useState(/** @type { 'All' | TutorialType } */ ("All"));

  const { data: tutorials = [], isLoading: loading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: fetchTutorials,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const filtered = tutorials.filter((t) => {
    const matchLevel = level === "All" || t.level === level;
    const matchType = type === "All" || t.type === type;
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchType && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Play className="h-8 w-8 text-primary" /> Tutorials
        </h1>
        <p className="text-muted-foreground">Animated lessons, videos & audio summaries for every topic</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tutorials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${level === l ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"}`}>
            {l}
          </button>
        ))}
        <div className="w-px bg-border mx-1" />
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${type === t ? "bg-secondary text-secondary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No tutorials available yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Video and animated lessons coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tut) => {
            const typeValue = tut.type || 'video';
            const TypeIcon = TYPE_ICONS[typeValue] || Play;
            return (
              <div key={tut.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                {tut.thumbnailUrl ? (
                  <img src={tut.thumbnailUrl} alt={tut.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${TYPE_COLORS[typeValue] || "bg-muted text-muted-foreground"}`}>
                      <TypeIcon className="h-3 w-3" /> {typeValue}
                    </span>
                    <span className="text-xs text-muted-foreground">{tut.level}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{tut.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{tut.subject}</p>
                  {tut.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tut.description}</p>}
                  <div className="flex items-center justify-between">
                    {tut.durationMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {tut.durationMinutes} min
                      </span>
                    )}
                    {tut.videoUrl ? (
                      <a href={tut.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 flex items-center gap-1">
                        <Play className="h-3 w-3" /> Watch
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Coming soon</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}