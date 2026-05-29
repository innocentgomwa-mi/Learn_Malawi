import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { authRegister, authVerifyEmail, authResendVerification } from '@/api';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('PSLC');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = location.state?.role === 'Teacher' ? 'Teacher' : 'Student';
  const roleLocked = location.state?.role === 'Teacher' || location.state?.role === 'Student';
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
  const codeLength = 6;
  const inputRefs = useRef(/** @type {Array<HTMLInputElement | null>} */ ([]));
  const codeDigits = Array.from({ length: codeLength }, (_, index) => verificationCode[index] || '');

  /** @param {number} index */
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
    const nextCode = verificationCode.split('');

    if (sanitized) {
      nextCode[index] = sanitized.slice(-1);
      const updated = nextCode.join('').slice(0, codeLength);
      setVerificationCode(updated);
      if (index < codeLength - 1) {
        focusInput(index + 1);
      }
    } else {
      nextCode[index] = '';
      setVerificationCode(nextCode.join(''));
    }
  };

  /**
   * @param {number} index
   * @param {React.KeyboardEvent<HTMLInputElement>} event
   */
  const handleCodeKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const nextCode = verificationCode.split('');
      if (nextCode[index]) {
        nextCode[index] = '';
        setVerificationCode(nextCode.join(''));
        return;
      }

      if (index > 0) {
        nextCode[index - 1] = '';
        setVerificationCode(nextCode.join(''));
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

    setVerificationCode(pasted);
    const nextIndex = Math.min(pasted.length, codeLength - 1);
    focusInput(nextIndex);
  };

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
      const rawMessage = registrationError instanceof Error
        ? registrationError.message
        : String(registrationError);
      const cleanMessage = rawMessage.replace(/^API request failed \(\d+\):\s*/i, '');
      setError(cleanMessage || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
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
        navigate('/welcome', { replace: true });
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm"
        style={{ backgroundImage: "url('/images/forgot%20password.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/25" />

      <div className="relative w-full max-w-lg">
        <div className="flex justify-center mb-[-2.5rem] relative z-10">
          <div
            className="h-24 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.72) 0%, rgba(245,158,11,0.62) 100%)',
              boxShadow: '0 0 32px 8px rgba(250,204,21,0.35), inset 0 1px 1px rgba(255,255,255,0.28)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(30,58,138,0.35)',
            }}
          >
            <Lock className="h-10 w-10 text-blue-950/90" strokeWidth={1.5} />
          </div>
        </div>

        <div
          className="rounded-3xl px-8 pt-14 pb-8"
          style={{
            background: 'rgba(15, 23, 42, 0.42)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(250,204,21,0.32)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.3)',
          }}
        >
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-white mb-3">Register a {roleLabel} account</h1>
            <p className="text-white/65 text-sm leading-relaxed">
              Complete the form below to create your Learn Malawi account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-400/30 px-4 py-3 text-sm text-rose-200 text-center">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 px-4 py-3 text-sm text-yellow-200 text-center">
              {infoMessage}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-white">
                  First name
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    className="mt-3 w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                  />
                </label>
                <label className="block text-sm font-medium text-white">
                  Last name
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    className="mt-3 w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-white">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-3 w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                />
              </label>

              <label className="block text-sm font-medium text-white">
                Password
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-3 w-full rounded-full px-5 py-3.5 pr-12 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-yellow-300 hover:text-yellow-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-medium text-white">
                Confirm password
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="mt-3 w-full rounded-full px-5 py-3.5 pr-12 text-sm text-white placeholder-white/50 outline-none transition"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-yellow-300 hover:text-yellow-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-medium text-white">
                School
                <input
                  type="text"
                  value={school}
                  onChange={(event) => setSchool(event.target.value)}
                  required
                  className="mt-3 w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(250,204,21,0.55)' }}
                />
              </label>
              <label className="block text-sm font-medium text-white">
                Level
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  required
                  className="mt-3 w-full rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-sm text-black outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <option value="PSLC">PSLC</option>
                  <option value="JCE">JCE</option>
                  <option value="MSCE">MSCE</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-white">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  disabled={roleLocked}
                  className="mt-3 w-full rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-sm text-black outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                </select>
                {roleLocked && (
                  <p className="mt-2 text-xs text-yellow-200/90">
                    Role selected on onboarding and locked for this registration.
                  </p>
                )}
              </label>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <label className="flex items-start gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-slate-950/20 text-yellow-400 focus:ring-yellow-300"
                  />
                  <span className="leading-5">
                    I agree to the <Link to="/terms-and-conditions" className="font-semibold text-yellow-300 hover:text-yellow-200 hover:underline">Terms & Conditions</Link> and understand that this account is for personal educational use only.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b)' }}
              >
                {loading ? 'Creating account…' : 'Register account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <p className="text-sm text-white/70">
                Enter the 6-digit verification code sent to <strong>{registeredEmail || email}</strong>.
              </p>
              <p className="text-sm text-white/60">
                Code expires in <strong>{timeLeft}</strong> second{timeLeft === 1 ? '' : 's'}.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Verification code</label>
                <div className="grid grid-cols-6 gap-3">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      onKeyDown={(event) => handleCodeKeyDown(index, event)}
                      onPaste={handleCodePaste}
                      placeholder="-"
                      required
                      disabled={loading}
                      className="h-14 rounded-3xl border border-white/20 bg-white/10 text-center text-sm font-semibold text-white outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b)' }}
              >
                {loading ? 'Verifying…' : 'Verify email'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-white/80 transition hover:text-white disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                Resend verification code
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-white/70 space-y-2">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white hover:text-white/90 hover:underline hover:underline-offset-2">
                Sign in instead
              </Link>
            </p>
            <p>
              Forgot your password?{' '}
              <Link to="/forgot-password" className="font-semibold text-white hover:text-white/90 hover:underline hover:underline-offset-2">
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
