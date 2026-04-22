/**
 * @typedef {{
 *   id?: string,
 *   email?: string,
 *   firstName?: string,
 *   lastName?: string,
 *   full_name?: string,
 *   school?: string,
 *   role?: string,
 * }} User
 *
 * @typedef {{
 *   success: boolean,
 *   message?: string,
 * }} LoginResult
 *
 * @typedef {{
 *   user: User | null,
 *   isAuthenticated: boolean,
 *   isLoadingAuth: boolean,
 *   isLoadingPublicSettings: boolean,
 *   loading: boolean,
 *   error: string | null,
 *   appPublicSettings: any,
 *   login: (email: string, password: string) => Promise<LoginResult>,
 *   logout: () => Promise<void>,
 *   navigateToLogin: () => void,
 *   refreshUser: () => Promise<void>,
 *   checkAppState: () => Promise<void>,
 *   clearError: () => void,
 * }} AuthContextValue
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authLogin, authLogout, fetchProfile } from '@/api';

/** @type {import('react').Context<AuthContextValue | null>} */
const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));

const ACCESS_TOKEN_KEY = 'learnmalawi_access_token';
const REFRESH_TOKEN_KEY = 'learnmalawi_refresh_token';

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * @param {string} accessToken
 * @param {string} refreshToken
 */
function saveAuthTokens(accessToken, refreshToken) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthProvider(props) {
  const children = props.children;
  const [user, setUser] = useState(/** @type {User | null} */ (null));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [appPublicSettings, setAppPublicSettings] = useState(/** @type {any} */ (null));

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setIsLoadingAuth(true);
    setIsLoadingPublicSettings(true);
    setError(null);

    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      return;
    }

    try {
      const profile = await fetchProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (fetchError) {
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError('Authentication required. Please sign in again.');
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  /**
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const tokenResponse = await authLogin(email, password);
      saveAuthTokens(tokenResponse.accessToken, tokenResponse.refreshToken);

      const profile = await fetchProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return { success: true };
    } catch (loginError) {
      clearAuthTokens();
      const message = /** @type {{ message?: string }} */ (loginError)?.message || 'Unable to sign in. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await authLogout(refreshToken);
      }
    } catch {
      // ignore errors and clear local state anyway
    }

    clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  const navigateToLogin = () => {
    window.location.assign('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      loading,
      error,
      appPublicSettings,
      login,
      logout,
      navigateToLogin,
      refreshUser: checkAppState,
      checkAppState,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
