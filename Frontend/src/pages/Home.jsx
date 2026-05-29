import { useEffect, useState } from "react";
import Navbar from "../components/home/Navbar";
import HeroSection from "../components/home/HeroSection";
import StatsBar from "../components/home/StatsBar";
import FeaturedResources from "../components/home/FeaturedResources";
import FeaturesGrid from "../components/home/FeaturesGrid";
import WhySection from "../components/home/WhySection";
import CTABanner from "../components/home/CTABanner";
import { fetchStudyNotes, fetchTutorials, fetchQuizzes } from "../api";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedResources = async () => {
      try {
        setLoading(true);
        
        // Fetch different types of resources
        const [studyNotes, tutorials, quizzes] = await Promise.all([
          fetchStudyNotes().catch(() => []),
          fetchTutorials().catch(() => []),
          fetchQuizzes().catch(() => []),
        ]);

        // Transform and combine the data into the Course format
        const transformedCourses = [
          ...transformStudyNotes(studyNotes || []),
          ...transformTutorials(tutorials || []),
          ...transformQuizzes(quizzes || []),
        ].slice(0, 6); // Limit to 6 featured items

        setCourses(transformedCourses);
      } catch (error) {
        console.error("Error loading featured resources:", error);
        // Fallback to empty array if API fails
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedResources();
  }, []);

  // Transform study notes to Course format
  const transformStudyNotes = (notes) => {
    return (notes || []).map((note) => ({
      title: note.title,
      subject: note.subject || "General",
      level: note.level || "All",
      rating: note.rating || 4.5,
      students: `${note.views || 0}`,
      tag: note.isPinned ? "Popular" : null,
      tagColor: note.isPinned ? "bg-accent text-accent-foreground" : undefined,
      img: note.thumbnail || "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
      path: note?.id ? `/study-notes?selected_id=${encodeURIComponent(String(note.id))}` : "/study-notes",
    }));
  };

  // Transform tutorials to Course format
  const transformTutorials = (tutorials) => {
    return (tutorials || []).map((tutorial) => ({
      title: tutorial.title,
      subject: tutorial.subject || "General",
      level: tutorial.level || "All",
      rating: tutorial.rating || 4.6,
      students: `${tutorial.views || 0}`,
      tag: "New",
      tagColor: "bg-green-500 text-white",
      img: tutorial.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      path: tutorial?.id ? `/tutorials?selected_id=${encodeURIComponent(String(tutorial.id))}` : "/tutorials",
    }));
  };

  // Transform quizzes to Course format
  const transformQuizzes = (quizzes) => {
    return (quizzes || []).map((quiz) => ({
      title: quiz.title,
      subject: quiz.subject || "General",
      level: quiz.level || "All",
      rating: quiz.rating || 4.7,
      students: `${quiz.attempts || 0}`,
      tag: null,
      tagColor: undefined,
      img: "https://images.unsplash.com/photo-1516321318423-f06f70504ccf?auto=format&fit=crop&w=800&q=80",
      path: "/quizzes",
    }));
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturedResources courses={courses} />
      <FeaturesGrid />
      <WhySection />
      <CTABanner />
    </div>
  );
}