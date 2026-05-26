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
  },
  {
    icon: FileText,
    title: "Past Papers",
    desc: "PSLC, JCE & MSCE past papers + mark schemes",
    path: "/past-papers",
  },
  {
    icon: Play,
    title: "Video Tutorials",
    desc: "Animated lessons for every topic",
    path: "/tutorials",
  },
  {
    icon: Brain,
    title: "AI Quizzes",
    desc: "Adaptive quizzes targeting your weak areas",
    path: "/quizzes",
  },
  {
    icon: Briefcase,
    title: "Career Resources",
    desc: "University guides & scholarships",
    path: "/career",
  },
  {
    icon: GraduationCap,
    title: "Exam Prep",
    desc: "Full mock exams with answer keys",
    path: "/past-papers",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-primary/5 border border-primary/10 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Everything you need to excel
          </h2>
          <p className="text-muted-foreground text-lg">
            One platform. All exam levels. Zero cost.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, path }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={path}
                className="block bg-card border border-border/60 rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 group h-full"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5.5 w-5.5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  Explore <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}