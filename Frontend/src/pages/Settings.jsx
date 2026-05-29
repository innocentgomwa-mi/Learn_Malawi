import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import ResourcePageHero from "@/components/ResourcePageHero";
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
import { PAGE_WRAP } from "@/lib/resourcePageStyles";
import { Settings as SettingsIcon } from "lucide-react";

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
  const [activeSection, setActiveSection] = useState("account");
  const ActiveComponent = SECTIONS[activeSection];

  return (
    <div className={PAGE_WRAP}>
      <ResourcePageHero
        icon={SettingsIcon}
        title="Settings"
        subtitle="Manage your account, learning preferences, notifications, privacy, and accessibility options."
      />

      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsSidebar active={activeSection} onChange={setActiveSection} />
        <div className="min-w-0 flex-1">
          <ActiveComponent user={user} />
        </div>
      </div>
    </div>
  );
}
