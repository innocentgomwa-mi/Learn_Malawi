import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { SETTINGS_SAVE_BTN } from "./SettingsCard.jsx";
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
      <SettingsSection title="Study & schedule" description="Works with My Schedule — exams and study blocks appear in-app and can trigger emails when enabled below.">
        <SettingsRow label="Study Reminders" description="Show study blocks and exams on your Notifications page">
          <Switch checked={prefs.studyReminders} onCheckedChange={() => toggle("studyReminders")} />
        </SettingsRow>
        <p className="text-xs text-blue-900/60">
          <Link to="/my-schedule" className="font-semibold text-blue-700 hover:underline">My Schedule</Link>
          {" "}sends confirmation and exam reminder emails based on your notify-day settings.
        </p>
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

      <button type="button" className={SETTINGS_SAVE_BTN}>Save Preferences</button>
    </div>
  );
}