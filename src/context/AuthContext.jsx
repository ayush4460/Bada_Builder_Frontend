import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Function to load user from token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      const response = await authService.getMe();
      if (response.data.success) {
        const user = response.data.user;
        setCurrentUser({ uid: user.uid, email: user.email, ...user });
        setUserProfile(user);
      } else {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (token, user) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setUserProfile(user);
    return { token, user };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserProfile(null);
    window.location.href = '/login';
  }, []);

  const isSubscribed = useCallback(() => {
    if (!userProfile) return false;
    if (!userProfile.is_subscribed) return false;
    
    if (userProfile.subscription_expiry) {
      const expiryDate = new Date(userProfile.subscription_expiry);
      return expiryDate > new Date();
    }
    return true;
  }, [userProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    login,
    logout,
    isSubscribed,
    isAuthenticated: !!currentUser,
    refreshProfile: loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
