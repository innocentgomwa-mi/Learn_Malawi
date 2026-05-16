import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import AccountSettings from "@/components/settings/AccountSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import LearningPreferences from "@/components/settings/LearningPreferences";
import AccessibilitySettings from "@/components/settings/AccessibilitySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import ProgressData from "@/components/settings/ProgressData";
import PrivacySettings from "@/components/settings/PrivacySettings";
import DataUsageSettings from "@/components/settings/DataUsageSettings";
import GamificationSettings from "@/components/settings/GamificationSettings";
import SmartFeatures from "@/components/settings/SmartFeatures";

const SECTIONS = {
  account: AccountSettings,
  security: SecuritySettings,
  learning: LearningPreferences,
  accessibility: AccessibilitySettings,
  notifications: NotificationSettings,
  progress: ProgressData,
  privacy: PrivacySettings,
  data: DataUsageSettings,
  gamification: GamificationSettings,
  smart: SmartFeatures,
};

export default function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState(/** @type {keyof typeof SECTIONS} */ ("account"));

  const ActiveComponent = SECTIONS[activeSection];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <SettingsSidebar active={activeSection} onChange={(id) => setActiveSection(id)} />
          <div className="flex-1 min-w-0">
            <ActiveComponent user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}