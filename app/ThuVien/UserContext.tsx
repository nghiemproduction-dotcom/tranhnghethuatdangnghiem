"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthService, type UserInfo } from "@/app/CongDangNhap/AuthService";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { LoggerService } from "@/app/ThuVien/LoggerService";

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
      // 🛡️ CHẶN NGAY NẾU VỪA LOGOUT (Tránh load lại user cũ từ cache)
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("logout")) {
          console.log(
            "🛑 [UserContext] Phát hiện vừa đăng xuất. Bỏ qua init session."
          );
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);

        // Check if user has active Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Has active session - load user data
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);

          // Save to localStorage as backup
          if (currentUser) {
            localStorage.setItem("USER_INFO", JSON.stringify(currentUser));
          }
        } else {
          // No active session - check localStorage as fallback
          const savedUser = localStorage.getItem("USER_INFO");
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              LoggerService.error("UserContext", "Error parsing saved user", e);
              localStorage.removeItem("USER_INFO");
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

    // ✅ Listen for auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error("Error loading user:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  // 🟢 LOGIC ĐĂNG XUẤT "HỦY DIỆT" (FIX ZOMBIE SESSION)
  const signOut = async () => {
    try {
      setLoading(true); // Bật loading để UI không bị nhảy

      // 1. Xóa State React ngay lập tức
      setUser(null);
      setError(null);

      // 2. Xóa sạch Storage trước khi gọi server
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        // Xóa cookie visitor
        document.cookie = "VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax";

        // Xóa token Supabase thủ công
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });
      }

      // 3. Gọi hàm Auth Service (để supabase clear session server side)
      await AuthService.signOut();

      // 4. Redirect cứng với cờ hiệu logout
      // Param ?logout=success báo hiệu cho trang chủ biết "Tao vừa logout đấy, cấm auto-login"
      window.location.href = `/?logout=success&t=${Date.now()}`;
    } catch (err) {
      console.error("Logout error:", err);
      // Vẫn force logout dù lỗi
      window.location.href = `/?logout=force&t=${Date.now()}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, refreshUser, signOut }}
    >
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
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
