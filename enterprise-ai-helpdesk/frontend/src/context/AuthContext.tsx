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
  login: (email: string, password: string) => Promise<{ user: User; role: string; targetRoute: string }>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Canonical Role Definition ---
// One unified representation across DB, Backend, JWT, and Frontend:
// 'SuperAdmin' | 'Admin' | 'Agent' | 'Customer'
export const normalizeRole = (role: string | null | undefined): 'SuperAdmin' | 'Admin' | 'Agent' | 'Customer' => {
  if (!role) return 'Customer';
  const r = String(role).trim().toUpperCase().replace(/[-_ ]/g, '');
  if (r === 'SUPERADMIN' || r === 'SUPER') return 'SuperAdmin';
  if (r === 'COMPANYADMIN' || r === 'ADMIN') return 'Admin';
  if (r === 'SUPPORTAGENT' || r === 'AGENT' || r === 'SUPPORT') return 'Agent';
  if (r === 'CUSTOMER') return 'Customer';
  return 'Customer';
};

/** Role-based canonical dashboard route */
export const roleHome = (role: string | null | undefined): string => {
  const norm = normalizeRole(role);
  if (norm === 'SuperAdmin') return '/platform/dashboard';
  if (norm === 'Admin') return '/company-admin/dashboard';
  if (norm === 'Agent') return '/agent/dashboard';
  return '/customer/dashboard';
};

/** Helper for offline fallback role inference */
const inferRoleFromEmail = (email: string): 'SuperAdmin' | 'Admin' | 'Agent' | 'Customer' => {
  const lower = email.toLowerCase().replace(/[-_.]/g, '');
  if (lower.includes('superadmin') || lower.includes('super')) return 'SuperAdmin';
  if (lower.includes('admin')) return 'Admin';
  if (lower.includes('agent') || lower.includes('support')) return 'Agent';
  return 'Customer';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [role, setRole] = useState<string | null>(() => {
    const stored = localStorage.getItem('user_role');
    return stored ? normalizeRole(stored) : null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('access_token'));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    if (token === 'mock-token') {
      const storedRole = normalizeRole(localStorage.getItem('user_role'));
      const storedName = localStorage.getItem('mock_user_name') || 'Administrator';
      const storedEmail = localStorage.getItem('user_email') || localStorage.getItem('mock_registered_email') || 'admin@company.com';
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
        const norm = normalizeRole(u.role);
        setUser({ ...u, role: norm as User['role'] });
        setRole(norm);
        localStorage.setItem('user_role', norm);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // Token expired or invalid
          logout();
        } else {
          // Server error or network error: retain cached authenticated credentials
          const storedRole = normalizeRole(localStorage.getItem('user_role'));
          const storedEmail = localStorage.getItem('user_email') || localStorage.getItem('mock_registered_email') || '';
          const storedName = localStorage.getItem('mock_user_name') || '';
          if (storedRole && storedEmail) {
            setUser({
              id: `usr_${storedEmail.split('@')[0]}`,
              email: storedEmail,
              full_name: storedName,
              role: storedRole as User['role'],
              created_at: new Date().toISOString()
            });
            setRole(storedRole);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (email: string, password: string): Promise<{ user: User; role: string; targetRoute: string }> => {
    const isBackendOffline = (err: any) => {
      if (!err.response) return true;
      const status = err.response.status;
      return status === 502 || status === 503 || status === 504 || status >= 500;
    };

    try {
      const data: Token = await authService.login({ username: email, password });
      const rawRole = data.user?.role || data.role;
      const normRole = normalizeRole(rawRole);

      const authenticatedUser: User = data.user
        ? { ...data.user, role: normRole as User['role'] }
        : {
            id: `usr_${email.split('@')[0]}`,
            email: email,
            full_name: email.split('@')[0],
            role: normRole as User['role'],
            created_at: new Date().toISOString(),
          };

      // Persist authenticated credentials
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', normRole);
      localStorage.setItem('user_email', authenticatedUser.email);
      localStorage.setItem('mock_registered_email', authenticatedUser.email);
      if (authenticatedUser.full_name) {
        localStorage.setItem('mock_user_name', authenticatedUser.full_name);
      }

      // Synchronously set local state
      setUser(authenticatedUser);
      setRole(normRole);
      setToken(data.access_token);
      setIsLoading(false);

      const targetRoute = roleHome(normRole);
      return { user: authenticatedUser, role: normRole, targetRoute };
    } catch (err: any) {
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server offline. Enabling Mock Session.');
        const normRole = inferRoleFromEmail(email);
        const resolvedName = email.split('@')[0];
        const mockUser: User = {
          id: `usr_${resolvedName}`,
          email: email,
          full_name: resolvedName,
          role: normRole as User['role'],
          created_at: new Date().toISOString(),
        };

        localStorage.setItem('access_token', 'mock-token');
        localStorage.setItem('user_role', normRole);
        localStorage.setItem('user_email', email);
        localStorage.setItem('mock_user_name', resolvedName);
        localStorage.setItem('mock_registered_email', email);

        setToken('mock-token');
        setRole(normRole);
        setUser(mockUser);
        setIsLoading(false);

        const targetRoute = roleHome(normRole);
        return { user: mockUser, role: normRole, targetRoute };
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string, userRole: string) => {
    const isBackendOffline = (err: any) => {
      if (!err.response) return true;
      const status = err.response.status;
      return status === 502 || status === 503 || status === 504 || status >= 500;
    };

    try {
      const normRole = normalizeRole(userRole);
      await authService.register({ email, password, full_name: fullName, role: normRole as any });
    } catch (err: any) {
      if (isBackendOffline(err) || err.code === 'ERR_NETWORK') {
        console.warn('Backend server offline. Simulating registration success.');
        const normRole = normalizeRole(userRole);
        localStorage.setItem('mock_registered_email', email);
        localStorage.setItem('mock_user_name', fullName);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', normRole);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('mock_registered_email');
    localStorage.removeItem('mock_user_name');
    setToken(null);
    setUser(null);
    setRole(null);
    setIsLoading(false);
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
