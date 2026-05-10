import React from "react";
import { motion } from "framer-motion";

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
      {/* Background watermark */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 select-none pointer-events-none">
        <span className="text-[20vw] font-playfair font-bold text-foreground/[0.03] leading-none">
          2063
        </span>
      </div>

      {/* Vertical rule */}
      <div className="absolute left-12 md:left-20 top-0 bottom-0 w-px bg-border hidden lg:block" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block font-inter text-sm tracking-[0.3em] uppercase text-primary mb-8 md:mb-12">
            About Learn Malawi
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-playfair text-[clamp(2.5rem,8vw,7rem)] leading-[1.05] font-medium tracking-tight max-w-5xl"
        >
          Free education for{" "}
          <span className="italic text-primary">every</span>{" "}
          Malawian student.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end"
        >
          <p className="font-inter text-lg md:text-xl leading-[1.65] text-muted-foreground max-w-xl">
            Learn Malawi is a free digital education platform dedicated to one
            powerful goal: free, quality education for every secondary school
            student in Malawi. We provide curriculum-aligned resources for JCE
            and MSCE learners, with accessible, engaging content built for real
            classroom success.
          </p>

          <div className="relative overflow-hidden rounded-2xl aspect-[21/9]">
            <img
              src={heroImage}
              alt="Close-up of a student's eye reflecting digital learning"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-inter text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-primary/40"
        />
      </motion.div>
    </section>
  );
}