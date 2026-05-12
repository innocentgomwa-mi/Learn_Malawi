import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function GamificationSettings() {
  const [prefs, setPrefs] = useLocalStorageState("learnmalawi_gamification_prefs", {
    leaderboard: true,
    badges: true,
    streakReminders: true,
  });
  /** @param {'leaderboard'|'badges'|'streakReminders'} key */
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <SettingsSection title="Gamification" description="Control your competitive and achievement features">
        <SettingsRow label="Show Leaderboard" description="See how you rank against other students">
          <Switch checked={prefs.leaderboard} onCheckedChange={() => toggle("leaderboard")} />
        </SettingsRow>
        <SettingsRow label="Badges Visibility" description="Display your earned badges on your profile">
          <Switch checked={prefs.badges} onCheckedChange={() => toggle("badges")} />
        </SettingsRow>
        <SettingsRow label="Study Streak Reminders" description="Get notified to maintain your daily streak">
          <Switch checked={prefs.streakReminders} onCheckedChange={() => toggle("streakReminders")} />
        </SettingsRow>
      </SettingsSection>

      <Button>Save Settings</Button>
    </div>
  );
}