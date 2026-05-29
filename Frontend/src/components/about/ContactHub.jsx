import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

/**
 * @param {{ studentImage: string }} props
 */
export default function ContactHub({ studentImage }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
    setSending(false);
  };

  const handleFormChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-6 py-24 text-white md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-inter text-sm uppercase tracking-[0.3em] text-yellow-400">The Connection Hub</span>
          <h2 className="mt-4 font-playfair text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
            Get in Touch
          </h2>
        </motion.div>

        <div className="mt-10 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200" />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <p className="max-w-md font-inter text-lg leading-[1.65] text-blue-100/90">
              If you have any questions, suggestions, or would like to partner with us, we&apos;d love to hear from
              you.
            </p>

            <div className="rounded-xl border border-blue-700/80 bg-blue-900/40 px-5 py-4 backdrop-blur-sm">
              <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
                Contact us
              </span>
              <a
                href="tel:+265883360844"
                className="mt-2 flex items-center gap-2 font-playfair text-2xl font-medium text-white transition-colors hover:text-yellow-300 md:text-3xl"
              >
                <Phone className="h-5 w-5 shrink-0 text-yellow-400" />
                0883360844
              </a>
            </div>

            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-4 border-yellow-400 shadow-xl ring-2 ring-white/10 lg:max-w-none">
              <div className="relative aspect-[4/5] w-full min-h-[280px] sm:min-h-[360px]">
                <img
                  src={studentImage}
                  alt="Student looking towards the horizon with confidence"
                  className="absolute inset-0 h-full w-full object-cover object-center brightness-105"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-2xl border border-blue-700/60 bg-white p-8 text-blue-950 shadow-2xl md:p-10"
          >
            <h3 className="mb-6 font-poppins text-lg font-bold text-blue-950">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={handleFormChange("name")}
                  placeholder="Your name"
                  required
                  className="rounded-xl border-blue-200 bg-blue-50/50 px-4 py-3 text-blue-950 focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <label className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={handleFormChange("email")}
                  placeholder="your@email.com"
                  required
                  className="rounded-xl border-blue-200 bg-blue-50/50 px-4 py-3 text-blue-950 focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <label className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-blue-800">
                  Message
                </label>
                <Textarea
                  value={form.message}
                  onChange={handleFormChange("message")}
                  placeholder="Tell us what's on your mind..."
                  required
                  rows={5}
                  className="resize-none rounded-xl border-blue-200 bg-blue-50/50 px-4 py-3 text-blue-950 focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="group inline-flex w-full items-center justify-center rounded-xl border border-yellow-300 bg-yellow-400 px-8 py-4 font-inter text-sm font-semibold uppercase tracking-[0.12em] text-blue-950 transition-colors hover:bg-yellow-300 disabled:opacity-60 sm:w-auto"
              >
                {sending ? "Sending..." : "Send Message"}
                <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
