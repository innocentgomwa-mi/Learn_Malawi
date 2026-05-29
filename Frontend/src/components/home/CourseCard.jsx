import { Link } from "react-router-dom";
import { Star, Users } from "lucide-react";
import { motion } from "framer-motion";

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

/**
 * @param {{ course: Course; index: number }} props
 */
export default function CourseCard({ course, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        to={course.path || "/study-notes"}
        className="group block bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-foreground/5 hover:border-primary/20 transition-all duration-300 cursor-pointer"
      >
        <div className="relative overflow-hidden h-44">
          <img
            src={course.img}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {course.tag && (
            <span
              className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg ${course.tagColor}`}
            >
              {course.tag}
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1.5 tracking-wide uppercase">
            {course.subject} · {course.level}
          </p>
          <h3 className="text-[15px] font-bold text-foreground leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {course.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-bold text-amber-700">{course.rating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(course.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({course.students})</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {course.students} students
          </p>
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-primary font-bold text-sm">Free</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}