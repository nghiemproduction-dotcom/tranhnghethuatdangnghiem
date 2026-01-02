"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, QrCode, UserCircle } from "lucide-react";
import NhacNen from "@/app/Music/NhacNen";
import NotificationCenter from "./NotificationCenter";
import { NotificationService } from "./NotificationService";
import { Notification } from "./NotificationTypes";
import { useUser } from "@/app/ThuVien/UserContext";
import { Z_INDEX } from "@/app/constants/zIndex";
import { useAppSettings } from "@/app/ThuVien/AppSettingsContext";
import ModalProfile from "@/app/GiaoDienTong/MenuTren/NutCaNhan/ModalProfile";

// Hook âm thanh thông báo
const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dùng âm thanh nhẹ nhàng
      audioRef.current = new Audio("/sounds/hover.mp3");
      // Nếu bạn chưa có file này, hãy tạo folder public/sounds và bỏ file mp3 vào
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
  loiChao,
}: {
  nguoiDung: any;
  loiChao: string;
}) {
  const { user: contextUser } = useUser();
  const { t } = useAppSettings();
  const playSound = useNotificationSound();

  // Ưu tiên user từ context
  const nguoiDung = contextUser
    ? {
        id: contextUser.id,
        ho_ten: contextUser.ho_ten || t("profile.user"),
        email: contextUser.email,
        role:
          contextUser.userType === "nhan_su"
            ? contextUser.vi_tri_normalized
            : contextUser.phan_loai_normalized,
        permissions: contextUser.permissions,
        vi_tri: contextUser.vi_tri,
        userType: contextUser.userType,
        phan_loai: contextUser.phan_loai,
        so_dien_thoai: contextUser.so_dien_thoai,
      }
    : fallbackUser;

  const isVisitor =
    !nguoiDung ||
    nguoiDung?.userType === "guest" ||
    nguoiDung?.role === "visitor";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🟢 FETCH DATA & REALTIME SUBSCRIPTION (ĐÃ TỐI ƯU)
  useEffect(() => {
    if (!nguoiDung?.id || isVisitor) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let subscription: any = null;

    const initNotifications = async () => {
      try {
        setIsLoading(true);
        const [notifs, count] = await Promise.all([
          NotificationService.getUserNotifications(nguoiDung.id),
          NotificationService.getUnreadCount(nguoiDung.id),
        ]);

        if (isMounted) {
          setNotifications(notifs);
          setUnreadCount(count);
          setIsLoading(false);
        }

        // Đăng ký Realtime sau khi fetch xong
        subscription = NotificationService.subscribeToNotifications(
          nguoiDung.id,
          (newNotification) => {
            if (isMounted) {
              // Chơi âm thanh "Ting"
              playSound();

              setNotifications((prev) => {
                // Chặn duplicate nếu mạng lag bắn 2 lần
                if (prev.some((n) => n.id === newNotification.id)) return prev;
                return [newNotification, ...prev];
              });

              if (!newNotification.is_read) {
                setUnreadCount((prev) => prev + 1);
              }
            }
          }
        );
      } catch (error) {
        console.error("Lỗi khởi tạo thông báo:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    initNotifications();

    // Cleanup function chuẩn xác
    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [nguoiDung?.id, isVisitor]); // Dependency chỉ là ID, ko thay đổi lung tung

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update (Cập nhật giao diện trước khi gọi API cho mượt)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
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
        className={`fixed top-0 left-0 right-0 h-[85px] px-4 md:px-6 flex justify-between items-center bg-transparent transition-all duration-300 pointer-events-none`}
        style={{ zIndex: Z_INDEX.menuTren }}
      >
        {/* Góc trái */}
        <div className="flex items-center gap-2 max-w-[60%] animate-slide-down pointer-events-auto">
          <span className="text-xs md:text-sm font-medium italic text-gray-300 drop-shadow-md whitespace-nowrap hidden sm:inline-block">
            {isVisitor ? "Chào mừng," : "Xin chào,"}
          </span>
          <span
            className="font-black text-white uppercase tracking-wider drop-shadow-lg shadow-black truncate"
            style={{ fontSize: "clamp(14px, 4vw, 20px)" }}
          >
            {isVisitor ? "Quý Khách" : nguoiDung?.ho_ten}
          </span>
        </div>

        {/* Góc phải */}
        {!isVisitor && (
          <div className="flex gap-2 md:gap-3 animate-slide-down delay-100 shrink-0 pointer-events-auto items-center">
            {nguoiDung?.id && <NhacNen />}

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

            <NutVuong icon={ShoppingCart} />
            <NutVuong icon={QrCode} />

            <NutVuong
              icon={UserCircle}
              onClick={() => setShowProfile(true)}
              isActive={showProfile}
            />
          </div>
        )}
      </div>

      {mounted &&
        showProfile &&
        nguoiDung &&
        !isVisitor &&
        createPortal(
          <ModalProfile
            isOpen={true}
            onClose={() => setShowProfile(false)}
            nguoiDung={nguoiDung}
          />,
          document.body
        )}
    </>
  );
}

function NutVuong({ icon: Icon, badge, onClick, isActive }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center relative active:scale-95 transition-all backdrop-blur-sm shadow-sm group cursor-pointer
                ${
                  isActive
                    ? "bg-[#C69C6D] border border-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)]"
                    : "bg-black/40 border border-white/10 hover:bg-white/10 text-white"
                }
            `}
    >
      <Icon
        size={18}
        className={`transition-colors ${
          isActive ? "text-black" : "text-white group-hover:text-[#C69C6D]"
        }`}
      />
      {badge && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-black shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}
