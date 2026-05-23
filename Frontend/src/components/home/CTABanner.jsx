import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-20">
      {/* Abstract shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/[0.03] rounded-full -translate-x-1/2 -translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto px-4 text-center"
      >
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
          Join 50,000+ students
          <br />
          learning for free
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          No registration required to browse. Create a free account to track
          your progress and save resources.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="bg-background text-foreground font-bold px-8 py-3.5 rounded-xl hover:bg-background/90 transition-all duration-200 shadow-lg"
          >
            Start Learning for Free
          </Link>
          <Link
            to="/quizzes"
            className="border-2 border-primary-foreground/30 text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:bg-primary-foreground/10 transition-all duration-200"
          >
            Try an AI Quiz
          </Link>
        </div>
      </motion.div>
    </section>
  );
}