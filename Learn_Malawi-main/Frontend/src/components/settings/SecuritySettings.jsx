import React, { useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { authLogoutAll, changePassword } from "@/api";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useLocalStorageState("learnmalawi_security_two_factor", false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const { logout } = useAuth();

  const handleLogoutAll = async () => {
    try {
      await authLogoutAll();
    } catch {
      // ignore any errors while invalidating server sessions
    }
    await logout();
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      setDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div>
      <SettingsSection title="Password" description="Manage your login credentials">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
            Change Password
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Update your password to keep your account secure.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleChangePassword} disabled={isChanging}>
                {isChanging ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SettingsSection>

      <SettingsSection title="Two-Factor Authentication" description="Add an extra layer of security">
        <SettingsRow label="Enable 2FA" description="Require a code when signing in">
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Sessions" description="Manage active logins">
        <SettingsRow label="Active Sessions" description="You are currently logged in on 1 device">
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleLogoutAll}>
            <LogOut className="h-3.5 w-3.5" /> Logout All Devices
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}