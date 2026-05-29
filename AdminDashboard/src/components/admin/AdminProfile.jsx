import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function AdminProfile() {
  const { user, checkUserAuth } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("enable");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  const displayName = useMemo(() => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    return name || user?.full_name || user?.email || "Admin";
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setProfileImagePreview(user.profileImageUrl || "");
    setProfileImageFile(null);
  }, [user]);

  useEffect(() => {
    if (!profileImageFile) return;
    const url = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      if (profileImageFile) formData.append("profileImage", profileImageFile);
      await apiClient.auth.updateProfile(formData);
      await checkUserAuth();
      setProfileImageFile(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await apiClient.auth.changePassword(currentPassword, newPassword);
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error?.message || "Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const startTwoFactorFlow = async (nextEnabled) => {
    setTwoFactorError("");
    setTwoFactorCode("");
    setTwoFactorMode(nextEnabled ? "enable" : "disable");
    setTwoFactorSaving(true);
    try {
      if (nextEnabled) {
        await apiClient.auth.requestEnableTwoFactor();
      } else {
        await apiClient.auth.requestDisableTwoFactor();
      }
      setTwoFactorDialogOpen(true);
    } catch (error) {
      setTwoFactorError(error?.message || "Unable to start 2FA flow.");
    } finally {
      setTwoFactorSaving(false);
    }
  };

  const confirmTwoFactorFlow = async () => {
    setTwoFactorError("");
    if (!twoFactorCode.trim()) return;
    setTwoFactorSaving(true);
    try {
      if (twoFactorMode === "enable") {
        await apiClient.auth.confirmEnableTwoFactor(twoFactorCode.trim());
      } else {
        await apiClient.auth.confirmDisableTwoFactor(twoFactorCode.trim());
      }
      setTwoFactorDialogOpen(false);
      setTwoFactorCode("");
      await checkUserAuth();
    } catch (error) {
      setTwoFactorError(error?.message || "Invalid code.");
    } finally {
      setTwoFactorSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Update your admin account details, password, and 2FA.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-slate-200">
              {profileImagePreview ? (
                <AvatarImage src={profileImagePreview} alt="" />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {String(displayName || "?").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Profile picture</Label>
              <Input type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
            </Button>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">{user?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
            <p className="text-xs text-slate-500">When enabled, a security code is required on sign-in.</p>
            {twoFactorError ? <p className="mt-2 text-sm text-red-600">{twoFactorError}</p> : null}
          </div>
          <Button
            variant={user?.twoFactorEnabled ? "outline" : "default"}
            className={user?.twoFactorEnabled ? "" : "bg-blue-700 hover:bg-blue-800"}
            disabled={twoFactorSaving}
            onClick={() => startTwoFactorFlow(!user?.twoFactorEnabled)}
          >
            {user?.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Update your password for better security.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Current password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm new password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={passwordSaving}>Cancel</Button>
            </DialogClose>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={handleChangePassword} disabled={passwordSaving}>
              {passwordSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{twoFactorMode === "enable" ? "Enable 2FA" : "Disable 2FA"}</DialogTitle>
            <DialogDescription>Enter the 6-digit code sent to your email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Security code</Label>
            <Input
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
            />
            {twoFactorError ? <p className="text-sm text-red-600">{twoFactorError}</p> : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={twoFactorSaving}>Cancel</Button>
            </DialogClose>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={confirmTwoFactorFlow} disabled={twoFactorSaving || !twoFactorCode.trim()}>
              {twoFactorSaving ? "Verifying…" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

