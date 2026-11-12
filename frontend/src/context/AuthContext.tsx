import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, VendorProfile, CourierProfile } from '../types';
import { API } from '../config/api';

type UserRole = 'buyer' | 'vendor' | 'courier' | 'admin';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeRole: UserRole;
  vendorProfile: VendorProfile | null;
  courierProfile: CourierProfile | null;
  isAuthenticated: boolean;
  login: (phoneOrEmail: string, role: UserRole, password?: string, totpCode?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('unihive_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && typeof parsed.fullName === 'string') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Invalid cached user', e);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('unihive_token') || null;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('unihive_role') as UserRole) || 'buyer';
  });

  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [courierProfile, setCourierProfile] = useState<CourierProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('unihive_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('unihive_user');
    }
    if (token) {
      localStorage.setItem('unihive_token', token);
    } else {
      localStorage.removeItem('unihive_token');
    }
    localStorage.setItem('unihive_role', activeRole);
  }, [user, token, activeRole]);

  const login = async (phoneOrEmail: string, role: UserRole, password = 'unihive2026', totpCode?: string) => {
    try {
      const res = await API.login({
        phoneOrEmail,
        password,
        role,
        totpCode,
      });

      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        setActiveRole(role);
        if (res.data.vendorProfile) setVendorProfile(res.data.vendorProfile);
        if (res.data.courierProfile) setCourierProfile(res.data.courierProfile);
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    switch (role) {
      case 'buyer':
        await login('buyer@run.edu.ng', 'buyer', 'unihive2026');
        break;
      case 'vendor':
        await login('vendor@run.edu.ng', 'vendor', 'unihive2026');
        break;
      case 'courier':
        await login('courier@run.edu.ng', 'courier', 'unihive2026');
        break;
      case 'admin': {
        let totp = '';
        try {
          const res = await API.getDemoTotp();
          if (res?.totp) totp = res.totp;
        } catch (e) {
          console.warn('Could not fetch demo totp', e);
        }
        await login('admin@run.edu.ng', 'admin', 'unihive2026', totp || undefined);
        break;
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveRole('buyer');
    setVendorProfile(null);
    setCourierProfile(null);
    localStorage.removeItem('unihive_user');
    localStorage.removeItem('unihive_token');
    localStorage.removeItem('unihive_role');
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        vendorProfile,
        courierProfile,
        isAuthenticated: !!token,
        login,
        logout,
        switchRole,
        quickDemoLogin,
        isLoginModalOpen,
        setIsLoginModalOpen,
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
