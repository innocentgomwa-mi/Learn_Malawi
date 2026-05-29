import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/images/cta.jpg",
  "/images/learn1.jpg",
  "/images/learn2.jpg",
];

export default function HeroSection({ variant = "default" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const isAuthenticatedVariant = variant === "authenticated";
  return (
    <section
      className={`relative overflow-hidden w-full ${
        isAuthenticatedVariant
          ? "min-h-[calc(100vh-6rem)] py-0"
          : "py-16 md:py-24"
      }`}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 ${
          isAuthenticatedVariant
            ? "bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700"
            : "bg-gradient-to-br from-blue-950/70 via-blue-900/30 to-blue-600/20"
        }`}
      />
      {/* White + yellow blend overlays */}
      <div
        className={`absolute inset-0 ${
          isAuthenticatedVariant
            ? "bg-gradient-to-br from-white/28 via-white/12 to-transparent"
            : "bg-gradient-to-br from-white/22 via-white/10 to-transparent"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isAuthenticatedVariant
            ? "bg-gradient-to-tr from-yellow-200/6 via-transparent to-yellow-400/7"
            : "bg-gradient-to-tr from-yellow-200/4 via-transparent to-yellow-400/6"
        }`}
      />
      {isAuthenticatedVariant && (
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-50" />
      )}

      {/* Crystal pattern overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isAuthenticatedVariant ? "opacity-[0.35] mix-blend-screen" : "opacity-[0.18] mix-blend-soft-light"
        }`}
        style={{
          backgroundImage: `
            radial-gradient(12px 18px at 12% 22%, rgba(255,255,255,${isAuthenticatedVariant ? "0.65" : "0.85"}) 0%, rgba(255,255,255,0.0) 70%),
            radial-gradient(10px 16px at 26% 68%, rgba(255,255,255,${isAuthenticatedVariant ? "0.55" : "0.75"}) 0%, rgba(255,255,255,0.0) 70%),
            radial-gradient(14px 20px at 42% 38%, rgba(255,255,255,${isAuthenticatedVariant ? "0.55" : "0.75"}) 0%, rgba(255,255,255,0.0) 72%),
            radial-gradient(10px 16px at 58% 64%, rgba(255,255,255,${isAuthenticatedVariant ? "0.5" : "0.7"}) 0%, rgba(255,255,255,0.0) 72%),
            radial-gradient(12px 18px at 72% 28%, rgba(255,255,255,${isAuthenticatedVariant ? "0.6" : "0.8"}) 0%, rgba(255,255,255,0.0) 72%),
            radial-gradient(14px 22px at 88% 56%, rgba(255,255,255,${isAuthenticatedVariant ? "0.55" : "0.75"}) 0%, rgba(255,255,255,0.0) 72%),
            radial-gradient(18px 26px at 20% 45%, rgba(250,204,21,0.28) 0%, rgba(250,204,21,0.0) 70%),
            radial-gradient(20px 28px at 78% 40%, rgba(250,204,21,0.24) 0%, rgba(250,204,21,0.0) 72%),
            radial-gradient(22px 30px at 62% 78%, rgba(250,204,21,0.2) 0%, rgba(250,204,21,0.0) 74%)
          `,
        }}
      />

      {/* Blue + yellow glows */}
      <div className={`absolute top-0 right-0 w-[720px] h-[720px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 ${isAuthenticatedVariant ? "bg-blue-400/20" : "bg-blue-500/15"}`} />
      <div className={`absolute -top-28 left-10 w-[620px] h-[620px] rounded-full blur-3xl ${isAuthenticatedVariant ? "bg-yellow-400/10" : "bg-yellow-400/8"}`} />

      <div className="relative w-full h-full flex items-center">
        <div className={`w-full px-4 md:px-8 lg:px-12 ${isAuthenticatedVariant ? "py-10 md:py-14" : ""}`}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={`font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 ${isAuthenticatedVariant ? "text-white" : "text-foreground"}`}>
              Academic Excellence{" "}
              <span className="relative inline-block">
                <span className="text-yellow-500">Starts Here.</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8C50 2 150 2 298 8" stroke="#facc15" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
                </svg>
              </span>
              <br />
              Learn with Confidence.
            </h1>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/study-notes"
                className="group bg-yellow-400 text-blue-950 font-semibold px-7 py-3.5 rounded-xl hover:bg-yellow-300 transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-yellow-500/25"
              >
                Explore Learning Resources
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/past-papers"
                className={`border-2 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 ${
                  isAuthenticatedVariant
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-foreground/15 text-foreground hover:bg-secondary"
                }`}
              >
                View Past Papers
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                ["Accessible", "Free for every learner"],
                ["Exam Ready", "PSLC, JCE, and MSCE support"],
                ["Curriculum Aligned", "Built around national standards"],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isAuthenticatedVariant ? "text-white" : "text-foreground"}`}>{title}</p>
                    <p className={`text-xs ${isAuthenticatedVariant ? "text-blue-100/80" : "text-muted-foreground"}`}>{sub}</p>
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
            <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/80 shadow-2xl shadow-yellow-500/20">
              <img
                src={HERO_IMAGES[currentImageIndex]}
                alt="Malawian student studying during golden hour"
                className="w-full h-[480px] object-cover transition-opacity duration-500"
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
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
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
              <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. improvement</p>
                <p className="text-base font-bold text-foreground">+34% grades</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}