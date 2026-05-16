import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes } from "@/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** @param {string} value */
const getRemoteUrl = (value) => {
  if (!value) return value;
  return value.startsWith('/') ? `${API_BASE_URL}${value}` : value;
};

const TABS = ["All", "Notes", "Past Papers", "Quizzes", "Tutorials"];

const FALLBACK_ITEMS = [
  {
    id: "fallback-notes-1",
    category: "Notes",
    title: "MSCE Mathematics Notes",
    subject: "Mathematics",
    level: "Form 3",
    description: "Covers key MSCE topics with worked examples, practice problems, and exam-style summaries.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=260&fit=crop",
    tag: "Popular",
    tagColor: "bg-blue-500/15 text-blue-700",
  },
  {
    id: "fallback-papers-1",
    category: "Past Papers",
    title: "MSCE Physics 2023",
    subject: "Physics",
    level: "Form 4",
    description: "Complete past paper with model answers and marking guidance for MSCE physics revision.",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=260&fit=crop",
    tag: "2023",
    tagColor: "bg-purple-500/15 text-purple-700",
  },
  {
    id: "fallback-quizzes-1",
    category: "Quizzes",
    title: "Chemistry Bonding Quiz",
    subject: "Chemistry",
    level: "Form 2",
    description: "Short quiz covering ionic, covalent and metallic bonding concepts with instant feedback.",
    image: "https://images.unsplash.com/photo-1532094349884-543559059826?w=400&h=260&fit=crop",
    tag: "15 Questions",
    tagColor: "bg-orange-500/15 text-orange-700",
  },
  {
    id: "fallback-tutorials-1",
    category: "Tutorials",
    title: "Solving Quadratic Equations",
    subject: "Mathematics",
    level: "Form 3",
    description: "Step-by-step tutorial with examples to help students master quadratic equation techniques.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=260&fit=crop",
    tag: "Video",
    tagColor: "bg-rose-500/15 text-rose-700",
  },
];

export default function ResourceShowcase() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);

  /** @param {string} category */
  const getCategoryPath = (category) => {
    switch (category) {
      case "Notes":
        return "/study-notes";
      case "Past Papers":
        return "/past-papers";
      case "Tutorials":
        return "/tutorials";
      case "Quizzes":
        return "/quizzes";
      default:
        return "/study-notes";
    }
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchStudyNotes(),
      fetchPastPapers(),
      fetchQuizzes(),
      fetchTutorials(),
    ])
      .then(([notes, papers, quizzes, tutorials]) => {
        if (!mounted) return;
        const mappedItems = [
          ...(Array.isArray(notes) ? notes : []).map((note) => {
            const noteImage = note.imageUrl || note.image_url || note.thumbnailUrl || note.thumbnail_url || note.thumbnail || note.image;
            return {
              id: note.id || note._id || note.noteId || `${note.title}-${note.subject}`,
              category: "Notes",
              title: note.title || note.name || "Study Note",
              subject: note.subject || note.topic || "General",
              level: note.grade || note.level || note.class || "Notes",
              description: note.description || note.summary || note.excerpt || `Curriculum-aligned notes for ${note.subject || 'general learning'}`,
              image: getRemoteUrl(noteImage) || "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400&h=260&fit=crop",
              tag: note.level || note.grade || "Notes",
              tagColor: "bg-blue-500/15 text-blue-700",
            };
          }),
          ...(Array.isArray(papers) ? papers : []).map((paper) => {
            const paperImage = paper.imageUrl || paper.image_url || paper.thumbnailUrl || paper.thumbnail_url || paper.thumbnail || paper.image;
            return {
              id: paper.id || paper._id || paper.paperId || `${paper.title}-${paper.year}`,
              category: "Past Papers",
              title: paper.title || paper.name || "Past Paper",
              subject: paper.subject || paper.course || "General",
              level: paper.grade || paper.level || paper.form || "Paper",
              description: paper.description || paper.summary || `Past paper for ${paper.subject || 'general revision'}`,
              image: getRemoteUrl(paperImage) || "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=260&fit=crop",
              tag: paper.year || "Paper",
              tagColor: "bg-purple-500/15 text-purple-700",
            };
          }),
          ...(Array.isArray(quizzes) ? quizzes : []).map((quiz) => {
            const quizImage = quiz.imageUrl || quiz.image_url || quiz.thumbnailUrl || quiz.thumbnail_url || quiz.thumbnail || quiz.image;
            return {
              id: quiz.id || quiz._id || quiz.quizId || `${quiz.title}-${quiz.subject}`,
              category: "Quizzes",
              title: quiz.title || quiz.name || "Quiz",
              subject: quiz.subject || quiz.topic || "General",
              level: quiz.grade || quiz.level || quiz.form || "Quiz",
              description: quiz.description || quiz.summary || `Practice quiz for ${quiz.subject || 'general study'}`,
              image: getRemoteUrl(quizImage) || "https://images.unsplash.com/photo-1532094349884-543559059826?w=400&h=260&fit=crop",
              tag: quiz.questions ? `${quiz.questions} qns` : quiz.level || "Quiz",
              tagColor: "bg-orange-500/15 text-orange-700",
            };
          }),
          ...(Array.isArray(tutorials) ? tutorials : []).map((tutorial) => {
            const tutorialImage = tutorial.imageUrl || tutorial.image_url || tutorial.thumbnailUrl || tutorial.thumbnail_url || tutorial.thumbnail || tutorial.image;
            return {
              id: tutorial.id || tutorial._id || tutorial.tutorialId || `${tutorial.title}-${tutorial.subject}`,
              category: "Tutorials",
              title: tutorial.title || tutorial.name || "Tutorial",
              subject: tutorial.subject || tutorial.topic || "General",
              level: tutorial.grade || tutorial.level || tutorial.form || "Tutorial",
              description: tutorial.description || tutorial.summary || `Tutorial covering ${tutorial.subject || 'core concepts'}`,
              image: getRemoteUrl(tutorialImage) || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=260&fit=crop",
              tag: tutorial.format || "Video",
              tagColor: "bg-rose-500/15 text-rose-700",
            };
          }),
        ];

        setItems(mappedItems.length > 0 ? mappedItems : FALLBACK_ITEMS);
      })
      .catch(() => {
        if (!mounted) return;
        setItems(FALLBACK_ITEMS);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = activeTab === "All" ? items : items.filter((i) => i.category === activeTab);

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Explore Resources</h2>
          <p className="text-sm text-muted-foreground">Handpicked for Malawian students</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(getCategoryPath(activeTab))}
          className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          View more <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <button
            key={`${item.category}-${item.id || item.title}`}
            type="button"
            onClick={() => navigate(getCategoryPath(item.category))}
            className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden text-left cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.tagColor}`}>
                {item.tag}
              </span>
              <span className="absolute top-4 right-4 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                {item.category}
              </span>
            </div>
            <div className="flex h-full flex-col p-5 gap-4">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900 leading-tight">{item.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.subject}</span>
                  {item.level && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.level}</span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
                  Read Online
                </span>
                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700 shadow-sm">
                  Save Offline
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}