import React, { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsCard.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
              <Camera className="h-3 w-3 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name || "Student"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
          </div>
        </div>

        <Button onClick={handleSave} className="mt-2">Save Changes</Button>
      </SettingsSection>
    </div>
  );
}