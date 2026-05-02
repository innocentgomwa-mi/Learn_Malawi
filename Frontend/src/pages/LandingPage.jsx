import React, { useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/lib/AuthContext";
import { fetchStudentProgress } from "@/api";
import HeroGreetings from "@/components/home/HeroGreetings";
import CurrentlyReading from "@/components/home/CurrentlyReading";
import QuickStats from "@/components/home/QuickStats";
import RecommendedBooks from "@/components/home/RecommendedBooks";
import ActivityPulse from "@/components/home/ActivityPulse";
import SearchMonolith from "@/components/home/SearchMonolith";
import SubjectIslands, { BASE_SUBJECTS } from "@/components/home/SubjectIslands";
import FocusTimer from "@/components/home/FocusTimer";

export default function LandingPage() {
  const { user } = useAuth();
  const userName = useMemo(
    () => user?.full_name?.split(" ")[0] || "Scholar",
    [user]
  );

  const { data: progressEntries = [] } = useQuery({
    queryKey: ['landingPageProgress', user?.email],
    queryFn: () => fetchStudentProgress({ studentEmail: user?.email, entryType: 'study' }),
    enabled: Boolean(user?.email),
    staleTime: 1000 * 60,
    initialData: [],
  });

  const progressMap = useMemo(() => {
    return progressEntries.reduce(
      (
        /** @type {Record<string, any>} */ map,
        /** @type {any} */ entry
      ) => {
        if (entry?.resource_id) {
          map[entry.resource_id] = entry;
        }
        return map;
      },
      /** @type {Record<string, any>} */ ({})
    );
  }, [progressEntries]);

  const [bonusMinutes, setBonusMinutes] = useState(/** @type {Record<string, number>} */ ({}));

  /**
   * @param {string} subjectName
   * @param {number} minutes
   */
  const handleSessionComplete = (subjectName, minutes) => {
    setBonusMinutes((prev) => ({
      ...prev,
      [subjectName]: (prev[subjectName] || 0) + minutes,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-14 max-w-7xl mx-auto">
        <div className="flex">
          {/* Main Content */}
          <main className="flex-1 min-w-0 px-4 md:px-8 py-8 space-y-8 pb-36 md:pb-28 overflow-x-hidden">
            <HeroGreetings userName={userName} progressEntries={progressEntries} />
            <QuickStats progressEntries={progressEntries} />
            <CurrentlyReading progressMap={progressMap} progressEntries={progressEntries} />
            <FocusTimer subjects={BASE_SUBJECTS} onSessionComplete={handleSessionComplete} />
            <SubjectIslands bonusMinutes={bonusMinutes} progressEntries={progressEntries} />
            <RecommendedBooks />
          </main>

          {/* Right Pulse Panel */}
          <aside className="hidden lg:block w-80 xl:w-88 flex-shrink-0 border-l border-border/40 px-6 py-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <ActivityPulse />
          </aside>
        </div>
      </div>

      <SearchMonolith />
    </div>
  );
}