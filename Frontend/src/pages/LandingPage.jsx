import React, { useEffect, useState } from "react";
import { fetchResources, fetchStudyGroups } from "@/api";
import { useAuth } from "@/lib/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import StatsRow from "@/components/home/StatsRow";
import ResourceCategories from "@/components/home/ResourceCategories";
import StudyGroupsSection from "@/components/home/StudyGroupSection";
import ContinueLearning from "@/components/home/ContinueLearning";
import SubjectSpotlight from "@/components/home/SubjectSpotlight";
import PersonalStats from "@/components/home/PersonalStats";
import LearningPaths from "@/components/home/LearningPaths";
import ResourceShowcase from "@/components/home/ResourceShowcase";

export default function LandingPage() {
  const { user } = useAuth();
  const [resourceCount, setResourceCount] = useState(0);
  const [studyGroupsCount, setStudyGroupsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) return;

    setLoadingStats(true);
    Promise.all([fetchResources(), fetchStudyGroups({ limit: 6 })])
      .then(([resources, groups]) => {
        if (!mounted) return;
        setResourceCount(Array.isArray(resources) ? resources.length : 0);
        setStudyGroupsCount(Array.isArray(groups) ? groups.length : 0);
      })
      .catch(() => {
        if (!mounted) return;
        setResourceCount(0);
        setStudyGroupsCount(0);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingStats(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full px-4 sm:px-6 py-6 space-y-8">
        {/* Hero */}
        <HeroSection user={user} />

        {/* Resource Showcase */}
        <ResourceShowcase />

        {/* Stats */}
        <StatsRow resourcesCount={resourceCount} studyGroupsCount={studyGroupsCount} loading={loadingStats} />

        {/* Personal Stats */}
        <PersonalStats />

        {/* Learning Paths */}
        <LearningPaths />

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
          <div className="space-y-8">
            {/* Resource categories */}
            <ResourceCategories />

            {/* Study groups */}
            <StudyGroupsSection />

            {/* Continue learning */}
            <ContinueLearning />
          </div>

          {/* Sidebar */}
          <div>
            <SubjectSpotlight />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 bg-card">
        <div className="w-full px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="text-sm font-heading font-semibold">Learn Malawi</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Empowering Malawian students with quality educational resources.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">About</button>
            <button className="hover:text-foreground transition-colors">Contact</button>
            <button className="hover:text-foreground transition-colors">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}