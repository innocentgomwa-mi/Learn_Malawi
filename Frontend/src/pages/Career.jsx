// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCareerResources, logActivity } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import ResourcePageHero from "@/components/ResourcePageHero";
import ResourceSearchInput from "@/components/ResourceSearchInput";
import {
  PAGE_WRAP,
  filterButtonClass,
  CARD_CLASS,
  SPINNER_CLASS,
  YELLOW_BUTTON_CLASS,
} from "@/lib/resourcePageStyles";
import {
  Briefcase,
  ExternalLink,
  GraduationCap,
  Award,
  Compass,
  Clock,
  Users,
  Rocket,
  FileText,
  Sparkles,
} from "lucide-react";

const ICON_MAP = {
  Briefcase,
  GraduationCap,
  Award,
  Compass,
  Clock,
  Users,
  Rocket,
  FileText,
};

/** @type {Record<string, { label: string; badge: string; header: string; iconBg: string }>} */
const CATEGORY_STYLES = {
  Briefcase: {
    label: "Career",
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    header: "from-blue-900 via-blue-800 to-blue-700",
    iconBg: "bg-yellow-400 text-blue-950",
  },
  GraduationCap: {
    label: "University guide",
    badge: "bg-yellow-100 text-yellow-900 border border-yellow-200",
    header: "from-blue-950 via-blue-900 to-blue-800",
    iconBg: "bg-yellow-400 text-blue-950",
  },
  Award: {
    label: "Scholarship",
    badge: "bg-yellow-100 text-yellow-900 border border-yellow-300",
    header: "from-yellow-500 via-yellow-400 to-amber-400",
    iconBg: "bg-blue-950 text-yellow-300",
  },
  Compass: {
    label: "Career path",
    badge: "bg-blue-900/10 text-blue-900 border border-blue-300",
    header: "from-blue-800 via-blue-700 to-blue-600",
    iconBg: "bg-yellow-300 text-blue-950",
  },
  Clock: {
    label: "Skills",
    badge: "bg-blue-50 text-blue-800 border border-blue-200",
    header: "from-blue-700 via-blue-600 to-blue-500",
    iconBg: "bg-yellow-400 text-blue-950",
  },
  Users: {
    label: "Networking",
    badge: "bg-yellow-50 text-yellow-900 border border-yellow-200",
    header: "from-blue-900 to-blue-700",
    iconBg: "bg-yellow-400 text-blue-950",
  },
  Rocket: {
    label: "Motivation",
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    header: "from-yellow-400 via-yellow-300 to-amber-300",
    iconBg: "bg-blue-950 text-yellow-300",
  },
  FileText: {
    label: "Guides & documents",
    badge: "bg-blue-50 text-blue-900 border border-blue-200",
    header: "from-blue-950 via-blue-900 to-blue-800",
    iconBg: "bg-yellow-400 text-blue-950",
  },
};

const DEFAULT_STYLE = CATEGORY_STYLES.Briefcase;

const FILTER_OPTIONS = [
  { id: "All", label: "All" },
  { id: "GraduationCap", label: "University" },
  { id: "Award", label: "Scholarships" },
  { id: "Compass", label: "Career paths" },
  { id: "Briefcase", label: "Career" },
  { id: "FileText", label: "Guides" },
];

const LEGACY_TYPE_TO_ICON = {
  university_guide: "GraduationCap",
  scholarship: "Award",
  career_path: "Compass",
  bursary: "Award",
};

function getResourceIconKey(resource) {
  if (resource?.icon && CATEGORY_STYLES[resource.icon]) return resource.icon;
  if (resource?.type && LEGACY_TYPE_TO_ICON[resource.type]) {
    return LEGACY_TYPE_TO_ICON[resource.type];
  }
  if (resource?.type && CATEGORY_STYLES[resource.type]) return resource.type;
  return "Briefcase";
}

function getResourceIcon(resource) {
  const key = getResourceIconKey(resource);
  return ICON_MAP[key] || Briefcase;
}

function getResourceStyle(resource) {
  return CATEGORY_STYLES[getResourceIconKey(resource)] || DEFAULT_STYLE;
}

export default function Career() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lastSearchSignature, setLastSearchSignature] = useState("");
  const { user } = useAuth();

  const { data: resources = [], isLoading: loading, isFetching } = useQuery({
    queryKey: ["careerResources"],
    queryFn: fetchCareerResources,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const normalizedResources = useMemo(
    () =>
      (Array.isArray(resources) ? resources : []).map((r) => ({
        ...r,
        _iconKey: getResourceIconKey(r),
      })),
    [resources],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedResources.filter((r) => {
      const matchCategory = category === "All" || r._iconKey === category;
      const matchSearch =
        !q ||
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        getResourceStyle(r).label.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [normalizedResources, search, category]);

  const categoryCounts = useMemo(() => {
    const counts = { All: normalizedResources.length };
    normalizedResources.forEach((r) => {
      counts[r._iconKey] = (counts[r._iconKey] || 0) + 1;
    });
    return counts;
  }, [normalizedResources]);

  useEffect(() => {
    const signature = `${search.trim()}|${category}`;
    if (signature === lastSearchSignature) return;
    if (!search.trim() && category === "All") return;

    const timer = setTimeout(() => {
      logActivity({
        action: "resource_searched",
        user_email: user?.email || "anonymous",
        user_name: user?.full_name || "",
        user_role: user?.role || "student",
        resource_title: "Career Resources",
        subject: search.trim(),
        metadata: JSON.stringify({ query: search.trim(), category }),
      }).catch(() => {});
      setLastSearchSignature(signature);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, user?.email, user?.full_name, user?.role, lastSearchSignature]);

  const hasActiveFilters = Boolean(search.trim()) || category !== "All";

  const handleResourceClick = (resource) => {
    logActivity({
      action: "resource_viewed",
      user_email: user?.email || "anonymous",
      user_name: user?.full_name || "",
      user_role: user?.role || "student",
      resource_title: resource.title,
      subject: getResourceStyle(resource).label,
      metadata: JSON.stringify({
        resource_type: "career_resource",
        external_link: resource.link,
        icon: resource._iconKey,
      }),
    }).catch(() => {});
  };

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={Briefcase}
        title="Career Resources"
        subtitle="University guides, scholarships, bursaries, and career pathways to help Malawian students plan their next step."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-blue-200 bg-white px-3 py-1 font-medium text-blue-950">
          {normalizedResources.length}{" "}
          {normalizedResources.length === 1 ? "resource" : "resources"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 font-medium text-yellow-900">
          <Sparkles className="h-3.5 w-3.5" />
          Curated for MSCE & beyond
        </span>
      </div>

      <ResourceSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by title, description, or category…"
        ariaLabel="Search career resources"
        isFetching={isFetching}
        isLoading={loading}
      />

      <div className="mb-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {FILTER_OPTIONS.map((opt) => {
          const count = categoryCounts[opt.id] ?? 0;
          const isActive = category === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCategory(opt.id)}
              className={`${filterButtonClass(isActive, { fullWidth: true })} flex flex-col gap-0.5 py-2.5`}
            >
              <span>{opt.label}</span>
              {opt.id !== "All" && count > 0 && (
                <span className={`text-[10px] font-normal ${isActive ? "text-blue-900/70" : "text-blue-700/60"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className={SPINNER_CLASS} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-blue-200/80 bg-white py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <p className="font-medium text-blue-950">
            {hasActiveFilters ? "No resources match your filters." : "No career resources yet."}
          </p>
          <p className="mt-1 text-sm text-blue-900/70">
            {hasActiveFilters
              ? "Try another keyword or choose a different category."
              : "Scholarship and university guides will appear here soon."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-4 text-sm font-semibold text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const style = getResourceStyle(r);
            const TypeIcon = getResourceIcon(r);
            return (
              <article key={r.id} className={`${CARD_CLASS} flex flex-col overflow-hidden p-0`}>
                <div
                  className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${style.header} px-4`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${style.iconBg}`}
                  >
                    <TypeIcon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span
                    className={`mb-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                  >
                    <TypeIcon className="h-3 w-3" />
                    {style.label}
                  </span>

                  <h3 className="mb-2 font-poppins text-base font-bold leading-snug text-blue-950">{r.title}</h3>

                  {r.description ? (
                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-blue-900/70">
                      {r.description}
                    </p>
                  ) : (
                    <p className="mb-4 flex-1 text-sm italic text-blue-900/50">No description provided.</p>
                  )}

                  {r.link ? (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleResourceClick(r)}
                      className={`${YELLOW_BUTTON_CLASS} mt-auto w-full py-2.5 text-sm`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open resource
                    </a>
                  ) : (
                    <span className="mt-auto text-xs text-blue-800/50">Link coming soon</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
