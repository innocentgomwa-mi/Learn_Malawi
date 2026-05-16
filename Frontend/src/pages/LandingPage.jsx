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
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-8xl px-6 sm:px-8 py-8 space-y-10">
        {/* Hero */}
        <HeroSection user={user} />

        <div className="grid gap-8">
          {/* Explore and performance */}
          <div className="grid gap-8">
            <ResourceShowcase />
            <StatsRow resourcesCount={resourceCount} studyGroupsCount={studyGroupsCount} loading={loadingStats} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
            <div className="space-y-8">
              <ResourceCategories />
              <StudyGroupsSection />
              <LearningPaths />
            </div>

            <div className="space-y-8">
              <PersonalStats />
              <ContinueLearning />
              <SubjectSpotlight />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}