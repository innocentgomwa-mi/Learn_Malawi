import React from "react";
import { motion } from "framer-motion";

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-6 text-white md:px-16 lg:px-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 translate-x-1/4 select-none pointer-events-none lg:block">
        <span className="text-[20vw] font-playfair font-bold leading-none text-white/[0.04]">2063</span>
      </div>

      <div className="absolute bottom-0 left-12 top-0 hidden w-px bg-yellow-400/30 md:left-20 lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-8 inline-block font-inter text-sm uppercase tracking-[0.3em] text-yellow-400 md:mb-12">
            About Learn Malawi
          </span>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl font-playfair text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[1.08] tracking-tight"
            >
              Free education for <span className="italic text-yellow-400">every</span> Malawian student.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 max-w-xl font-inter text-lg leading-[1.65] text-blue-100/95 md:text-xl"
            >
              Learn Malawi is a free digital education platform dedicated to one powerful goal: free, quality
              education for every secondary school student in Malawi. We provide curriculum-aligned resources for
              JCE and MSCE learners, with accessible, engaging content built for real classroom success.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-300 opacity-90 blur-sm" />
            <div className="relative overflow-hidden rounded-2xl border-4 border-yellow-400 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] ring-2 ring-white/30">
              <div className="aspect-[4/3] w-full sm:aspect-[5/4] lg:min-h-[340px] lg:aspect-auto lg:h-[380px]">
                <img
                  src={heroImage}
                  alt="Student engaged in digital learning"
                  className="h-full w-full object-cover object-center brightness-[1.05] contrast-[1.08] saturate-[1.1]"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-950/10 via-transparent to-transparent" />
            </div>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-yellow-300/90">
              Learning without barriers
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-inter text-xs uppercase tracking-[0.2em] text-blue-200/80">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-yellow-400/80"
        />
      </motion.div>
    </section>
  );
}
