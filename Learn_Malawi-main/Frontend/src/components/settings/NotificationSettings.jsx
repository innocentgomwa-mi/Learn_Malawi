import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function NotificationSettings() {
  const [prefs, setPrefs] = useLocalStorageState("learnmalawi_notifications_prefs", {
    studyReminders: true,
    quizAlerts: true,
    assignments: false,
    emailNotifs: true,
    inAppNotifs: true,
  });

  /** @param {'studyReminders'|'quizAlerts'|'assignments'|'emailNotifs'|'inAppNotifs'} key */
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      <SettingsSection title="Study Notifications">
        <SettingsRow label="Study Reminders" description="Get reminded about your study schedule">
          <Switch checked={prefs.studyReminders} onCheckedChange={() => toggle("studyReminders")} />
        </SettingsRow>
        <SettingsRow label="Quiz Alerts" description="Notifications about new quizzes and results">
          <Switch checked={prefs.quizAlerts} onCheckedChange={() => toggle("quizAlerts")} />
        </SettingsRow>
        <SettingsRow label="Assignment Notifications" description="Updates on assignments and deadlines">
          <Switch checked={prefs.assignments} onCheckedChange={() => toggle("assignments")} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Delivery Method">
        <SettingsRow label="Email Notifications" description="Receive notifications via email">
          <Switch checked={prefs.emailNotifs} onCheckedChange={() => toggle("emailNotifs")} />
        </SettingsRow>
        <SettingsRow label="In-App Notifications" description="Show notifications inside the app">
          <Switch checked={prefs.inAppNotifs} onCheckedChange={() => toggle("inAppNotifs")} />
        </SettingsRow>
      </SettingsSection>

      <Button>Save Preferences</Button>
    </div>
  );
}