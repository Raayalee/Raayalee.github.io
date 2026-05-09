import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile } from '../api/auth';
import { clearAuthToken, getAuthToken, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setIsAuthReady(true);
      return () => {
        isMounted = false;
      };
    }

    getProfile()
      .then((profile) => {
        if (!isMounted) return;
        setUser(profile || null);
        setIsAuthReady(true);
      })
      .catch(() => {
        if (!isMounted) return;
        clearAuthToken();
        setUser(null);
        setIsAuthReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = (token, profile) => {
    setAuthToken(token);
    setUser(profile || null);
    setIsAuthReady(true);
  };

  const signOut = () => {
    clearAuthToken();
    setUser(null);
    setIsAuthReady(true);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthReady,
      signIn,
      signOut,
    }),
    [user, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
