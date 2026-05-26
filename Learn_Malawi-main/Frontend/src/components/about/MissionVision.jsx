import React from "react";
import { motion } from "framer-motion";

const data = [
  {
    num: "01",
    title: "Mission",
    description:
      "To transform secondary education in Malawi by providing equitable access to a comprehensive, free digital learning platform that enhances student engagement, improves academic performance, and fosters lifelong learning for all, regardless of geographic or socioeconomic barriers.",
  },
  {
    num: "02",
    title: "Vision",
    description:
      "To be the leading catalyst for educational equity in Malawi, where every secondary student has the tools and opportunity to achieve their full academic potential, thereby contributing to an educated, innovative, and prosperous nation as envisioned by Malawi 2063.",
  },
];

export default function MissionVision() {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-32 md:py-48">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-inter text-sm tracking-[0.3em] uppercase text-primary">
            The Dual Mandate
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-medium mt-4 tracking-tight">
            Mission & Vision
          </h2>
        </motion.div>

        <div className="w-full h-px bg-border mt-12 mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {data.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative py-12 lg:py-16 ${
                i === 0 ? "lg:pr-16 lg:border-r border-border" : "lg:pl-16"
              }`}
            >
              {/* Large background numeral */}
              <span className="absolute top-4 right-4 lg:top-8 text-[8rem] md:text-[10rem] font-playfair font-bold text-foreground/[0.04] leading-none select-none pointer-events-none">
                {item.num}
              </span>

              <div className="relative z-10">
                <span className="font-inter text-xs tracking-[0.25em] uppercase text-secondary font-medium">
                  {item.num}
                </span>
                <h3 className="font-playfair text-3xl md:text-4xl font-medium mt-3 mb-6">
                  {item.title}
                </h3>
                <p className="font-inter text-lg leading-[1.65] text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}