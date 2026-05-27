import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

const HERO_IMG = "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.03]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Trusted by 50,000+ Malawian students
            </span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Success is{" "}
              <span className="relative inline-block">
                <span className="text-primary">Your Heritage.</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C50 2 150 2 298 8" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                </svg>
              </span>
              <br />
              Learn Without Limits.
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg">
              Free, curriculum-aligned resources for PSLC, JCE & MSCE students
              across Malawi. Study notes, past papers, AI quizzes and more — all
              at zero cost.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/study-notes"
                className="group bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-primary/20"
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/past-papers"
                className="border-2 border-foreground/15 text-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-secondary transition-all duration-200"
              >
                Browse Past Papers
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                ["100% Free", "No fees ever"],
                ["All Levels", "PSLC to MSCE"],
                ["MIE Aligned", "Official curriculum"],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-foreground/10">
              <img
                src={HERO_IMG}
                alt="Malawian student studying during golden hour"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
            </div>

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-card shadow-xl shadow-foreground/5 rounded-2xl p-4 flex items-center gap-3 border border-border/50"
            >
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Students this month</p>
                <p className="text-base font-bold text-foreground">+2,400 joined</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-5 -right-5 bg-card shadow-xl shadow-foreground/5 rounded-2xl p-4 flex items-center gap-3 border border-border/50"
            >
              <div className="w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. improvement</p>
                <p className="text-base font-bold text-foreground">+34% grades</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}