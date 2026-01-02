import { Notification, NotificationType } from "./NotificationTypes";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export class NotificationService {
  // ... (Giữ nguyên các hàm getUserNotifications, getUnreadCount, create, markRead, delete...)

  static async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Notification[]) || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }

  // 🟢 SỬA LẠI HÀM SUBSCRIBE CHO AN TOÀN
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    // Tạo channel với ID duy nhất để tránh trùng lặp
    const channelId = `notifications:${userId}:${Date.now()}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Validate dữ liệu trước khi callback
          if (payload.new && payload.new.id) {
            callback(payload.new as Notification);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`🔔 Đã kết nối thông báo cho user ${userId}`);
        }
      });

    // Trả về object chứa hàm unsubscribe an toàn
    return {
      unsubscribe: () => {
        console.log(`🔕 Hủy kết nối thông báo ${channelId}`);
        supabase.removeChannel(channel);
      },
    };
  }
}
