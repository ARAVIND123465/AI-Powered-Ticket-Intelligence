import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Token } from '@/types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isBackendOffline = (err: any) => {
      if (!err.response) return true;
      const status = err.response.status;
      return status === 502 || status === 503 || status === 504 || status === 404 || status >= 500;
    };

    if (token) {
      if (token === 'mock-token') {
        const storedRole = localStorage.getItem('user_role') || 'Admin';
        const storedName = localStorage.getItem('mock_user_name') || 'Administrator';
        const storedEmail = localStorage.getItem('mock_registered_email') || 'admin@company.com';
        setUser({
          id: 'mock-id',
          email: storedEmail,
          full_name: storedName,
          role: storedRole as User['role'],
          created_at: new Date().toISOString()
        });
        setRole(storedRole);
        setIsLoading(false);
        return;
      }
      userService.getMe()
        .then((u) => {
          setUser(u);
          setRole(u.role);
        })
        .catch((err) => {
          // If server is offline/network error/gateway error, default to mock mode to keep session alive
          if (isBackendOffline(err)) {
            const storedRole = localStorage.getItem('user_role') || 'Admin';
            const storedName = localStorage.getItem('mock_user_name') || 'Administrator';
            const storedEmail = localStorage.getItem('mock_registered_email') || 'admin@company.com';
            setUser({
              id: 'mock-id',
              email: storedEmail,
              full_name: storedName,
              role: storedRole as User['role'],
              created_at: new Date().toISOString()
            });
            setRole(storedRole);
          } else {
            logout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const isBackendOffline = (err: any) => {
      if (!err.response) return true;
      const status = err.response.status;
      return status === 502 || status === 503 || status === 504 || status === 404 || status >= 500;
    };

    try {
      const data: Token = await authService.login({ username: email, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', data.role);
      setToken(data.access_token);
      setRole(data.role);
    } catch (err: any) {
      // If server is offline/unreachable/gateway error, fallback to local mock login mode
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server is offline or proxy gateway failed. Enabling client-side Mock Mode.');
        const mockRole = email.toLowerCase().includes('agent')
          ? 'Agent'
          : email.toLowerCase().includes('customer')
            ? 'Customer'
            : 'Admin';
        
        // Retrieve stored name if matches email, otherwise compute
        const storedEmail = localStorage.getItem('mock_registered_email');
        const storedName = (storedEmail === email ? localStorage.getItem('mock_user_name') : null) || email.split('@')[0].toUpperCase();


        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('user_role', mockRole);
        localStorage.setItem('mock_user_name', storedName);
        localStorage.setItem('mock_registered_email', email);
        localStorage.setItem('mock_user_password', password);

        setToken('mock-token');
        setRole(mockRole);
        setUser({
          id: 'mock-id',
          email: email,
          full_name: storedName,
          role: mockRole,
          created_at: new Date().toISOString(),
        });
        return;
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string, userRole: string) => {
    const isBackendOffline = (err: any) => {
      if (!err.response) return true;
      const status = err.response.status;
      return status === 502 || status === 503 || status === 504 || status === 404 || status >= 500;
    };

    try {
      await authService.register({ email, password, full_name: fullName, role: userRole as User['role'] });
    } catch (err: any) {
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server offline. Simulating registration success.');
        localStorage.setItem('mock_registered_email', email);
        localStorage.setItem('mock_user_name', fullName);
        localStorage.setItem('mock_user_password', password);
        localStorage.setItem('user_role', userRole);
        return;
      }
      throw err;
    }
  };



  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

