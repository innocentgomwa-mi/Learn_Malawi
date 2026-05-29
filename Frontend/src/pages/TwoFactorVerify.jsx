import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const CHALLENGE_KEY = "learnmalawi_2fa_challenge";
const EMAIL_KEY = "learnmalawi_2fa_email";
const FROM_KEY = "learnmalawi_2fa_from";

export default function TwoFactorVerify() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyTwoFactor, loading, user } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const stateChallengeId = location.state?.challengeId || "";
  const stateEmail = location.state?.email || "";
  const stateFrom = location.state?.from || "/";

  const challengeId = stateChallengeId || window.sessionStorage.getItem(CHALLENGE_KEY) || "";
  const email = stateEmail || window.sessionStorage.getItem(EMAIL_KEY) || "";
  const from = stateFrom || window.sessionStorage.getItem(FROM_KEY) || "/";

  useEffect(() => {
    if (stateChallengeId) window.sessionStorage.setItem(CHALLENGE_KEY, stateChallengeId);
    if (stateEmail) window.sessionStorage.setItem(EMAIL_KEY, stateEmail);
    if (stateFrom) window.sessionStorage.setItem(FROM_KEY, stateFrom);
  }, [stateChallengeId, stateEmail, stateFrom]);

  useEffect(() => {
    if (!user) return;
    const role = String(user?.role || "").toLowerCase();
    if (role === "admin" || role === "teacher") {
      navigate(from !== "/" ? from : "/teacher", { replace: true });
    } else {
      navigate(from || "/", { replace: true });
    }
  }, [user, navigate, from]);

  const clearChallenge = () => {
    window.sessionStorage.removeItem(CHALLENGE_KEY);
    window.sessionStorage.removeItem(EMAIL_KEY);
    window.sessionStorage.removeItem(FROM_KEY);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!challengeId) {
      setError("Missing verification challenge. Please sign in again.");
      return;
    }
    if (!code.trim()) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    const result = await verifyTwoFactor(challengeId, code.trim());
    if (!result?.success) {
      setError(result?.message || "Invalid security code.");
      return;
    }
    clearChallenge();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e3a8a 45%, #2563eb 100%)" }}>
      <div className="w-full max-w-md rounded-3xl border border-yellow-300/40 bg-white/95 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-blue-950 text-center">Two-Factor Verification</h1>
        <p className="mt-2 text-sm text-blue-900/70 text-center">
          Enter the 6-digit security code sent to <span className="font-semibold">{email || "your email"}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 focus:outline-none focus:border-yellow-400"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-bold text-blue-950 hover:bg-yellow-300 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Confirm login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            onClick={clearChallenge}
            className="text-sm font-semibold text-blue-900 hover:text-blue-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

