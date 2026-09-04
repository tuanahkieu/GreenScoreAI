import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('greenscore_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // In a real app, you would fetch user profile with the token here
      // For now, we'll just decode the token or assume it's valid
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub });
      } catch (e) {
        console.error("Invalid token", e);
        setToken(null);
        localStorage.removeItem('greenscore_token');
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken, username) => {
    setToken(newToken);
    setUser({ username });
    localStorage.setItem('greenscore_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('greenscore_token');
    // Có thể xóa luôn localStorage.getItem('greenscore_history') nếu muốn xóa cache
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
