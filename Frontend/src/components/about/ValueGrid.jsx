import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Lightbulb, BookOpen } from "lucide-react";

const values = [
  {
    title: "Equity and Inclusion",
    description:
      "We believe every student deserves access to quality education regardless of their background, location, or socioeconomic status. Our platform breaks down barriers to learning.",
    icon: Users,
  },
  {
    title: "Quality and Relevance",
    description:
      "We uphold the highest standards of educational content, ensuring every resource is curriculum-aligned, peer-reviewed, and designed for real academic impact.",
    icon: GraduationCap,
  },
  {
    title: "Innovation and Adaptability",
    description:
      "We embrace technology as a powerful tool for change, continuously evolving our platform to meet the diverse and growing needs of Malawian learners.",
    icon: Lightbulb,
  },
  {
    title: "Collaboration and Partnership",
    description:
      "We achieve more together. By partnering with educators, institutions, and communities, we create a sustainable ecosystem for educational transformation.",
    icon: BookOpen,
  },
];

export default function ValuesGrid({ valuesImage }) {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-32 md:py-48 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Image column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 relative"
          >
            <div className="overflow-hidden rounded-2xl aspect-[3/4] sticky top-24">
              <img
                src={valuesImage}
                alt="Student hands working on a tablet in sunlight"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Values column */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-inter text-sm tracking-[0.3em] uppercase text-primary">
                The Pillars of Equity
              </span>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-medium mt-4 tracking-tight">
                Our Values
              </h2>
            </motion.div>

            <div className="w-full h-px bg-border mt-12 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {values.map((val, i) => {
                const Icon = val.icon;
                return (
                  <motion.div
                    key={val.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="group relative py-10 px-6 border-b border-border transition-colors duration-500 hover:bg-secondary/[0.04]"
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-6 right-6 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    <Icon className="w-5 h-5 text-secondary mb-5" strokeWidth={1.5} />
                    <h3 className="font-playfair text-xl font-medium mb-3">
                      {val.title}
                    </h3>
                    <p className="font-inter text-[0.95rem] leading-[1.65] text-muted-foreground">
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