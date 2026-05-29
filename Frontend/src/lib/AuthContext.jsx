/**
 * @typedef {{
 *   id?: string,
 *   email?: string,
 *   firstName?: string,
 *   lastName?: string,
 *   full_name?: string,
 *   school?: string,
 *   role?: string,
 *   profileImageUrl?: string,
 * }} User
 *
 * @typedef {{
 *   success: boolean,
 *   message?: string,
 * }} LoginResult
 *
 * @typedef {{
 *   key: string,
 *   value: string,
 *   label?: string,
 *   description?: string,
 * }} AppPublicSetting
 *
 * @typedef {{
 *   user: User | null,
 *   isAuthenticated: boolean,
 *   isLoadingAuth: boolean,
 *   isLoadingPublicSettings: boolean,
 *   loading: boolean,
 *   error: string | { type?: string, message?: string } | null,
 *   appPublicSettings: AppPublicSetting[] | null,
 *   login: (email: string, password: string) => Promise<LoginResult>,
 *   logout: () => Promise<void>,
 *   navigateToLogin: () => void,
 *   refreshUser: () => Promise<void>,
 *   checkAppState: () => Promise<void>,
 *   clearError: () => void,
 * }} AuthContextValue
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authLogin, authLogout, authVerifyTwoFactor, fetchProfile, fetchSystemSettings, isJwtTokenExpiringSoon, refreshAuthTokens } from '@/api';

/** @type {import('react').Context<AuthContextValue | null>} */
const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));

const ACCESS_TOKEN_KEY = 'learnmalawi_access_token';
const REFRESH_TOKEN_KEY = 'learnmalawi_refresh_token';

function isValidToken(token) {
  return typeof token === 'string' && token.trim() !== '' && token.trim().toLowerCase() !== 'undefined' && token.trim().toLowerCase() !== 'null';
}

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

function getStoredRefreshToken() {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  return isValidToken(token) ? token : null;
}

const MIN_LOGIN_LOADING_MS = 700;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const [error, setError] = useState(/** @type {string | { type?: string, message?: string } | null} */ (null));
  const [appPublicSettings, setAppPublicSettings] = useState(/** @type {AppPublicSetting[] | null} */ (null));

  const refreshPublicSettings = async () => {
    try {
      const response = await fetchSystemSettings();
      setAppPublicSettings(Array.isArray(response) ? response : []);
    } catch (err) {
      const error = /** @type {{ status?: number }} */ (err);
      if (error.status === 503) {
        setAppPublicSettings([{ key: 'maintenance_mode', value: 'true' }]);
      } else {
        setAppPublicSettings([]);
      }
    }
  };

  useEffect(() => {
    checkAppState();

    const refreshOnFocus = () => {
      refreshPublicSettings();
    };

    const intervalId = window.setInterval(refreshPublicSettings, 15000);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const checkAppState = async () => {
    setIsLoadingAuth(true);
    setIsLoadingPublicSettings(true);
    setError(null);

    await refreshPublicSettings();

    let token = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (refreshToken && (!token || isJwtTokenExpiringSoon(token, 60))) {
      try {
        await refreshAuthTokens(refreshToken);
        token = getStoredAccessToken();
      } catch {
        clearAuthTokens();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        return;
      }
    }

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
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      const tokenResponse = await authLogin(email, password);
      if (tokenResponse?.requiresTwoFactor && tokenResponse?.twoFactorChallengeId) {
        return { success: false, type: '2fa_required', challengeId: tokenResponse.twoFactorChallengeId, message: tokenResponse.message };
      }

      saveAuthTokens(tokenResponse.accessToken, tokenResponse.refreshToken);

      const profile = await fetchProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return { success: true };
    } catch (loginError) {
      clearAuthTokens();
      const rawMessage = /** @type {{ message?: string }} */ (loginError)?.message || 'Unable to sign in. Please try again.';
      const formattedMessage = /invalid credentials/i.test(rawMessage)
        ? 'Wrong email or password. Please check your credentials and try again.'
        : rawMessage;
      setError(formattedMessage);
      return { success: false, message: formattedMessage };
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOGIN_LOADING_MS) {
        await sleep(MIN_LOGIN_LOADING_MS - elapsed);
      }
      setLoading(false);
    }
  };

  /**
   * @param {string} challengeId
   * @param {string} code
   */
  const verifyTwoFactor = async (challengeId, code) => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      const tokenResponse = await authVerifyTwoFactor(challengeId, code);
      saveAuthTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
      const profile = await fetchProfile();
      setUser(profile);
      setIsAuthenticated(true);
      return { success: true };
    } catch (verifyError) {
      clearAuthTokens();
      const rawMessage = /** @type {{ message?: string }} */ (verifyError)?.message || 'Invalid security code.';
      setError(rawMessage);
      return { success: false, message: rawMessage };
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOGIN_LOADING_MS) {
        await sleep(MIN_LOGIN_LOADING_MS - elapsed);
      }
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
      verifyTwoFactor,
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
