import React from "react";
import { motion } from "framer-motion";
import { Clock, Lightbulb, GraduationCap, Globe } from "lucide-react";

const philosophyPoints = [
  {
    title: "Active Recall & Spaced Repetition",
    text: "Through interactive quizzes and progressive learning paths, we help students strengthen memory retention and master concepts over time.",
    icon: Clock,
  },
  {
    title: "Multimodal Learning",
    text: "We cater to diverse learning styles by offering content in various formats — text, video, audio, and interactive exercises — ensuring every student finds their path.",
    icon: Lightbulb,
  },
  {
    title: "Formative Assessment",
    text: "Our platform provides instant feedback and detailed analytics, empowering students and teachers to identify strengths and address gaps in real time.",
    icon: GraduationCap,
  },
  {
    title: "Contextualized Learning",
    text: "By using local examples and offering content in both English and Chichewa, we make education relatable, relevant, and deeply rooted in Malawian culture.",
    icon: Globe,
  },
];

const cardStyles = [
  "bg-yellow-50 border-yellow-200 text-blue-950",
  "bg-white border-blue-200 text-blue-950",
  "bg-blue-100/90 border-blue-300 text-blue-950",
  "bg-gradient-to-br from-yellow-100 to-blue-50 border-yellow-300/80 text-blue-950",
];

/**
 * @param {{ landscapeImage: string }} props
 */
export default function PhilosophySection({ landscapeImage }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[42vh] min-h-[280px] md:h-[48vh]">
        <img
          src={landscapeImage}
          alt="Malawian landscape"
          className="h-full w-full object-cover brightness-95 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/55 via-blue-900/35 to-blue-950/70" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center font-playfair text-4xl font-medium text-white drop-shadow-lg md:text-5xl lg:text-7xl"
          >
            Our Educational
            <br />
            <span className="italic text-yellow-400">Philosophy</span>
          </motion.h2>
        </div>
      </div>

      <div className="bg-gradient-to-b from-yellow-50 via-amber-50/40 to-blue-50 px-6 py-20 md:px-16 md:py-28 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-10 max-w-2xl font-inter text-lg text-blue-900/80">
            How we design learning experiences so every Malawian student can understand, remember, and apply what they
            study.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {philosophyPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl border p-8 shadow-sm ${cardStyles[i]}`}
                >
                  <span className="pointer-events-none absolute right-6 top-4 select-none font-playfair text-6xl font-bold text-blue-950/[0.06]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-yellow-400">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-3 font-playfair text-2xl font-medium">{point.title}</h3>
                    <p className="font-inter text-[0.95rem] leading-[1.65] text-blue-900/75">{point.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
