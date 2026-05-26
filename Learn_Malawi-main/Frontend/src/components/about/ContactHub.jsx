import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

/**
 * @typedef {{ studentImage: string }} ContactHubProps
 */

/**
 * @param {ContactHubProps} props
 */
export default function ContactHub({ studentImage }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
    setSending(false);
  };

  /**
   * @param {keyof typeof form} field
   */
  const handleFormChange = (field) => {
    return /** @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e */ (e) => {
      setForm({ ...form, [field]: e.target.value });
    };
  };

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
            The Connection Hub
          </span>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-medium mt-4 tracking-tight">
            Get in Touch
          </h2>
        </motion.div>

        <div className="w-full h-px bg-border mt-12 mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="space-y-12"
          >
            <p className="font-inter text-lg leading-[1.65] text-muted-foreground max-w-md">
              If you have any questions, suggestions, or would like to partner
              with us, we'd love to hear from you.
            </p>

            <div className="space-y-8">
              <div>
                <span className="font-inter text-xs tracking-[0.2em] uppercase text-secondary font-medium">
                  Mr Willard Zimba
                </span>
                <p className="font-playfair text-3xl md:text-4xl font-medium mt-2">
                  +265 997 67 47 58
                </p>
              </div>
              <div>
                <span className="font-inter text-xs tracking-[0.2em] uppercase text-secondary font-medium">
                  Mr Innocent Gomwa
                </span>
                <p className="font-playfair text-3xl md:text-4xl font-medium mt-2">
                  +265 883 36 08 44
                </p>
              </div>
            </div>

            {/* Portrait image */}
            <div className="overflow-hidden rounded-2xl aspect-[4/5] max-w-xs">
              <img
                src={studentImage}
                alt="Student looking towards the horizon with confidence"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="font-inter text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={handleFormChange("name")}
                  placeholder="Your name"
                  required
                  className="bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-lg font-inter focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="space-y-2">
                <label className="font-inter text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={handleFormChange("email")}
                  placeholder="your@email.com"
                  required
                  className="bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-lg font-inter focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="space-y-2">
                <label className="font-inter text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  Message
                </label>
                <Textarea
                  value={form.message}
                  onChange={handleFormChange("message")}
                  placeholder="Tell us what's on your mind..."
                  required
                  rows={5}
                  className="bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-lg font-inter focus-visible:ring-0 focus-visible:border-primary resize-none placeholder:text-muted-foreground/40"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="group bg-foreground text-background hover:bg-foreground/90 font-inter text-sm tracking-[0.15em] uppercase px-8 py-6 rounded-none"
              >
                {sending ? "Sending..." : "Send Message"}
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}