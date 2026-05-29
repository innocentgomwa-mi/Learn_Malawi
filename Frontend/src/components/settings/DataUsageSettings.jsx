import React, { useEffect, useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { SETTINGS_SAVE_BTN } from "./SettingsCard.jsx";
import { updateProfile } from "@/api";
import { useAuth } from "@/lib/AuthContext";

export default function DataUsageSettings() {
  const { user, refreshUser } = useAuth();
  const [prefs, setPrefs] = useState({
    lowData: false,
    disableAudio: false,
    wifiOnly: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const next = user.dataUsagePrefs || {};
    setPrefs({
      lowData: Boolean(next.lowData),
      disableAudio: Boolean(next.disableAudio),
      wifiOnly: next.wifiOnly === undefined ? true : Boolean(next.wifiOnly),
    });
  }, [user]);
  /** @param {'lowData'|'disableAudio'|'wifiOnly'} key */
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ dataUsagePrefs: prefs });
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SettingsSection title="Data Usage" description="Control how the app uses your mobile data">
        <SettingsRow label="Low Data Mode" description="Reduce image quality and disable previews to save data">
          <Switch checked={prefs.lowData} onCheckedChange={() => toggle("lowData")} />
        </SettingsRow>
        <SettingsRow label="Disable Auto Audio" description="Prevent audio from playing automatically">
          <Switch checked={prefs.disableAudio} onCheckedChange={() => toggle("disableAudio")} />
        </SettingsRow>
        <SettingsRow label="Wi-Fi Only Downloads" description="Only download content when connected to Wi-Fi">
          <Switch checked={prefs.wifiOnly} onCheckedChange={() => toggle("wifiOnly")} />
        </SettingsRow>
      </SettingsSection>

      <button type="button" className={SETTINGS_SAVE_BTN} onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}