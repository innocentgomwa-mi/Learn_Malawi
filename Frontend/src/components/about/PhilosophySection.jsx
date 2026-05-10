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

/**
 * @typedef {{ landscapeImage: string }} PhilosophySectionProps
 */

/**
 * @param {PhilosophySectionProps} props
 */
export default function PhilosophySection({ landscapeImage }) {
  return (
    <section className="py-32 md:py-48 relative overflow-hidden">
      {/* Full-width image banner */}
      <div className="relative h-[40vh] md:h-[50vh] mb-24 overflow-hidden">
        <img
          src={landscapeImage}
          alt="Malawian valley at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-4xl md:text-5xl lg:text-7xl font-medium text-center px-6 drop-shadow-sm"
          >
            Our Educational
            <br />
            <span className="italic text-primary">Philosophy</span>
          </motion.h2>
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
            {philosophyPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`relative py-14 px-8 border-b border-border ${
                    i % 2 === 0 ? "md:border-r" : ""
                  }`}
                >
                  {/* Large background index */}
                  <span className="absolute top-6 right-8 text-7xl font-playfair font-bold text-foreground/[0.04] select-none pointer-events-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10">
                    <Icon className="w-6 h-6 text-primary mb-6" strokeWidth={1.5} />
                    <h3 className="font-playfair text-2xl font-medium mb-4">
                      {point.title}
                    </h3>
                    <p className="font-inter text-[0.95rem] leading-[1.65] text-muted-foreground">
                      {point.text}
                    </p>
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