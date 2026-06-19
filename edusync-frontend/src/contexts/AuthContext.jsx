import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edusync_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch {
      // Token invalid or expired
      localStorage.removeItem('edusync_token');
      localStorage.removeItem('edusync_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token } = res.data;
    localStorage.setItem('edusync_token', access_token);
    setToken(access_token);
    // Fetch user info
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    localStorage.setItem('edusync_user', JSON.stringify(userRes.data));
    return userRes.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { access_token } = res.data;
    localStorage.setItem('edusync_token', access_token);
    setToken(access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    localStorage.setItem('edusync_user', JSON.stringify(userRes.data));
    return userRes.data;
  };

  const logout = () => {
    localStorage.removeItem('edusync_token');
    localStorage.removeItem('edusync_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
