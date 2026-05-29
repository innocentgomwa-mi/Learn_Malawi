import React from "react";
import { motion } from "framer-motion";

const data = [
  {
    num: "01",
    title: "Mission",
    description:
      "To transform secondary education in Malawi by providing equitable access to a comprehensive, free digital learning platform that enhances student engagement, improves academic performance, and fosters lifelong learning for all, regardless of geographic or socioeconomic barriers.",
    cardClass: "bg-white border-blue-200/80 shadow-[0_12px_40px_-20px_rgba(30,58,138,0.2)]",
    numClass: "text-blue-700",
  },
  {
    num: "02",
    title: "Vision",
    description:
      "To be the leading catalyst for educational equity in Malawi, where every secondary student has the tools and opportunity to achieve their full academic potential, thereby contributing to an educated, innovative, and prosperous nation as envisioned by Malawi 2063.",
    cardClass: "bg-gradient-to-br from-yellow-50 to-yellow-100/80 border-yellow-300/80 shadow-[0_12px_40px_-20px_rgba(202,138,4,0.15)]",
    numClass: "text-yellow-700",
  },
];

export default function MissionVision() {
  return (
    <section className="bg-gradient-to-b from-blue-100 via-blue-50 to-white px-6 py-24 md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <span className="font-inter text-sm uppercase tracking-[0.3em] text-blue-800">The Dual Mandate</span>
          <h2 className="mt-4 font-playfair text-4xl font-medium tracking-tight text-blue-950 md:text-5xl lg:text-6xl">
            Mission & Vision
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-yellow-400 lg:mx-0" />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {data.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`relative overflow-hidden rounded-2xl border p-8 md:p-10 lg:p-12 ${item.cardClass}`}
            >
              <span
                className={`pointer-events-none absolute -right-4 -top-6 select-none font-playfair text-[7rem] font-bold leading-none opacity-[0.07] md:text-[9rem] ${item.numClass}`}
              >
                {item.num}
              </span>

              <div className="relative z-10">
                <span className={`font-inter text-xs font-bold uppercase tracking-[0.25em] ${item.numClass}`}>
                  {item.num}
                </span>
                <h3 className="mt-3 mb-5 font-playfair text-3xl font-medium text-blue-950 md:text-4xl">{item.title}</h3>
                <p className="font-inter text-lg leading-[1.65] text-blue-900/80">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
