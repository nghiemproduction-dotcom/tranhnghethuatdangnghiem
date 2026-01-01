'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, type UserInfo } from '@/app/CongDangNhap/AuthService';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { LoggerService } from '@/app/ThuVien/LoggerService';

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider - Wrap app để share user info
 * Dùng: <UserProvider><App /></UserProvider>
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ SESSION PERSISTENCE - Check Supabase session first
    const initSession = async () => {
      try {
        setLoading(true);
        
        // Check if user has active Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Has active session - load user data
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          
          // Save to localStorage as backup
          if (currentUser) {
            localStorage.setItem('USER_INFO', JSON.stringify(currentUser));
          }
        } else {
          // No active session - check localStorage as fallback
          const savedUser = localStorage.getItem('USER_INFO');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              LoggerService.error('UserContext', 'Error parsing saved user', e);
              localStorage.removeItem('USER_INFO');
            }
          }
        }
      } catch (err) {
        LoggerService.error('UserContext', 'Error loading user', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // ✅ Listen for auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          localStorage.setItem('USER_INFO', JSON.stringify(currentUser));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('USER_INFO');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error('Error loading user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const signOut = async () => {
    try {
      // Xóa localStorage trước
      localStorage.removeItem('USER_INFO');
      localStorage.removeItem('USER_ROLE');
      localStorage.removeItem('SAVED_EMAIL');
      
      // Xóa token Supabase
      Object.keys(localStorage)
        .filter(key => key.startsWith('sb-'))
        .forEach(key => localStorage.removeItem(key));
      
      sessionStorage.clear();
      
      // Signout Supabase
      await AuthService.signOut();
      
      setUser(null);
      setError(null);
      
      // Redirect về trang chủ
      window.location.href = '/';
    } catch (err) {
      LoggerService.error('UserContext', 'Error signing out', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Vẫn redirect dù lỗi
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook để dùng user info
 * const { user, loading } = useUser();
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
