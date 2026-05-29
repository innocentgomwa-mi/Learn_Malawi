/**
 * @typedef {'PSLC' | 'JCE' | 'MSCE'} TutorialLevel
 * @typedef {'video' | 'animation' | 'audio'} TutorialType
 */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTutorials, logActivity } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RequireAccount from "@/components/RequireAccount";
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
import { Play, Clock, Film, Volume2, Zap, SkipBack, SkipForward, Maximize, Pause } from "lucide-react";

const LEVELS = ["All", "primary", "secondary"];
const TYPES = ["All", "video", "animation", "audio"];
const TYPE_ICONS = { video: Film, animation: Zap, audio: Volume2 };
const TYPE_COLORS = {
  video: "bg-blue-100 text-blue-800 border border-blue-200",
  animation: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  audio: "bg-blue-900/10 text-blue-900 border border-blue-300",
};

export default function Tutorials() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [type, setType] = useState("All");
  const [lastSearchSignature, setLastSearchSignature] = useState("");
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const playerWrapRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchParams] = useSearchParams();
  const selectedTutorialId = searchParams.get('selected_id') || '';

  const { data: tutorials = [], isLoading: loading, isFetching } = useQuery({
    queryKey: ['tutorials', level, search],
    queryFn: () => fetchTutorials({
      level: level === 'All' ? undefined : level,
      search: search.trim() || undefined,
    }),
    staleTime: 1000 * 60,
    retry: 1,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const signature = `${search.trim()}|${level}|${type}`;
    if (signature === lastSearchSignature) return;
    if (!search.trim() && level === 'All' && type === 'All') return;

    const timer = setTimeout(() => {
      logActivity({
        action: 'resource_searched',
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || '',
        user_role: user?.role || 'student',
        resource_title: 'Tutorials',
        subject: search.trim() || 'all',
        metadata: JSON.stringify({ query: search.trim(), level, type }),
      }).catch(() => {});
      setLastSearchSignature(signature);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, level, type, user?.email, user?.full_name, user?.role, lastSearchSignature]);

  const getVideoUrl = (tutorial) => tutorial?.videoUrl || tutorial?.url || '';
  const getThumbnailUrl = (tutorial) => tutorial?.thumbnailUrl || tutorial?.thumbnail_url || '';
  const getDurationMinutes = (tutorial) => tutorial?.durationMinutes || tutorial?.duration_minutes;
  const isYouTubeUrl = (url) => /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/.test(url);
  const buildEmbedUrl = (url) => {
    if (!url) return '';
    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0&modestbranding=1&controls=1`;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1&controls=1`;
    return url;
  };

  const formatDuration = (secondsValue) => {
    const seconds = Number(secondsValue || 0);
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const seekVideo = (deltaSeconds) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(Math.max(video.currentTime + deltaSeconds, 0), video.duration || video.currentTime + deltaSeconds);
    video.currentTime = target;
    setCurrentTime(target);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const openFullscreen = async () => {
    const playerWrap = playerWrapRef.current;
    if (!playerWrap) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    if (playerWrap.requestFullscreen) {
      await playerWrap.requestFullscreen();
    }
  };

  useEffect(() => {
    if (!selectedTutorialId || tutorials.length === 0) return;
    const match = tutorials.find((t) => String(t.id) === String(selectedTutorialId));
    if (match) {
      setSelectedTutorial(match);
    }
  }, [selectedTutorialId, tutorials]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onLoaded = () => setVideoDuration(video.duration || 0);
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [selectedTutorial]);

  if (!isAuthenticated) {
    return <RequireAccount resourceName="Tutorials" />;
  }

  const filtered = tutorials.filter((t) => {
    if (type === "All") return true;
    return (t.type || "video") === type;
  });

  const hasActiveFilters = Boolean(search.trim()) || level !== "All" || type !== "All";

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={Play}
        title="Tutorials"
        subtitle="Animated lessons, videos & audio summaries for every topic"
      />

      <ResourceSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by title, subject, class, or description..."
        ariaLabel="Search tutorials"
        isFetching={isFetching}
        isLoading={loading}
      />

      <div className="mb-3 grid w-full grid-cols-3 gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={filterButtonClass(level === l, { fullWidth: true })}
          >
            {l === "All" ? "All" : l.charAt(0).toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-8 grid w-full grid-cols-4 gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`${filterButtonClass(type === t, { fullWidth: true })} capitalize`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className={SPINNER_CLASS} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <Play className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <p className="font-medium text-blue-950">
            {hasActiveFilters ? "No tutorials match your search." : "No tutorials available yet."}
          </p>
          <p className="mt-1 text-sm text-blue-900/70">
            {hasActiveFilters
              ? "Try a different keyword or clear your filters."
              : "Video and animated lessons coming soon!"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tut) => {
              const typeValue = tut.type || 'video';
              const TypeIcon = TYPE_ICONS[typeValue] || Play;
              const videoUrl = getVideoUrl(tut);
              const thumbnailUrl = getThumbnailUrl(tut);
              const cardPreviewUrl = thumbnailUrl || videoUrl;
              return (
                <div key={tut.id} className={`${CARD_CLASS} flex flex-col`}>
                  {cardPreviewUrl ? (
                    thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={tut.title} className="h-40 w-full object-cover" />
                    ) : (
                      <video
                        src={cardPreviewUrl}
                        className="h-40 w-full object-cover bg-black"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-blue-50">
                      <Play className="h-12 w-12 text-blue-300" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[typeValue] || "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                        <TypeIcon className="h-3 w-3" /> {typeValue}
                      </span>
                      <span className="text-xs capitalize text-blue-900/70">{tut.level}</span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-blue-950">{tut.title}</h3>
                    <p className="mb-3 text-xs text-blue-900/70">{tut.subject}</p>
                    {tut.description && <p className="mb-3 line-clamp-2 text-xs text-blue-900/60">{tut.description}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      {getDurationMinutes(tut) && (
                        <span className="flex items-center gap-1 text-xs text-blue-900/70">
                          <Clock className="h-3 w-3" /> {getDurationMinutes(tut)} min
                        </span>
                      )}
                      {videoUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTutorial(tut);
                            logActivity({
                              action: 'resource_viewed',
                              user_email: user?.email || 'anonymous',
                              user_name: user?.full_name || '',
                              user_role: user?.role || 'student',
                              resource_title: tut.title,
                              subject: tut.subject,
                              level: tut.level,
                              metadata: JSON.stringify({ resource_id: tut.id, resource_type: 'tutorial' }),
                            }).catch(() => {});
                          }}
                          className={YELLOW_BUTTON_SM}
                        >
                          <Play className="h-3 w-3" /> Watch
                        </button>
                      ) : (
                        <span className="text-xs italic text-blue-900/60">Coming soon</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Dialog open={Boolean(selectedTutorial)} onOpenChange={(open) => { if (!open) setSelectedTutorial(null); }}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden border-blue-200 p-0">
              {selectedTutorial && (
                <div className="flex h-full flex-col bg-white">
                  <div className="flex items-start justify-between gap-4 border-b border-blue-200 p-4">
                    <div>
                      <DialogTitle className="text-lg font-semibold text-blue-950">{selectedTutorial.title}</DialogTitle>
                      <DialogDescription className="text-sm text-blue-900/70">{selectedTutorial.subject}</DialogDescription>
                    </div>
                    <DialogClose className={`${YELLOW_BUTTON_SM}`}>Close</DialogClose>
                  </div>
                  <div ref={playerWrapRef} className="flex-1 bg-black">
                    {isYouTubeUrl(getVideoUrl(selectedTutorial)) ? (
                      <iframe
                        title={selectedTutorial.title}
                        src={buildEmbedUrl(getVideoUrl(selectedTutorial))}
                        className="h-full w-full min-h-[320px]"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full min-h-[320px] flex-col">
                        <video
                          ref={videoRef}
                          src={getVideoUrl(selectedTutorial)}
                          controls
                          className="h-full w-full min-h-[280px] object-contain"
                          playsInline
                        />
                        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100">
                          <div className="font-medium">
                            {formatDuration(currentTime)} / {formatDuration(videoDuration)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => seekVideo(-10)} className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">
                              <span className="inline-flex items-center gap-1"><SkipBack className="h-3.5 w-3.5" />10s</span>
                            </button>
                            <button type="button" onClick={togglePlayPause} className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">
                              <span className="inline-flex items-center gap-1">{isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{isPlaying ? "Pause" : "Play"}</span>
                            </button>
                            <button type="button" onClick={() => seekVideo(10)} className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">
                              <span className="inline-flex items-center gap-1"><SkipForward className="h-3.5 w-3.5" />10s</span>
                            </button>
                            <button type="button" onClick={() => void openFullscreen()} className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800">
                              <span className="inline-flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />Fullscreen</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
