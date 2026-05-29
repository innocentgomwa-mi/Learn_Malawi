import React from "react";
import { motion } from "framer-motion";
import { Mail, Globe, BookOpen, Heart } from "lucide-react";

export default function AboutFooter() {
  return (
    <section className="bg-slate-950 text-white py-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">About Learn Malawi</p>
          <h3 className="text-3xl md:text-4xl font-playfair font-medium">Helping every student thrive.</h3>
          <p className="text-sm text-slate-300 leading-7">
            Learn Malawi is built to make secondary education more accessible, engaging, and locally relevant for learners across Malawi. Join us in empowering the next generation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6"
        >
          {[
            { icon: Globe, label: "Curriculum-aligned resources" },
            { icon: BookOpen, label: "Interactive learning tools" },
            { icon: Heart, label: "Community-driven impact" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <div className="rounded-xl bg-yellow-400 p-3 text-blue-950">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-300">{item.label}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-yellow-500">Stay connected</p>
          <div className="space-y-3 text-slate-300 text-sm">
            <p className="flex items-center gap-3"><Mail className="w-4 h-4" /> hello@learnmalawi.org</p>
            <p className="flex items-center gap-3"><Globe className="w-4 h-4" /> www.learnmalawi.org</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
