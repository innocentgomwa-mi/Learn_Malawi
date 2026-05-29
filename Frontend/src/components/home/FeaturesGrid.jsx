import { Link } from "react-router-dom";
import {
  BookOpen, FileText, Play, Brain, Briefcase, GraduationCap, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Study Notes",
    desc: "Curriculum-aligned notes for all subjects",
    path: "/study-notes",
    backgroundImage: "/images/study notes.jpg",
  },
  {
    icon: FileText,
    title: "Past Papers",
    desc: "PSLC, JCE & MSCE past papers + mark schemes",
    path: "/past-papers",
    backgroundImage: "/images/past papers.jpg",
  },
  {
    icon: Play,
    title: "Video Tutorials",
    desc: "Animated lessons for every topic",
    path: "/tutorials",
    backgroundImage: "/images/tutorials.png",
  },
  {
    icon: Brain,
    title: "AI Quizzes",
    desc: "Adaptive quizzes targeting your weak areas",
    path: "/quizzes",
    backgroundImage: "/images/quizzes.jpg",
  },
  {
    icon: Briefcase,
    title: "Career Resources",
    desc: "University guides & scholarships",
    path: "/career",
    backgroundImage: "/images/career.jpg",
  },
  {
    icon: GraduationCap,
    title: "Exam Prep",
    desc: "Full mock exams with answer keys",
    path: "/past-papers",
    backgroundImage: "/images/past papers.jpg",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-yellow-400/60 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 mx-4 md:mx-8 py-14 md:py-20 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.75)]">
      <div className="w-full px-5 md:px-8">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200 mb-4">
              Feature Section
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
            Everything you need to excel
            </h2>
            <p className="text-blue-100/90 text-lg">
              One platform. All exam levels. Zero cost.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, path, backgroundImage }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="h-full"
              >
                <Link
                  to={path}
                  className="block relative rounded-2xl p-6 md:p-7 hover:shadow-[0_18px_40px_-20px_rgba(250,204,21,0.75)] hover:border-yellow-300/90 transition-all duration-300 group h-full min-h-[220px] overflow-hidden border border-yellow-400/60"
                  style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-blue-950/55 group-hover:bg-blue-950/45 transition-colors" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-yellow-400/30 rounded-xl flex items-center justify-center mb-4 border-2 border-yellow-300/90 shadow-[0_8px_20px_-12px_rgba(250,204,21,0.95)] group-hover:bg-yellow-400/40 transition-colors">
                      <Icon className="h-5.5 w-5.5 text-yellow-100" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1.5 group-hover:text-yellow-200 transition-colors drop-shadow">
                      {title}
                    </h3>
                    <p className="text-blue-100 text-sm leading-relaxed drop-shadow">
                      {desc}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-yellow-200 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
}