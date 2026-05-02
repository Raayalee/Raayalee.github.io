import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { checkCurrentUser, subscribeToAuthChanges } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    checkCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;
        setUser(currentUser || null);
        setIsAuthReady(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setIsAuthReady(true);
      });

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser || null);
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthReady,
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
