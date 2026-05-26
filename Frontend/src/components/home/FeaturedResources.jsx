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
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Featured Resources
          </h2>
          <p className="text-muted-foreground">
            Explore our most popular study materials
          </p>
        </div>
        <Link
          to="/study-notes"
          className="hidden md:flex text-primary text-sm font-semibold items-center gap-1 hover:gap-2 transition-all"
        >
          See all <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm px-5 py-2.5 rounded-full border font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course, i) => (
          <CourseCard key={i} course={course} index={i} />
        ))}
      </div>

      <Link
        to="/study-notes"
        className="md:hidden mt-8 flex text-primary text-sm font-semibold items-center justify-center gap-1"
      >
        View all resources <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}