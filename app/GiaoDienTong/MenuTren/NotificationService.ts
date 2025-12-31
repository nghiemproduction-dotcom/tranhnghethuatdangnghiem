import { Notification, NotificationType } from './NotificationTypes';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

export class NotificationService {
  // Lấy thông báo của người dùng
  static async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as Notification[]) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Lấy số lượng thông báo chưa đọc
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Tạo thông báo mới
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Đánh dấu thông báo đã đọc
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Xóa thông báo
  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Xóa tất cả thông báo
  static async deleteAllNotifications(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
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
  }

  // Helper: Tạo thông báo theo category
  static async notifyUserInteraction(
    toUserId: string,
    fromUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
  ) {
    return this.createNotification({
      user_id: toUserId,
      type,
      category: type.startsWith('user_') ? 'from_users' : type.startsWith('order_') ? 'from_business' : 'from_system',
      title,
      message,
      from_user_id: fromUserId,
      from_user_name: fromUserName,
      from_user_avatar: fromUserAvatar,
      related_id: relatedId,
      is_read: false,
    });
  }

  // Helper: Tạo thông báo hệ thống
  static async notifySystem(
    toUserId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string
  ) {
    return this.createNotification({
      user_id: toUserId,
      type,
      category: type.startsWith('system_') ? 'from_system' : 'from_business',
      title,
      message,
      related_id: relatedId,
      is_read: false,
    });
  }
}
