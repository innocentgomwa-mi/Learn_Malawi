import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
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
  const codeLength = 6;
  const inputRefs = useRef(
    /** @type {Array<HTMLInputElement | null>} */ ([])
  );
  const codeDigits = Array.from({ length: codeLength }, (_, index) => code[index] || '');

  /**
   * @param {number} index
   */
  const focusInput = (index) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
    }
  };

  /**
   * @param {number} index
   * @param {string} value
   */
  const handleCodeChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '');
    const nextCode = code.split('');

    if (sanitized) {
      nextCode[index] = sanitized.slice(-1);
      const updated = nextCode.join('').slice(0, codeLength);
      setCode(updated);
      if (index < codeLength - 1) {
        focusInput(index + 1);
      }
    } else {
      nextCode[index] = '';
      setCode(nextCode.join(''));
    }
  };

  /**
   * @param {number} index
   * @param {React.KeyboardEvent<HTMLInputElement>} event
   */
  const handleCodeKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const nextCode = code.split('');
      if (nextCode[index]) {
        nextCode[index] = '';
        setCode(nextCode.join(''));
        return;
      }

      if (index > 0) {
        nextCode[index - 1] = '';
        setCode(nextCode.join(''));
        focusInput(index - 1);
      }
    }
  };

  /**
   * @param {React.ClipboardEvent<HTMLInputElement>} event
   */
  const handleCodePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength);
    if (!pasted) {
      return;
    }

    setCode(pasted);
    const nextIndex = Math.min(pasted.length, codeLength - 1);
    focusInput(nextIndex);
  };

  /**
   * @param {React.SyntheticEvent<HTMLFormElement|HTMLButtonElement>} event
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: "url('/images/forgot%20password.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/25" />
      <div className="relative w-full max-w-2xl">
        <div className="flex justify-center mb-[-2.5rem] relative z-10">
          <div
            className="h-24 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(180,180,255,0.45) 0%, rgba(130,100,220,0.55) 100%)',
              boxShadow: '0 0 32px 8px rgba(130,100,255,0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Lock className="h-10 w-10 text-white/90" strokeWidth={1.5} />
          </div>
        </div>

        <div
          className="rounded-3xl px-8 pt-14 pb-8"
          style={{
            background: 'rgba(100, 80, 180, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.3)',
          }}
        >
          {step === 'success' ? (
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">All set!</h1>
              <p className="text-white/70 text-sm leading-relaxed">
                Your password has been reset successfully. You can now log in using your new password.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #00e5cc, #00cfff)' }}
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-white mb-3">
                  {step === 'request' ? 'Forgot your password?' : 'Reset your password'}
                </h1>
                <p className="text-white/65 text-sm leading-relaxed">
                  {step === 'request'
                    ? 'Recover your account by requesting a verification code. Once your code is verified, you can choose a new password.'
                    : 'Enter the verification code sent to your email and choose a new password.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-400/30 px-4 py-3 text-sm text-rose-200 text-center">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-3 text-sm text-emerald-200 text-center">
                  {message}
                </div>
              )}

              {step === 'request' ? (
                <form onSubmit={handleRequest} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    required
                    disabled={loading}
                    className="w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(0,220,255,0.5)',
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(90deg, #00e5cc, #00cfff)' }}
                  >
                    {loading ? 'Sending code…' : 'Send recovery code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    required
                    disabled={loading}
                    className="w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(0,220,255,0.5)' }}
                  />
                  <div className="grid grid-cols-6 gap-3">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onChange={(event) => handleCodeChange(index, event.target.value)}
                        onKeyDown={(event) => handleCodeKeyDown(index, event)}
                        onPaste={handleCodePaste}
                        placeholder="-"
                        required
                        disabled={loading}
                        className="h-14 rounded-3xl border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    disabled={loading}
                    className="w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(0,220,255,0.5)' }}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                    className="w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(0,220,255,0.5)' }}
                  />
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: 'linear-gradient(90deg, #00e5cc, #00cfff)' }}
                    >
                      {loading ? 'Resetting password…' : 'Reset password'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRequest}
                      disabled={loading}
                      className="w-full rounded-full py-3.5 text-sm font-semibold text-white/80 transition hover:text-white disabled:opacity-60"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition underline underline-offset-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
