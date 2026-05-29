import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Lightbulb, BookOpen } from "lucide-react";

const values = [
  {
    title: "Equity and Inclusion",
    description:
      "We believe every student deserves access to quality education regardless of their background, location, or socioeconomic status. Our platform breaks down barriers to learning.",
    icon: Users,
    cardClass: "bg-white border-blue-200 shadow-md",
    iconBg: "bg-blue-100 text-blue-800",
  },
  {
    title: "Quality and Relevance",
    description:
      "We uphold the highest standards of educational content, ensuring every resource is curriculum-aligned, peer-reviewed, and designed for real academic impact.",
    icon: GraduationCap,
    cardClass: "bg-yellow-50 border-yellow-200 shadow-md",
    iconBg: "bg-yellow-400 text-blue-950",
  },
  {
    title: "Innovation and Adaptability",
    description:
      "We embrace technology as a powerful tool for change, continuously evolving our platform to meet the diverse and growing needs of Malawian learners.",
    icon: Lightbulb,
    cardClass: "bg-white border-blue-200 shadow-md",
    iconBg: "bg-blue-600 text-yellow-300",
  },
  {
    title: "Collaboration and Partnership",
    description:
      "We achieve more together. By partnering with educators, institutions, and communities, we create a sustainable ecosystem for educational transformation.",
    icon: BookOpen,
    cardClass: "bg-gradient-to-br from-blue-50 to-yellow-50 border-blue-200 shadow-md",
    iconBg: "bg-blue-950 text-yellow-400",
  },
];

export default function ValuesGrid({ valuesImage }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 px-6 py-24 text-white md:px-16 md:py-32 lg:px-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-4"
          >
            <div className="sticky top-24 overflow-hidden rounded-2xl border-4 border-yellow-400 shadow-2xl ring-2 ring-white/20">
              <div className="aspect-[3/4]">
                <img
                  src={valuesImage}
                  alt="Student hands working on a tablet in sunlight"
                  className="h-full w-full object-cover brightness-105 contrast-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent" />
            </div>
          </motion.div>

          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-inter text-sm uppercase tracking-[0.3em] text-yellow-400">The Pillars of Equity</span>
              <h2 className="mt-4 font-playfair text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
                Our Values
              </h2>
            </motion.div>

            <div className="mb-8 mt-10 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {values.map((val, i) => {
                const Icon = val.icon;
                return (
                  <motion.div
                    key={val.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`group rounded-xl border p-6 transition-transform duration-300 hover:-translate-y-0.5 ${val.cardClass}`}
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${val.iconBg}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3
                      className={`mb-2 font-playfair text-xl font-medium ${val.titleClass || "text-blue-950"}`}
                    >
                      {val.title}
                    </h3>
                    <p
                      className={`font-inter text-[0.95rem] leading-[1.65] ${val.textClass || "text-blue-900/80"}`}
                    >
                      {val.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
