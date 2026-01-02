"use client";
import { useEffect } from "react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";

export default function StaffPresence() {
  const { user } = useUser();

  useEffect(() => {
    // Chỉ chạy nếu là nhân sự
    if (!user || user.userType !== "nhan_su") return;

    // Xác định role chuẩn để gửi đi
    // Ưu tiên vi_tri_normalized, nếu không có thì lấy role từ context
    const roleToSend =
      (user as any).vi_tri_normalized || user.role || "nhan_su";

    // Tạo kênh 'online-users'
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id, // ID định danh duy nhất
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        // Debug chơi thôi
        // console.log('📡 Staff signal sent:', user.ho_ten);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Gửi thông tin nhân viên lên kênh
          await channel.track({
            id: user.id,
            name: user.ho_ten,
            role: roleToSend, // Quan trọng: Gửi role chuẩn để bên kia lọc
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
}
