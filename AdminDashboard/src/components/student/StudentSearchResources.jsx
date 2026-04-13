import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logActivity } from "@/lib/activityLogger";
import { Search, Filter, Star, Download, FileText, BookOpen, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const SUBJECTS = ["Mathematics", "English", "Science", "Social Studies", "Chichewa", "Biology", "Chemistry", "Physics", "History", "Geography", "Agriculture", "Computer Studies", "Religious Education"];
const TYPE_LABELS = { study_notes: "Study Notes", past_paper: "Past Paper", tutorial: "Tutorial", quiz: "Quiz", career_resource: "Career Resource" };
const TYPE_ICONS = { study_notes: "📝", past_paper: "📄", tutorial: "🎬", quiz: "✅", career_resource: "🎓" };

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange && onChange(n)}>
          <Star className={`w-4 h-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function StudentSearchResources({ currentUser }) {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [userRatings, setUserRatings] = useState({});
  const qc = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["approved-posts"],
    queryFn: () => apiClient.entities.TeacherPost.filter({ status: "approved" }, "-created_date", 100),
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings"],
    queryFn: () => apiClient.entities.ResourceRating.list(),
  });

  const rateMutation = useMutation({
    mutationFn: (data) => apiClient.entities.ResourceRating.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ratings"] }),
  });

  // Aggregate ratings per resource
  const ratingMap = useMemo(() => {
    const map = {};
    ratings.forEach(r => {
      if (!map[r.resource_id]) map[r.resource_id] = { total: 0, count: 0, downloads: r.download_count || 0 };
      map[r.resource_id].total += r.rating;
      map[r.resource_id].count += 1;
    });
    return map;
  }, [ratings]);

  const getAvgRating = (id) => {
    const r = ratingMap[id];
    return r ? Math.round((r.total / r.count) * 10) / 10 : 0;
  };
  const getDownloads = (id) => ratingMap[id]?.downloads || 0;

  const handleView = (resource) => {
    logActivity({
      action: "resource_viewed",
      user_email: currentUser?.email || "anonymous",
      user_name: currentUser?.full_name || "",
      resource_id: resource.id,
      resource_title: resource.title,
      subject: resource.subject,
      level: resource.level,
    });
  };

  const handleRate = (resource, rating) => {
    setUserRatings(prev => ({ ...prev, [resource.id]: rating }));
    rateMutation.mutate({
      resource_id: resource.id,
      resource_title: resource.title,
      student_email: currentUser?.email || "anonymous",
      rating,
    });
    logActivity({
      action: "resource_rated",
      user_email: currentUser?.email || "anonymous",
      user_name: currentUser?.full_name || "",
      resource_id: resource.id,
      resource_title: resource.title,
      subject: resource.subject,
      level: resource.level,
      metadata: { rating },
    });
  };

  const activeFilters = [
    filterSubject !== "all" && filterSubject,
    filterType !== "all" && TYPE_LABELS[filterType],
    filterLevel !== "all" && filterLevel,
  ].filter(Boolean);

  const filtered = useMemo(() => {
    let list = resources.filter(r => {
      const matchSearch = !search ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.subject?.toLowerCase().includes(search.toLowerCase()) ||
        r.teacher_name?.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === "all" || r.subject === filterSubject;
      const matchType = filterType === "all" || r.content_type === filterType;
      const matchLevel = filterLevel === "all" || r.level === filterLevel;
      return matchSearch && matchSubject && matchType && matchLevel;
    });

    if (sortBy === "rating") list = [...list].sort((a, b) => getAvgRating(b.id) - getAvgRating(a.id));
    else if (sortBy === "downloads") list = [...list].sort((a, b) => getDownloads(b.id) - getDownloads(a.id));
    // default: newest (already sorted by API)
    return list;
  }, [resources, search, filterSubject, filterType, filterLevel, sortBy, ratingMap]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search resources, subjects, teachers..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(f => !f)}
          className={showFilters ? "border-slate-300 text-slate-700 bg-slate-50" : ""}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
          {activeFilters.length > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Content Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Level</label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="PSLC">PSLC</SelectItem>
                  <SelectItem value="JCE">JCE</SelectItem>
                  <SelectItem value="MSCE">MSCE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-gray-500">Active:</span>
              {activeFilters.map(f => (
                <span key={f} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {f}
                  <button onClick={() => {
                    if (f === filterSubject) setFilterSubject("all");
                    else if (f === TYPE_LABELS[filterType]) setFilterType("all");
                    else if (f === filterLevel) setFilterLevel("all");
                  }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button className="text-xs text-red-500 hover:underline ml-1" onClick={() => { setFilterSubject("all"); setFilterType("all"); setFilterLevel("all"); setSortBy("newest"); }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</span>
      </div>

      {/* Resource cards */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No resources match your filters</p>
          <button className="text-blue-600 text-sm mt-2 hover:underline" onClick={() => { setSearch(""); setFilterSubject("all"); setFilterType("all"); setFilterLevel("all"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(resource => {
            const avgRating = getAvgRating(resource.id);
            const downloads = getDownloads(resource.id);
            const myRating = userRatings[resource.id] || 0;
            return (
              <Card key={resource.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow" onClick={() => handleView(resource)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{TYPE_ICONS[resource.content_type] || "📚"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">{resource.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs">{resource.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{resource.level}</Badge>
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[resource.content_type]}</Badge>
                        {resource.form_standard && <Badge variant="outline" className="text-xs">{resource.form_standard}</Badge>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <StarRating value={myRating || Math.round(avgRating)} onChange={r => handleRate(resource, r)} />
                            {avgRating > 0 && <span className="text-xs text-gray-500 ml-1">{avgRating}</span>}
                          </div>
                          {downloads > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Download className="w-3 h-3" /> {downloads}
                            </span>
                          )}
                        </div>
                        {resource.teacher_name && (
                          <span className="text-xs text-gray-400 truncate max-w-28">{resource.teacher_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
