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
    </div>
  );
}