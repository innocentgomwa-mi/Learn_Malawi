import React, { useState, useEffect } from 'react';

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pageToast, setPageToast] = useState('');
  const toastTimerRef = /** @type {{ current: number | null }} */ (React.useRef(null));
  const { user, login, loading, error: apiError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect location from state (if coming from protected route)
  const from = location.state?.from?.pathname || '/';

  // Debug: Log user data when it changes
  useEffect(() => {
    console.log('User state changed:', user);
    console.log('User role:', user?.role);
    console.log('User stringified:', JSON.stringify(user, null, 2));
    
    if (user) {
      const userRole = user?.role?.toLowerCase();
      console.log('User role (lowercase):', userRole);
      
      if (userRole === 'admin' || userRole === 'teacher') {
        console.log('Redirecting to teachers dashboard...');
        const target = from !== '/' ? from : '/teacher';
        navigate(target);
      } else {
        console.log('User is not admin/teacher, redirecting to homepage...');
        navigate('/');
      }
    }
  }, [user, navigate, from]);

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setPageToast('Please enter both email and password.');
      return;
    }
    
    console.log('Attempting login...');
    const result = await login(email, password);
    console.log('Login result:', result);

    if (result?.success) {
      console.log('Login successful, waiting for user state update...');
      setPageToast('');
    } else {
      if (result?.type === '2fa_required') {
        navigate('/two-factor-verify', {
          state: {
            challengeId: result?.challengeId || '',
            email: email.trim(),
            from,
          },
        });
        return;
      }
      setPageToast(result?.message || 'Wrong email or password. Please try again.');
    }
  };

  useEffect(() => {
    if (!pageToast) {
      return undefined;
    }

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setPageToast('');
      toastTimerRef.current = null;
    }, 5000);

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [pageToast]);

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    
    // Clear API errors and page toast on user interaction
    if (apiError) {
      clearError();
    }
    if (pageToast) {
      setPageToast('');
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
            <h1 className="text-2xl font-bold text-white mb-3">Welcome back</h1>
            <p className="text-white/65 text-sm leading-relaxed">
              Sign in to continue using Learn Malawi. Access your lessons, progress tracker, and admin tools from one place.
            </p>
          </div>

          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-slate-950/10 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
              <p className="mt-4 text-sm font-semibold text-white">Signing you in…</p>
            </div>
          )}

          {pageToast && (
            <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
              <div className="flex items-start justify-between gap-3">
                <div className="text-left w-full">
                  <p className="font-semibold">Wrong input</p>
                  <p className="mt-1 text-sm text-rose-100/95">{pageToast}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPageToast('')}
                  className="text-rose-100 hover:text-white transition"
                  aria-label="Dismiss error message"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {apiError && !pageToast && (
            <div className="mb-6 rounded-2xl bg-rose-500/20 border border-rose-400/30 px-4 py-3 text-sm text-rose-200 text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Your email address"
              disabled={loading}
              required
              className="w-full rounded-full px-5 py-3.5 text-sm text-white placeholder-white/50 outline-none transition"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(250,204,21,0.55)',
                backdropFilter: 'blur(8px)',
              }}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
                className="w-full rounded-full px-5 py-3.5 pr-12 text-sm text-white placeholder-white/50 outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(250,204,21,0.55)',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-yellow-300 hover:text-yellow-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" id="remember" disabled={loading} className="h-4 w-4 rounded border-white/20 bg-slate-950/20 text-yellow-400 focus:ring-yellow-300" />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-white/80 hover:text-white hover:underline hover:underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3.5 text-sm font-bold text-slate-900 transition hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b)' }}
            >
              {loading ? 'Signing in…' : 'Sign in to Learn Malawi'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70 space-y-3">
            <p>
              Need an account?{' '}
              <Link to="/onboarding" className="font-semibold text-white hover:text-white/90 hover:underline hover:underline-offset-2">
                Register now
              </Link>
            </p>
            <p>
              <Link to="/" className="font-semibold text-white hover:text-white/90 hover:underline hover:underline-offset-2">
                Return to free resources
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;