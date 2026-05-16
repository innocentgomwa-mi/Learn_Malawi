import React from "react";
import HeroSection from "@/components/about/HeroSection";
import MissionVision from "@/components/about/MissionVision";
import ValuesGrid from "@/components/about/ValueGrid";
import PhilosophySection from "@/components/about/PhilosophySection";
import ContactHub from "@/components/about/ContactHub";

const IMAGES = {
  hero: "https://media.base44.com/images/public/6a0047e8d8e9d314e54e8575/0a11f978d_generated_08d2e7eb.png",
  values: "https://media.base44.com/images/public/6a0047e8d8e9d314e54e8575/13fc12f00_generated_6560fadc.png",
  landscape: "/images/landingimage.jpg",
  student: "https://media.base44.com/images/public/6a0047e8d8e9d314e54e8575/8ff464423_generated_bfcdc192.png",
};

export default function About() {
  return (
    <div className="bg-background text-foreground min-h-screen font-inter">
      <HeroSection heroImage={IMAGES.hero} />
      <MissionVision />
      <ValuesGrid valuesImage={IMAGES.values} />
      <PhilosophySection landscapeImage={IMAGES.landscape} />
      <ContactHub studentImage={IMAGES.student} />
    </div>
  );
}