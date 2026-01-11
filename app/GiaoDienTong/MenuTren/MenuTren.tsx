"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, QrCode, UserCircle, KeyRound } from "lucide-react"; 
import NhacNen from "@/app/Music/NhacNen";
import NotificationCenter from "./NotificationCenter";
import { NotificationService } from "./NotificationService";
import { Notification } from "./NotificationTypes";
import { useUser } from "@/lib/UserContext";
import { Z_INDEX } from "@/app/constants/zIndex";
import { useAppSettings } from "@/lib/AppSettingsContext";
import ModalProfile from "@/app/GiaoDienTong/MenuTren/NutCaNhan/ModalProfile";
import CongDangNhap from "@/app/components/CongDangNhap/CongDangNhap";

const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/hover.mp3");
    }
  }, []);
  return () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
};

export default function MenuTren({
  nguoiDung: fallbackUser,
}: {
  nguoiDung: any;
  loiChao: string;
}) {
  const { user: contextUser } = useUser();
  const { t } = useAppSettings();
  const playSound = useNotificationSound();

  const nguoiDung = contextUser
    ? {
        id: contextUser.id,
        ho_ten: contextUser.ho_ten || t("profile.user"),
        email: contextUser.email,
        role: contextUser.userType === "nhan_su" ? contextUser.vi_tri_normalized : contextUser.phan_loai_normalized,
        permissions: contextUser.permissions,
        vi_tri: contextUser.vi_tri,
        userType: contextUser.userType,
        phan_loai: contextUser.phan_loai,
        so_dien_thoai: contextUser.so_dien_thoai,
      }
    : fallbackUser;

  const isVisitor = !nguoiDung || nguoiDung?.userType === "guest" || nguoiDung?.role === "visitor";
  const isNhanSu = nguoiDung?.userType === "nhan_su";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDisplayName = () => {
    if (isVisitor) return { full: "Quý Khách", short: "KHÁCH" };
    const fullName = nguoiDung?.ho_ten || "";
    const lastName = fullName.trim().split(" ").pop()?.toUpperCase() || "BẠN";
    return { full: fullName, short: lastName };
  };
  const displayName = getDisplayName();

  useEffect(() => {
    if (isNhanSu) return;
    const checkCart = () => {
      try {
        const cartData = localStorage.getItem("cart_items");
        const items = cartData ? JSON.parse(cartData) : [];
        setCartCount(items.length || 0);
      } catch {
        setCartCount(0);
      }
    };
    checkCart();
    window.addEventListener("storage", checkCart);
    window.addEventListener("cart_updated", checkCart);
    return () => {
      window.removeEventListener("storage", checkCart);
      window.removeEventListener("cart_updated", checkCart);
    };
  }, [isNhanSu]);

  useEffect(() => {
    if (!nguoiDung?.id || isVisitor) return;
    let isMounted = true;
    let subscription: any = null;
    const initNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          NotificationService.getUserNotifications(nguoiDung.id),
          NotificationService.getUnreadCount(nguoiDung.id),
        ]);
        if (isMounted) {
          setNotifications(notifs);
          setUnreadCount(count);
        }
        subscription = NotificationService.subscribeToNotifications(
          nguoiDung.id,
          (newNotification) => {
            if (isMounted) {
              playSound();
              setNotifications((prev) => {
                if (prev.some((n) => n.id === newNotification.id)) return prev;
                return [newNotification, ...prev];
              });
              if (!newNotification.is_read) setUnreadCount((prev) => prev + 1);
            }
          }
        );
      } catch (error) {
        console.error("Lỗi thông báo:", error);
      }
    };
    initNotifications();
    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [nguoiDung?.id, isVisitor]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await NotificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!nguoiDung?.id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await NotificationService.markAllAsRead(nguoiDung.id);
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif && !notif.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
    await NotificationService.deleteNotification(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action_url) window.location.href = notification.action_url;
    if (!notification.is_read) handleMarkAsRead(notification.id);
  };

  return (
    <>
      <div
        // 🟢 CHỈNH LẠI HEIGHT CỐ ĐỊNH: 60px (mobile) / 80px (desktop)
        className={`fixed top-0 left-0 right-0 h-[60px] md:h-[80px] px-3 md:px-6 flex justify-between items-center bg-transparent transition-all duration-300 pointer-events-none`}
        style={{ zIndex: Z_INDEX.menuTren }}
      >
        <div className="flex-1 min-w-0 flex items-center gap-3 animate-slide-down pointer-events-auto mr-2">
          
          {/* ✅ SỬA LOGIC HIỂN THỊ: LUÔN LÀ 1 DÒNG (FLEX-ROW) CHO CẢ MOBILE VÀ DESKTOP */}
          <div className="flex flex-row items-baseline gap-2 overflow-hidden">
            <span className="text-xs md:text-sm font-medium italic text-gray-300 drop-shadow-md whitespace-nowrap">
              {isVisitor ? "Chào mừng," : "Xin chào,"}
            </span>
            <span
              className="font-black text-white uppercase tracking-wider drop-shadow-lg shadow-black truncate"
              style={{ fontSize: "16px" }} 
            >
              {displayName.full}
            </span>
          </div>

        </div>

        {!isVisitor && (
          <div className="shrink-0 flex gap-1.5 md:gap-3 animate-slide-down delay-100 pointer-events-auto items-center">
            {nguoiDung?.id && <NhacNen />}
            {!isNhanSu && cartCount > 0 && (
              <NutVuong icon={ShoppingCart} badge={cartCount} onClick={() => {}} className="animate-bounce-slow" />
            )}
            {nguoiDung?.id && (
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDelete}
                onNotificationClick={handleNotificationClick}
              />
            )}
            <div className="hidden md:block"><NutVuong icon={QrCode} /></div>
            <NutVuong icon={KeyRound} onClick={() => setShowLogin(true)} title="Cổng Nội Bộ" />
            <NutVuong icon={UserCircle} onClick={() => setShowProfile(true)} isActive={showProfile} />
          </div>
        )}
      </div>

      {mounted && showLogin && createPortal(<CongDangNhap isOpen={showLogin} onClose={() => setShowLogin(false)} />, document.body)}
      {mounted && showProfile && nguoiDung && !isVisitor && createPortal(
          <ModalProfile isOpen={true} onClose={() => setShowProfile(false)} nguoiDung={nguoiDung} />, document.body
      )}
    </>
  );
}

function NutVuong({ icon: Icon, badge, onClick, isActive, className = "", title }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center relative active:scale-95 transition-all backdrop-blur-sm shadow-sm group cursor-pointer
        ${isActive ? "bg-[#C69C6D] border border-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)]" : "bg-black/40 border border-white/10 hover:bg-white/10 text-white"}
        ${className}
      `}
    >
      <Icon size={18} className={`transition-colors ${isActive ? "text-black" : "text-white group-hover:text-[#C69C6D]"}`} />
      {badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-black shadow-sm z-10 animate-in zoom-in">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}