import React, { useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { deleteAccount } from "@/api";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function PrivacySettings() {
  const [visibility, setVisibility] = useLocalStorageState("learnmalawi_privacy_visibility", "public");
  const [dataTracking, setDataTracking] = useLocalStorageState("learnmalawi_privacy_data_tracking", true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      window.location.assign("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <SettingsSection title="Profile Privacy">
        <SettingsRow label="Profile Visibility" description="Control who can see your profile">
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow label="Data Tracking" description="Allow us to improve your experience using anonymised data">
          <Switch checked={dataTracking} onCheckedChange={setDataTracking} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Account" description="Danger zone">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-medium text-destructive mb-1">Delete Account</p>
          <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-3.5 w-3.5" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent. Your account and all associated data will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SettingsSection>
    </div>
  );
}