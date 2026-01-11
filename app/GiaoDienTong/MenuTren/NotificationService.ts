// File: app/GiaoDienTong/MenuTren/NotificationService.ts
import { createClient } from "@/utils/supabase/client";
import { Notification } from "./NotificationTypes";

// Khởi tạo client 1 lần bên ngoài
const supabase = createClient();

export const NotificationService = {
  // Lấy danh sách thông báo
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    // 1. Kiểm tra ID rỗng (Tránh gọi khi vừa logout)
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false) // Chỉ lấy tin chưa đọc để tối ưu
        .order("tao_luc", { ascending: false })
        .limit(20);

      // 2. Xử lý lỗi nhẹ nhàng hơn
      if (error) {
        // Nếu lỗi là do bảng không tồn tại hoặc lỗi mạng khi logout -> Bỏ qua, trả về rỗng
        if (error.code === 'PGRST205' || error.message.includes('fetch')) {
           return [];
        }
        console.warn("Lỗi lấy thông báo (không nghiêm trọng):", error.message);
        return [];
      }

      return (data as Notification[]) || [];
    } catch (err) {
      // 3. Im lặng hoàn toàn khi logout gây ngắt kết nối
      return [];
    }
  },

  // Đếm số lượng chưa đọc (Cũng sửa tương tự)
  getUnreadCount: async (userId: string): Promise<number> => {
    if (!userId) return 0;
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) return 0;
      return count || 0;
    } catch (error) {
      return 0;
    }
  },

  // ... (Các hàm markAsRead, markAllAsRead giữ nguyên, nhưng thêm try/catch nếu cần)
  markAsRead: async (id: string) => {
    try {
        await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (e) {}
  },

  markAllAsRead: async (userId: string) => {
    try {
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
    } catch (e) {}
  },

  deleteNotification: async (id: string) => {
    try {
        await supabase.from("notifications").delete().eq("id", id);
    } catch (e) {}
  },
  
  // Hàm đăng ký real-time (Giữ nguyên hoặc thêm check)
  subscribeToNotifications: (userId: string, callback: (n: Notification) => void) => {
    if (!userId) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};