import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authForgotPassword, authResetPassword } from '@/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleRequest = async (event) => {
    event?.preventDefault?.();
    if (!email) {
      setError('Please enter the email address for the account you want to recover.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authForgotPassword({ email });
      setMessage('If this email is registered, a verification code has been sent. Check your inbox.');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleReset = async (event) => {
    event?.preventDefault?.();
    setError('');
    setMessage('');

    if (!email || !code || !password || !confirmPassword) {
      setError('Please fill in all fields to reset your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      await authResetPassword({ email, code, newPassword: password });
      setMessage('Your password has been reset successfully. You can now sign in with your new password.');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-lg">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Password recovery</p>
            <h1 className="mt-4 text-3xl font-bold text-foreground">Forgot your password?</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Recover your account by requesting a verification code. Once your code is verified, you can choose a new password.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="space-y-6">
              <label className="block text-sm font-medium text-foreground">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Sending code…' : 'Send recovery code'}
              </button>
            </form>
          ) : step === 'reset' ? (
            <form onSubmit={handleReset} className="space-y-6">
              <label className="block text-sm font-medium text-foreground">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Verification code
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a new password"
                  required
                  disabled={loading}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the new password"
                  required
                  disabled={loading}
                  className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Resetting password…' : 'Reset password'}
                </button>
                <button
                  type="button"
                  onClick={handleRequest}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-3xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Resend code
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Password updated</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">All set!</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Your password has been reset successfully. You can now log in using your new password.
                </p>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Go to sign in
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Back to <Link to="/login" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
