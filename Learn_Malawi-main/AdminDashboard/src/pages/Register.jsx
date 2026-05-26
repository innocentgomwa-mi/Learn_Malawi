import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "Teacher", secretKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border rounded-xl p-8 bg-card shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Join Learn Malawi</p>
        <form onSubmit={handle} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>First name</Label>
              <Input value={form.firstName} onChange={e => set("firstName", e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <Label>Last name</Label>
              <Input value={form.lastName} onChange={e => set("lastName", e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.role === "Admin" && (
            <div className="grid gap-1">
              <Label>Admin secret key</Label>
              <Input type="password" value={form.secretKey} onChange={e => set("secretKey", e.target.value)} />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
