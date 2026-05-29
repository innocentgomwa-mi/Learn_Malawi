import React, { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsCard.jsx";
import { Input } from "@/components/ui/input";
import { SETTINGS_SAVE_BTN } from "./SettingsCard.jsx";
import { SETTINGS_INPUT_CLASS } from "@/lib/resourcePageStyles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "@/api";

/**
 * @param {{ user: any }} props
 */
export default function AccountSettings({ user }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!user) return;
    const nameParts = [user.firstName, user.lastName].filter(Boolean);
    const fallbackParts = user.full_name ? user.full_name.split(" ") : [];
    setFirstName(user.firstName || fallbackParts[0] || "");
    setLastName(user.lastName || fallbackParts.slice(1).join(" ") || "");
  }, [user]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.full_name || user?.email || "Student";
  const initials = displayName.split(" ").map((/** @type {string} */ n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleSave = async () => {
    try {
      await updateProfile({ firstName, lastName });
      await refreshUser();
    } catch (err) {
      console.error("Unable to save profile", err);
    }
  };

  return (
    <div>
      <SettingsSection title="Profile" description="Update your personal information">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-yellow-400 text-blue-950 text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <button type="button" className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-yellow-300 bg-yellow-400 shadow">
              <Camera className="h-3 w-3 text-blue-950" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-950">{user?.full_name || "Student"}</p>
            <p className="text-xs text-blue-900/60">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-800">First Name</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={SETTINGS_INPUT_CLASS.replace("mt-2 ", "")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-800">Last Name</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={SETTINGS_INPUT_CLASS.replace("mt-2 ", "")} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-blue-800">Email Address</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
            <p className="mt-1 text-xs text-blue-900/60">Email cannot be changed here. Use Profile for full edits.</p>
          </div>
        </div>

        <button type="button" onClick={handleSave} className={`${SETTINGS_SAVE_BTN} mt-2`}>Save Changes</button>
      </SettingsSection>
    </div>
  );
}