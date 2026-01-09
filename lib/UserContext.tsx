"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthService, type UserInfo } from "@/app/components/CongDangNhap/AuthService";
import { createClient } from "@/utils/supabase/client";
import { LoggerService } from "@/lib/LoggerService";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

// --- IMPORT ACTION MỚI ---
import { logoutSystem } from "@/app/actions/logout"; 

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const supabase = createClient();

export function UserProvider({ 
  children, 
  initialUser = null 
}: { 
  children: ReactNode;
  initialUser?: any; 
}) {
  const [user, setUser] = useState<UserInfo | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  // ... (Giữ nguyên phần useEffect initSession và authListener) ...
  useEffect(() => {
    const initSession = async () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("logout")) {
          setLoading(false);
          return;
        }
      }

      try {
        if (!user) {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
    
            if (session?.user) {
              const currentUser = await AuthService.getCurrentUser();
              setUser(currentUser);
            } else {
                const savedUser = localStorage.getItem("USER_INFO");
                if (savedUser) {
                    try { setUser(JSON.parse(savedUser)); } catch (e) {}
                }
            }
        }
      } catch (err) {
        LoggerService.error("UserContext", "Error loading user", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
          if (currentUser) {
            localStorage.setItem("USER_INFO", JSON.stringify(currentUser));
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("USER_INFO");
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshUser = async () => {
    try {
      setLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error("Error refreshing user:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 LOGIC ĐĂNG XUẤT ĐÃ SỬA (Gọi Server Action)
  const signOut = async () => {
    try {
      setLoading(true);

      // 1. Gọi Server Action để xóa cookie HttpOnly (Quan trọng nhất)
      await logoutSystem();

      // 2. Đăng xuất Supabase
      await supabase.auth.signOut();

      // 3. Xóa Client storage
      setUser(null);
      setError(null);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // 4. Hard Reload về trang chủ
      window.location.href = "/"; 

    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider.");
  }
  return context;
}