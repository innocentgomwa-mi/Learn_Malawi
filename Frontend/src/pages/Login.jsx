import React, { useState, useEffect } from 'react';

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // If user came from a protected route, redirect them back
        if (from !== '/') {
          navigate(from, { replace: true });
        } else {
          navigate('/teacher', { replace: true });
        }
      } else {
        console.log('User is not admin/teacher, redirecting to homepage...');
        // Regular users go to homepage
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, from]);

  /**
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    console.log('Attempting login...');
    const result = await login(email, password);
    console.log('Login result:', result);
    
    if (result?.success) {
      console.log('Login successful, waiting for user state update...');
      // The useEffect above will handle the redirect based on user role
    }
  };

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
    
    // Clear API errors on user interaction
    if (apiError) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 py-16">
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
            <div className="rounded-[2rem] bg-primary text-primary-foreground p-10 shadow-2xl overflow-hidden">
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary-foreground mb-6">
                Learn Malawi Portal
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Access your Learn Malawi experience.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/85">
                Sign in with your Learn Malawi account to continue learning, track progress, or manage content depending on your role.
              </p>
              <div className="mt-10 rounded-[1.75rem] border border-primary-foreground/10 bg-primary-foreground/5 p-6">
                <p className="text-sm font-semibold text-primary-foreground">Account access</p>
                <p className="mt-2 text-sm text-primary-foreground/80">
                  Students and teachers may sign in here. Students will land on the main library, while teachers and admins will access management tools.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-lg">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Secure sign in</p>
                <h2 className="mt-4 text-3xl font-bold text-foreground">Sign in</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Use your Learn Malawi credentials to access your student dashboard or content management tools.
                </p>
              </div>

              {apiError && (
                <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">Login failed</p>
                      <p className="mt-1 text-rose-700/80">{apiError}</p>
                    </div>
                    <button onClick={clearError} className="text-rose-700 hover:text-rose-900 font-bold">
                      ×
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <label className="block text-sm font-medium text-foreground">
                  Email address
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="admin@learnmalawi.com"
                    disabled={loading}
                    required
                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Password
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                    className="mt-3 w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" id="remember" disabled={loading} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Signing in…' : 'Sign in to Learn Malawi'}
                </button>
              </form>

              <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground space-y-3">
                <p>
                  Need an account? <Link to="/register" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">Register now</Link>
                </p>
                <p>
                  <Link to="/" className="font-medium text-primary hover:text-primary/90 hover:underline hover:underline-offset-2">Return to free resources</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;