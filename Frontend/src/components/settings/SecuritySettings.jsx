import React, { useState } from "react";
import { SettingsSection, SettingsRow } from "./SettingsCard.jsx";
import { Button } from "@/components/ui/button";
import { SETTINGS_SAVE_BTN, SETTINGS_OUTLINE_BTN } from "./SettingsCard.jsx";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { authConfirmDisableTwoFactor, authConfirmEnableTwoFactor, authLogoutAll, authRequestDisableTwoFactor, authRequestEnableTwoFactor, changePassword } from "@/api";

export default function SecuritySettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState(/** @type {'enable' | 'disable'} */ ('enable'));
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const { logout, user, refreshUser } = useAuth();

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
          <button type="button" className={`${SETTINGS_OUTLINE_BTN} w-full sm:w-auto`} onClick={() => setDialogOpen(true)}>
            Change Password
          </button>

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
              <button type="button" className={SETTINGS_SAVE_BTN} onClick={handleChangePassword} disabled={isChanging}>
                {isChanging ? "Saving..." : "Save Password"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SettingsSection>

      <SettingsSection title="Two-Factor Authentication" description="Add an extra layer of security">
        <SettingsRow label="Enable 2FA" description="Require a code when signing in">
          <Switch
            checked={Boolean(user?.twoFactorEnabled)}
            onCheckedChange={async (checked) => {
              setTwoFactorError('');
              setTwoFactorCode('');
              setTwoFactorLoading(true);
              try {
                if (checked) {
                  setTwoFactorMode('enable');
                  await authRequestEnableTwoFactor();
                } else {
                  setTwoFactorMode('disable');
                  await authRequestDisableTwoFactor();
                }
                setTwoFactorDialogOpen(true);
              } catch (err) {
                setTwoFactorError(err?.message || 'Unable to start 2FA setup.');
              } finally {
                setTwoFactorLoading(false);
              }
            }}
            disabled={twoFactorLoading}
          />
        </SettingsRow>
        {twoFactorError ? <p className="mt-2 text-sm text-red-600">{twoFactorError}</p> : null}
      </SettingsSection>

      <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{twoFactorMode === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your email to {twoFactorMode === 'enable' ? 'enable' : 'disable'} two-factor authentication.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Security code</label>
            <Input
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            {twoFactorError ? <p className="text-sm text-red-600">{twoFactorError}</p> : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={twoFactorLoading}>Cancel</Button>
            </DialogClose>
            <button
              type="button"
              className={SETTINGS_SAVE_BTN}
              disabled={twoFactorLoading || !twoFactorCode.trim()}
              onClick={async () => {
                setTwoFactorLoading(true);
                setTwoFactorError('');
                try {
                  if (twoFactorMode === 'enable') {
                    await authConfirmEnableTwoFactor(twoFactorCode.trim());
                  } else {
                    await authConfirmDisableTwoFactor(twoFactorCode.trim());
                  }
                  setTwoFactorDialogOpen(false);
                  setTwoFactorCode('');
                  await refreshUser();
                } catch (err) {
                  setTwoFactorError(err?.message || 'Invalid code.');
                } finally {
                  setTwoFactorLoading(false);
                }
              }}
            >
              {twoFactorLoading ? 'Saving…' : 'Confirm'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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