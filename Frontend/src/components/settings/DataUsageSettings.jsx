import React from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function DataUsageSettings() {
  const [prefs, setPrefs] = useLocalStorageState("learnmalawi_data_usage_prefs", {
    lowData: false,
    disableAudio: false,
    wifiOnly: true,
  });
  /** @param {'lowData'|'disableAudio'|'wifiOnly'} key */
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

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

      <Button>Save Settings</Button>
    </div>
  );
}