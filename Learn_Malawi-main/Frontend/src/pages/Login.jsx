import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border rounded-xl p-8 bg-card shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">Welcome back to Learn Malawi</p>
        <form onSubmit={handle} className="flex flex-col gap-4">
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="grid gap-1">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
