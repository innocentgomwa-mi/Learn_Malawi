import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  ArrowRight,
  Calculator,
  Microscope,
  FlaskConical,
  Atom,
  BookText,
} from "lucide-react";
import { fetchStudyNotes, fetchPastPapers, fetchTutorials, fetchQuizzes } from "@/api";

/** @typedef {{ name: string, icon: import('lucide-react').LucideIcon, keys: string[], resources: number | null }} SpotlightSubject */

/** @type {Omit<SpotlightSubject, 'resources'>[]} */
const SPOTLIGHT_SUBJECTS = [
  { name: "Mathematics", icon: Calculator, keys: ["mathematics", "math", "maths"] },
  { name: "Biology", icon: Microscope, keys: ["biology", "bio"] },
  { name: "Chemistry", icon: FlaskConical, keys: ["chemistry", "chem"] },
  { name: "Physics", icon: Atom, keys: ["physics"] },
  { name: "English", icon: BookText, keys: ["english", "eng"] },
];

/** @param {unknown} value */
const normalizeSubject = (value) => (value || "").toString().trim().toLowerCase();

/**
 * @param {string | undefined} itemSubject
 * @param {{ keys: string[] }} config
 */
const matchesSubject = (itemSubject, config) => {
  const normalized = normalizeSubject(itemSubject);
  if (!normalized) return false;

  return config.keys.some((key) => {
    if (normalized === key) return true;
    if (normalized.startsWith(`${key} `) || normalized.startsWith(key)) return true;
    if (key.length >= 4 && normalized.includes(key)) return true;
    return false;
  });
};

/**
 * @param {unknown[]} items
 * @param {{ keys: string[] }} config
 */
const countForSubject = (items, config) => {
  if (!Array.isArray(items)) return 0;
  return items.filter((item) => matchesSubject(item?.subject, config)).length;
};

/** @returns {SpotlightSubject[]} */
const buildInitialSubjects = () =>
  SPOTLIGHT_SUBJECTS.map((subject) => ({ ...subject, resources: null }));

export default function SubjectSpotlight() {
  const [subjects, setSubjects] = useState(buildInitialSubjects);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadSubjectCounts = async () => {
      setLoading(true);
      try {
        const [notes, papers, tutorials, quizzes] = await Promise.all([
          fetchStudyNotes().catch(() => []),
          fetchPastPapers({ limit: 1000 }).catch(() => []),
          fetchTutorials().catch(() => []),
          fetchQuizzes().catch(() => []),
        ]);

        if (!mounted) return;

        const allItems = [
          ...(Array.isArray(notes) ? notes : []),
          ...(Array.isArray(papers) ? papers : []),
          ...(Array.isArray(tutorials) ? tutorials : []),
          ...(Array.isArray(quizzes) ? quizzes : []),
        ];

        setSubjects(
          SPOTLIGHT_SUBJECTS.map((config) => ({
            ...config,
            resources: countForSubject(allItems, config),
          })),
        );
      } catch {
        if (!mounted) return;
        setSubjects(
          SPOTLIGHT_SUBJECTS.map((config) => ({
            ...config,
            resources: 0,
          })),
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSubjectCounts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-[28px] border border-blue-800/50 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-base flex items-center gap-2 text-white">
          <Flame className="h-4 w-4 text-yellow-400" /> Subjects
        </h2>
        <button
          type="button"
          onClick={() => navigate("/study-notes")}
          className="text-xs text-yellow-400 font-semibold flex items-center gap-1 hover:text-yellow-300 transition-colors"
        >
          All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {subjects.map((s) => {
          const Icon = s.icon;
          const count = s.resources;
          const countLabel =
            loading || count === null
              ? "Loading…"
              : `${count} resource${count === 1 ? "" : "s"}`;

          return (
            <button
              key={s.name}
              type="button"
              onClick={() => navigate(`/study-notes?subject=${encodeURIComponent(s.name)}`)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-yellow-400" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-yellow-400 group-hover:text-yellow-300">{s.name}</p>
                <p className="text-xs text-blue-100/80">{countLabel}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
