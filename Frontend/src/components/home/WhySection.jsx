import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const WHY_IMG = "https://media.base44.com/images/public/6a116297a56b775fe975fcb6/a3b90f8c4_generated_ce65a847.png";

const REASONS = [
  [
    "MIE-Aligned Curriculum",
    "All content follows the official Malawi Institute of Education syllabus for PSLC, JCE & MSCE.",
  ],
  [
    "AI-Powered Quizzes",
    "Our adaptive quiz engine identifies your weak areas and focuses your revision where it matters most.",
  ],
  [
    "Available in English & Chichewa",
    "We're building resources in local languages so no student is left behind.",
  ],
  [
    "100% Free, Forever",
    "No subscriptions, no paywalls, no hidden fees. Quality education for every Malawian.",
  ],
];

export default function WhySection() {
  return (
    <section className="mx-4 md:mx-8 my-14 md:my-20 rounded-3xl border border-yellow-400/60 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 px-5 md:px-8 py-16 md:py-20 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.75)]">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden border-2 border-yellow-400/70 shadow-2xl shadow-yellow-500/20">
            <img
              src={WHY_IMG}
              alt="Malawian students learning together"
              className="w-full h-[400px] md:h-[450px] object-cover"
            />
          </div>
          {/* Decorative accent */}
          <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-3xl bg-blue-500/20" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight mb-8">
            Built for Malawian
            <br />
            students.{" "}
            <span className="text-yellow-300">By Malawians.</span>
          </h2>

          <div className="space-y-5">
            {REASONS.map(([title, desc], i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/20 border border-yellow-300/50 flex items-center justify-center mt-0.5">
                  <CheckCircle className="h-4 w-4 text-yellow-300" />
                </div>
                <div>
                  <p className="font-semibold text-white text-[15px]">
                    {title}
                  </p>
                  <p className="text-blue-100/85 text-sm mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/study-notes"
            className="group mt-10 inline-flex items-center gap-2.5 bg-yellow-400 text-blue-950 font-semibold px-7 py-3.5 rounded-xl hover:bg-yellow-300 transition-all duration-200 shadow-lg shadow-yellow-500/25"
          >
            Start Learning
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}