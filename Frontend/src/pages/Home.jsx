import { Link } from "react-router-dom";
import { BookOpen, FileText, Play, Brain, Briefcase, ArrowRight, Users, BookMarked, Award } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    path: "/study-notes",
    icon: BookOpen,
    label: "Study Notes",
    desc: "Curriculum-aligned notes for Standard 1–8 and Form 1–4 across all subjects.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  {
    path: "/past-papers",
    icon: FileText,
    label: "Past Papers",
    desc: "PSLC, JCE & MSCE past papers with detailed marking schemes.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    path: "/tutorials",
    icon: Play,
    label: "Tutorials",
    desc: "Animated lessons, videos & audio summaries for every topic.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100",
  },
  {
    path: "/quizzes",
    icon: Brain,
    label: "Quizzes",
    desc: "AI-powered adaptive quizzes that target your knowledge gaps.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    path: "/career",
    icon: Briefcase,
    label: "Career Resources",
    desc: "University guides, scholarships & career pathways for Malawian students.",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100",
  },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Students Served" },
  { icon: BookMarked, value: "500+", label: "Study Resources" },
  { icon: Award, value: "3 Levels", label: "PSLC · JCE · MSCE" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Free Education for Every Malawian Student
              </span>
              <h1 className="font-poppins text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
                Learn Smarter,<br />
                <span className="text-secondary">Excel Together</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                High-quality, curriculum-aligned learning resources for PSLC, JCE, and MSCE students across Malawi. Study notes, past papers, tutorials, and AI-powered quizzes — all free.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/study-notes"
                  className="bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/quizzes"
                  className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-semibold px-6 py-3 rounded-xl hover:bg-primary-foreground/20 transition-colors"
                >
                  Take a Quiz
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 800 0 600 20C400 40 200 0 0 20L0 60Z" fill="hsl(210 40% 98%)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-2 pb-8">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center p-4">
              <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-poppins font-bold text-2xl text-foreground">{value}</p>
              <p className="text-muted-foreground text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-poppins text-3xl font-bold text-foreground mb-3">Everything You Need to Excel</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All resources are aligned with the Malawi national curriculum and endorsed by MIE standards.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ path, icon: Icon, label, desc, color, iconBg }, idx) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link
                to={path}
                className={`block border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 ${color}`}
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-poppins font-bold text-lg mb-2">{label}</h3>
                <p className="text-sm leading-relaxed opacity-80">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Tutor Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">AI-Powered Learning</span>
            <h2 className="font-poppins text-3xl font-bold mb-3">Meet Your AI Study Tutor</h2>
            <p className="text-primary-foreground/80 mb-6">
              Available 24/7, your personal AI tutor can explain any concept, solve problems step-by-step, and give you culturally relevant examples from Malawi. Click the chat button in the corner to get started!
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {["24/7 Available", "Instant Answers", "Chichewa Context", "All Subjects"].map((b) => (
                <span key={b} className="bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}