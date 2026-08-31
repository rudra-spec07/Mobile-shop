import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  });

  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setSessionExpiredMessage(null);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUserData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    };

    window.addEventListener('mobileadda:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('mobileadda:session-expired', handleSessionExpired);
    };
  }, []);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        sessionExpiredMessage,
        setSessionExpiredMessage,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
