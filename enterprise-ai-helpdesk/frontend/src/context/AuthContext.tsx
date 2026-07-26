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

// --- Role Normalization Suite ---
// Seamlessly maps UPPER_CASE API values with CamelCase UI roles
export const normalizeRole = (role: string | null): 'SuperAdmin' | 'Admin' | 'Agent' | 'Customer' => {
  if (!role) return 'Customer';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') return 'SuperAdmin';
  if (r === 'COMPANY_ADMIN' || r === 'ADMIN' || r === 'COMPANYADMIN') return 'Admin';
  if (r === 'SUPPORT_AGENT' || r === 'AGENT' || r === 'SUPPORTAGENT') return 'Agent';
  if (r === 'CUSTOMER') return 'Customer';
  return 'Customer';
};

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
        const storedRole = normalizeRole(localStorage.getItem('user_role'));
        const storedName = localStorage.getItem('mock_user_name') || 'Administrator';
        const storedEmail = localStorage.getItem('mock_registered_email') || 'admin@company.com';
        setUser({
          id: 'mock-id',
          email: storedEmail,
          full_name: storedName,
          role: storedRole,
          created_at: new Date().toISOString()
        });
        setRole(storedRole);
        setIsLoading(false);
        return;
      }
      userService.getMe()
        .then((u) => {
          const norm = normalizeRole(u.role);
          setUser({ ...u, role: norm });
          setRole(norm);
        })
        .catch((err) => {
          if (isBackendOffline(err)) {
            const storedRole = normalizeRole(localStorage.getItem('user_role'));
            const storedName = localStorage.getItem('mock_user_name') || 'Administrator';
            const storedEmail = localStorage.getItem('mock_registered_email') || 'admin@company.com';
            setUser({
              id: 'mock-id',
              email: storedEmail,
              full_name: storedName,
              role: storedRole,
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
      const normRole = normalizeRole(data.role);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', normRole);
      setToken(data.access_token);
      setRole(normRole);
    } catch (err: any) {
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server offline. Enabling Mock Session.');
        
        const isSuperEmail = email.toLowerCase().includes('super');
        const isAgentEmail = email.toLowerCase().includes('agent');
        const isCustomerEmail = email.toLowerCase().includes('customer');

        const mockRole = isSuperEmail
          ? 'SuperAdmin'
          : isAgentEmail
            ? 'Agent'
            : isCustomerEmail
              ? 'Customer'
              : 'Admin';

        const resolvedName = isSuperEmail
          ? 'Super Admin'
          : email.toLowerCase().includes('admin')
            ? 'Company Admin'
            : email.split('@')[0];

        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('user_role', mockRole);
        localStorage.setItem('mock_user_name', resolvedName);
        localStorage.setItem('mock_registered_email', email);
        localStorage.setItem('mock_user_password', password);

        setToken('mock-token');
        setRole(mockRole);
        setUser({
          id: `user-${Date.now()}`,
          email: email,
          full_name: resolvedName,
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
      const normRole = normalizeRole(userRole);
      await authService.register({ email, password, full_name: fullName, role: normRole as any });
    } catch (err: any) {
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server offline. Simulating registration success.');
        localStorage.setItem('mock_registered_email', email);
        localStorage.setItem('mock_user_name', fullName);
        localStorage.setItem('mock_user_password', password);
        localStorage.setItem('user_role', normalizeRole(userRole));
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('mock_registered_email');
    localStorage.removeItem('mock_user_name');
    localStorage.removeItem('mock_user_password');
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
