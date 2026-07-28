import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loginApi, registerApi } from '../services/auth.service';
import type { AuthState, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextValue extends AuthState {
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuthState(): AuthState {
  try {
    const saved = localStorage.getItem('auth_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return { token: null, nguoiDungId: null, roles: [], role: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !state.token) {
      setState({ token: null, nguoiDungId: null, roles: [], role: null, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('auth_state', JSON.stringify(state));
  }, [state]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await loginApi(data);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Đăng nhập thất bại');
      }
      const { token, nguoiDungId, roles, role } = res.data;
      localStorage.setItem('token', token);
      setState({ token, nguoiDungId, roles, role, isAuthenticated: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await registerApi(data);
      if (!res.success) {
        throw new Error(res.message || 'Đăng ký thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_state');
    setState({ token: null, nguoiDungId: null, roles: [], role: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
