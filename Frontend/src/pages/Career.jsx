// @ts-nocheck
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { fetchCareerResources } from "@/api";
import { Briefcase, Search, ExternalLink, GraduationCap, Award, MapPin, Calendar } from "lucide-react";

const TYPES = ["All", "university_guide", "scholarship", "career_path", "bursary"];
const TYPE_LABELS = {
  university_guide: "University Guide",
  scholarship: "Scholarship",
  career_path: "Career Path",
  bursary: "Bursary",
};
const TYPE_COLORS = {
  university_guide: "bg-blue-100 text-blue-700",
  scholarship: "bg-amber-100 text-amber-700",
  career_path: "bg-emerald-100 text-emerald-700",
  bursary: "bg-purple-100 text-purple-700",
};
const TYPE_ICONS = {
  university_guide: GraduationCap,
  scholarship: Award,
  career_path: Briefcase,
  bursary: Award,
};


export default function Career() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  const { data: resources = [], isLoading: loading } = useQuery({
    queryKey: ['careerResources'],
    queryFn: fetchCareerResources,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const filtered = resources.filter((r) => {
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-poppins text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" /> Career Resources
        </h1>
        <p className="text-muted-foreground">University guides, scholarships, and career pathways for Malawian students</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search resources..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${type === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"}`}>
            {t === "All" ? "All" : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No career resources yet.</p>
          <p className="text-muted-foreground text-sm mt-1">Scholarship and university guides coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => {
            const TypeIcon = TYPE_ICONS[r.type] || Briefcase;
            return (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${TYPE_COLORS[r.type] || "bg-muted text-muted-foreground"}`}>
                    <TypeIcon className="h-3 w-3" /> {TYPE_LABELS[r.type] || r.type}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{r.title}</h3>
                {r.description && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{r.description}</p>}
                <div className="mt-auto pt-3">
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">
                      <ExternalLink className="h-3.5 w-3.5" /> Learn More
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}