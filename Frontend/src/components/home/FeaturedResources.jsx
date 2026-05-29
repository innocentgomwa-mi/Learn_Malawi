import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import CourseCard from "./CourseCard.jsx";

/**
 * @typedef {{
 *   title: string;
 *   subject: string;
 *   level: string;
 *   rating: number;
 *   students: string;
 *   tag?: string | null;
 *   tagColor?: string;
 *   img: string;
 *   path?: string;
 * }} Course
 */

const CATEGORIES = [
  "All",
  "PSLC",
  "JCE",
  "MSCE",
  "Science",
  "Maths",
  "English",
  "Social Studies",
];

/**
 * @param {{ courses: Course[] }} props
 */
export default function FeaturedResources({ courses }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = courses.filter(
    (c) =>
      activeCategory === "All" ||
      c.level === activeCategory ||
      c.subject === activeCategory
  );

  return (
    <section className="mx-4 md:mx-8 my-14 md:my-20 rounded-3xl border border-yellow-400/60 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.75)]">
      <div className="w-full px-5 md:px-8 py-10 md:py-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <span className="inline-flex items-center rounded-full border border-yellow-400/50 bg-yellow-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200 mb-4">
              Featured for learners
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
              Discover resources that match your goals
            </h2>
            <p className="text-blue-100/90">
              Filter by level or subject to find the most relevant materials for your current exam preparation.
            </p>
          </div>
          <Link
            to="/study-notes"
            className="hidden md:inline-flex rounded-xl border border-yellow-400/60 bg-yellow-400 text-blue-950 text-sm font-semibold items-center gap-1.5 px-4 py-2.5 hover:bg-yellow-300 transition-all"
          >
            Browse all resources <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-5 text-sm text-blue-200">
          Showing <span className="font-semibold text-yellow-200">{filtered.length}</span> resource{filtered.length === 1 ? "" : "s"} for <span className="font-semibold text-yellow-200">{activeCategory}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-center text-sm px-4 py-2.5 rounded-full border font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-yellow-400 text-blue-950 border-yellow-300 shadow-[0_8px_24px_-12px_rgba(250,204,21,0.9)]"
                  : "bg-blue-900/70 text-blue-100 border-blue-700 hover:border-yellow-300/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <CourseCard key={i} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-yellow-400/50 bg-blue-900/50 px-6 py-10 text-center">
            <p className="text-white font-semibold mb-2">No resources found for this filter yet.</p>
            <p className="text-blue-100/80 text-sm mb-4">Try another category to discover more learning materials.</p>
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className="inline-flex rounded-lg border border-yellow-400/70 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15 transition-colors"
            >
              Reset to All
            </button>
          </div>
        )}

        <Link
          to="/study-notes"
          className="md:hidden mt-8 inline-flex rounded-xl border border-yellow-400/60 bg-yellow-400 text-blue-950 text-sm font-semibold items-center justify-center gap-1.5 px-4 py-2.5 hover:bg-yellow-300 transition-all"
        >
          Browse all resources <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}