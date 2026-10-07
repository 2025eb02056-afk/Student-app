import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../shared/types/index.js';
import { api } from '../services/api.js';
import { signInWithGooglePopup, logoutFirebase } from '../services/firebase.js';
import { syncUserToFirestore } from '../services/firestore.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleDemo: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setAndSyncUser = (u: User | null) => {
    setUser(u);
    if (u) {
      syncUserToFirestore(u).catch(() => {});
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('cb_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.data?.user) {
          setAndSyncUser(res.data.user);
        }
      } catch (err) {
        localStorage.removeItem('cb_token');
        setAndSyncUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('cb_token', res.data.token);
      setAndSyncUser(res.data.user);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { user: fbUser } = await signInWithGooglePopup();
      if (!fbUser || !fbUser.email) {
        throw new Error('Google Sign-In was unable to retrieve email.');
      }

      const res = await api.loginWithGoogle({
        email: fbUser.email,
        fullName: fbUser.displayName || fbUser.email.split('@')[0],
        avatarUrl: fbUser.photoURL || undefined,
        googleUid: fbUser.uid
      });

      if (res.success && res.data?.token) {
        localStorage.setItem('cb_token', res.data.token);
        setAndSyncUser(res.data.user);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        const customErr = new Error('Google Sign-In popup was closed before completion.');
        (customErr as any).code = err.code;
        throw customErr;
      } else if (err.code === 'auth/cancelled-popup-request') {
        const customErr = new Error('Google Sign-In request was cancelled.');
        (customErr as any).code = err.code;
        throw customErr;
      } else if (err.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        const customErr = new Error(`Domain "${host}" is not in Firebase authorized domains. Switch to http://localhost:5173 or add "${host}" to Firebase Console.`);
        (customErr as any).code = 'auth/unauthorized-domain';
        throw customErr;
      } else if (err.code === 'auth/operation-not-allowed') {
        const customErr = new Error('Google provider is not enabled in Firebase Console. Please enable Google in Firebase -> Authentication -> Sign-in method.');
        (customErr as any).code = err.code;
        throw customErr;
      }
      throw new Error(err.message || 'Google Sign-In failed');
    }
  };

  const loginWithGoogleDemo = async () => {
    const demoEmail = 'student.google@campusbites.edu';
    const demoName = 'Google Student';
    const res = await api.loginWithGoogle({
      email: demoEmail,
      fullName: demoName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      googleUid: 'google-demo-' + Date.now()
    });
    if (res.success && res.data?.token) {
      localStorage.setItem('cb_token', res.data.token);
      setAndSyncUser(res.data.user);
    }
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    if (res.success && res.data?.token) {
      localStorage.setItem('cb_token', res.data.token);
      setAndSyncUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignored
    }
    try {
      await logoutFirebase();
    } catch {
      // Ignored
    }
    localStorage.removeItem('cb_token');
    setAndSyncUser(null);
  };

  const quickDemoLogin = async (role: UserRole) => {
    let email = 'arjun.sharma@campusbites.edu';
    let password = 'Password123!';

    if (role === 'admin') {
      email = 'admin@campusbites.edu';
    } else if (role === 'vendor') {
      email = 'canteen@campusbites.edu';
    }

    // Set demo user directly if offline or via API
    try {
      await login(email, password);
    } catch {
      // Fallback mock session for rapid testing
      const mockUser: User = {
        id: role === 'admin' ? '22222222-0000-0000-0000-000000000001' : role === 'vendor' ? '22222222-0000-0000-0000-000000000002' : '22222222-0000-0000-0000-000000000003',
        fullName: role === 'admin' ? 'Super Admin' : role === 'vendor' ? 'Campus Canteen Manager' : 'Arjun Sharma',
        email,
        phone: '9876543212',
        collegeName: 'Apex Institute of Technology',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAndSyncUser(mockUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithGoogleDemo, register, logout, quickDemoLogin }}>
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
