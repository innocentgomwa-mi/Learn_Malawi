import Navbar from "../components/home/Navbar";
import HeroSection from "../components/home/HeroSection";
import StatsBar from "../components/home/StatsBar";
import FeaturedResources from "../components/home/FeaturedResources";
import FeaturesGrid from "../components/home/FeaturesGrid";
import WhySection from "../components/home/WhySection";
import CTABanner from "../components/home/CTABanner";

const COURSES = [
  {
    title: "MSCE Mathematics — Complete Revision",
    subject: "Mathematics",
    level: "MSCE",
    rating: 4.9,
    students: "12,400",
    tag: "Bestseller",
    tagColor: "bg-amber-400 text-amber-900",
    img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "MSCE English Language — Paper 1 & 2",
    subject: "English",
    level: "MSCE",
    rating: 4.8,
    students: "9,800",
    tag: "New",
    tagColor: "bg-green-500 text-white",
    img: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "JCE Science — Biology, Chemistry & Physics",
    subject: "Science",
    level: "JCE",
    rating: 4.7,
    students: "7,200",
    tag: "Popular",
    tagColor: "bg-accent text-accent-foreground",
    img: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "PSLC Complete Study Pack",
    subject: "All Subjects",
    level: "PSLC",
    rating: 4.9,
    students: "18,500",
    tag: "Bestseller",
    tagColor: "bg-amber-400 text-amber-900",
    img: "https://images.unsplash.com/photo-1519452575419-7fcb8f8d0843?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "MSCE History & Geography",
    subject: "Social Studies",
    level: "MSCE",
    rating: 4.6,
    students: "5,100",
    tag: null,
    img: "https://images.unsplash.com/photo-1532614338840-ab30cf10ed64?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "AI-Powered Quiz Practice — All Levels",
    subject: "All Subjects",
    level: "All",
    rating: 4.8,
    students: "22,000",
    tag: "New",
    tagColor: "bg-green-500 text-white",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturedResources courses={COURSES} />
      <FeaturesGrid />
      <WhySection />
      <CTABanner />
     
    </div>
  );
}