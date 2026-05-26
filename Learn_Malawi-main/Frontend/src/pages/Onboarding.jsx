import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ school: user?.school || "", level: user?.level || "" });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (updateProfile) await updateProfile(form);
      navigate("/");
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border rounded-xl p-8 bg-card shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Tell us a bit about yourself</p>
        <form onSubmit={handle} className="flex flex-col gap-4">
          <div className="grid gap-1">
            <Label>School</Label>
            <Input value={form.school} onChange={e => setForm(f => ({ ...f, school: e.target.value }))} placeholder="Your school name" />
          </div>
          <div className="grid gap-1">
            <Label>Level</Label>
            <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PSLC">PSLC</SelectItem>
                <SelectItem value="JCE">JCE</SelectItem>
                <SelectItem value="MSCE">MSCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Continue"}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/")}>Skip for now</Button>
        </form>
      </div>
    </div>
  );
}
