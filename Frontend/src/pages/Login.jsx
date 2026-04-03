import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

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
        console.log('Redirecting to admin dashboard...');
        // If user came from a protected route, redirect them back
        if (from !== '/') {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        console.log('User is not admin/teacher, redirecting to homepage...');
        // Regular users go to homepage
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, from]);

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
    <>
      <Helmet>
        <title>Admin Login - Learn Malawi</title>
        <meta name="description" content="Login to the admin dashboard to manage and update educational resources on Learn Malawi." />
      </Helmet>
      
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>Admin Portal Login</h1>
            <p className="page-description">
              Sign in to access the content management dashboard. 
              <strong> This login is only for administrators and content managers.</strong>
            </p>
          </div>

          <div className="login-card">
            <div className="info-note">
              <strong>Note for Students:</strong> All learning materials are freely available on the homepage. No login required!
            </div>

            {apiError && (
              <div className="api-error-message">
                <span className="error-icon">!</span>
                <span className="error-text">{apiError}</span>
                <button onClick={clearError} className="error-close">
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="admin@learnmalawi.com"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" disabled={loading} />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="auth-links">
              <div className="register-link">
                Need an admin account? <Link to="/register">Request Access</Link>
              </div>
              <div className="back-link">
                <Link to="/">
                  ← Return to free resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;