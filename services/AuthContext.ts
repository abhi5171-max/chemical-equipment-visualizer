
// Fix: Added React to imports to resolve namespace 'React' errors and allow using React.createElement
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, UserProfile, AuthTokens } from '../types';

export const AuthContext = createContext<AuthState>({
  token: null,
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

// Fix: Properly typed AuthProvider using React.FC and React.ReactNode with React in scope
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const storedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_profile') || sessionStorage.getItem('user_profile');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (tokens: AuthTokens, userProfile: UserProfile, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    
    storage.setItem('access_token', tokens.access);
    storage.setItem('refresh_token', tokens.refresh);
    storage.setItem('user_profile', JSON.stringify(userProfile));
    
    setToken(tokens.access);
    setUser(userProfile);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_profile');
    
    setToken(null);
    setUser(null);
  };

  // Fix: Replaced JSX with React.createElement to avoid TypeScript parsing errors in a .ts file
  return React.createElement(AuthContext.Provider, { 
    value: { 
      token, 
      user, 
      isAuthenticated: !!token, 
      login, 
      logout,
      isLoading 
    }
  }, children);
};
