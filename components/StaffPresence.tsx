"use client";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/lib/UserContext";

// ✅ [MỚI] Nhận props userId từ layout truyền vào
export default function StaffPresence({ userId }: { userId?: string }) {
  const { user: contextUser } = useUser();
  
  // Ưu tiên dùng user từ context (nếu có), nếu không thì dùng từ props (server truyền xuống)
  // Logic: Ở layout user từ context có thể null lúc đầu, nên userId từ server là fallback tốt.
  // Tuy nhiên code logic cũ dùng `user` object đầy đủ, nên ta cần mapping cẩn thận.
  
  const user = contextUser || (userId ? { id: userId, userType: 'nhan_su', role: 'staff' } : null);

  useEffect(() => {
    // Chỉ chạy nếu có user và (là nhân sự HOẶC có userId truyền vào ngầm định là nhân sự)
    if (!user) return;
    
    // Check thêm userType nếu user lấy từ context đầy đủ
    if ((user as any).userType && (user as any).userType !== "nhan_su") return;

    // Xác định role
    const roleToSend = (user as any).vi_tri_normalized || (user as any).role || "nhan_su";
    const userName = (user as any).ho_ten || "Nhân viên";

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {})
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            name: userName,
            role: roleToSend,
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