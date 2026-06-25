import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate storage states
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (emailAddress, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailAddress, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Login failed. Invalid credentials.');
    }

    const data = await response.json(); // returns { token, personId, emailAddress, fullName }
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify({
      id: data.personId,
      email: data.emailAddress,
      name: data.fullName
    }));
    
    setToken(data.token);
    setUser({
      id: data.personId,
      email: data.emailAddress,
      name: data.fullName
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  // Custom fetch helper that automatically appends JWT token headers
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const currentToken = localStorage.getItem('jwt_token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Auto-logout on unauthorized
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return res;
  }, [logout]);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    authFetch,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
