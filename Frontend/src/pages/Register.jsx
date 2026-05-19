import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { authRegister, authVerifyEmail, authResendVerification } from '@/api';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('PSLC');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = location.state?.role === 'Teacher' ? 'Teacher' : 'Student';
  const [role, setRole] = useState(defaultRole);
  const roleLabel = role === 'Student' ? 'student' : 'teacher';
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!firstName || !lastName || !email || !password || !confirmPassword || !school || !level) {
      setError('Please complete all required fields.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms and conditions to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please double-check and try again.');
      return;
    }

    setLoading(true);
    try {
      const normalizedRole = role.trim().charAt(0).toUpperCase() + role.trim().slice(1).toLowerCase();
      await authRegister({ firstName, lastName, email, password, role: normalizedRole, school, level, agreeTerms });
      setRegisteredEmail(email);
      setPendingPassword(password);
      setTimeLeft(60);
      setInfoMessage('A verification code was sent to your email. Enter it below to complete registration.');
      setStep('verify');
    } catch (registrationError) {
      const message = registrationError instanceof Error
        ? registrationError.message
        : String(registrationError);
      setError(message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setInfoMessage('');

    if (!verificationCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await authVerifyEmail({ email: registeredEmail || email, code: verificationCode });
      const loginResult = await login(registeredEmail || email, pendingPassword);
      if (loginResult.success) {
        navigate(role === 'Student' ? '/' : '/teacher', { replace: true });
      } else {
        setError(loginResult.message || 'Email verified, but login failed. Please sign in with your credentials.');
      }
    } catch (verificationError) {
      const message = verificationError instanceof Error
        ? verificationError.message
        : String(verificationError);
      setError(message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step !== 'verify') {
      return undefined;
    }

    if (timeLeft <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const handleResendCode = async () => {
    setError(null);
    setInfoMessage('');
    setLoading(true);

    try {
      await authResendVerification({ email: registeredEmail || email });
      setTimeLeft(60);
      setInfoMessage('A new verification code has been sent to your email.');
    } catch (resendError) {
      const message = resendError instanceof Error
        ? resendError.message
        : String(resendError);
      setError(message || 'Unable to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-lg">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Create {roleLabel} access</p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">Register a {roleLabel} account</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Complete the form below to set up a new account for the selected role.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {infoMessage}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  First name
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Last name
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-foreground">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                School
                <input
                  type="text"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Level
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="PSLC">PSLC</option>
                  <option value="JCE">JCE</option>
                  <option value="MSCE">MSCE</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
              </label>

              <div className="flex items-start rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm leading-5 text-slate-700">
                    I agree to the <Link to="/terms-and-conditions" className="font-semibold text-slate-900 hover:underline">Terms & Conditions</Link> and understand that this account is for personal educational use only.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account…' : 'Register account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <p className="text-sm text-slate-600">
                Enter the 6-digit verification code sent to <strong>{registeredEmail || email}</strong>.
              </p>
              <p className="text-sm text-slate-500">
                Code expires in <strong>{timeLeft}</strong> second{timeLeft === 1 ? '' : 's'}.
              </p>

              <label className="block text-sm font-medium text-foreground">
                Verification code
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  maxLength={6}
                  required
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Verifying…' : 'Verify email'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Resend verification code
              </button>
            </form>
          )}

          <div className="mt-8 text-sm text-muted-foreground space-y-2">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">
                Sign in instead
              </Link>
            </p>
            <p>
              Forgot your password?{' '}
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">
                Reset it here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
