import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen, Brain, Users } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Active Learners" },
  { icon: BookOpen, value: "1,200+", label: "Free Resources" },
  { icon: Brain, value: "98%", label: "Satisfaction Rate" },
];

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden mx-4 md:mx-8 mb-16 md:mb-20 rounded-3xl border border-yellow-400/60 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-20 md:py-24 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.75)]">
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/50 text-yellow-100 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          100% Free — No Credit Card Required
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5"
        >
          Learn anything.{" "}
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            Completely free.
          </span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          No registration required to browse. Create a free account to track
          your progress, save resources, and unlock AI-powered quizzes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/35 hover:shadow-yellow-400/40 hover:-translate-y-0.5"
          >
            Start Learning for Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 bg-blue-900/60 hover:bg-blue-800/70 border border-blue-300/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5"
          >
            <Brain className="w-4 h-4 text-yellow-300" />
            Try an AI Quiz
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-white/10 pt-10"
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-white font-bold text-2xl md:text-3xl">
                <Icon className="w-5 h-5 text-yellow-300" />
                {value}
              </div>
              <span className="text-slate-500 text-sm">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}