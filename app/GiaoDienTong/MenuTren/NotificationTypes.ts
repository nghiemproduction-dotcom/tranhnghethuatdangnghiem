// Loại thông báo từ các nguồn khác nhau
export type NotificationType = 
  // Từ NGƯỜI DÙNG KHÁC
  | 'user_follow' 
  | 'user_comment' 
  | 'user_like' 
  | 'user_message' 
  | 'user_mention'
  | 'user_tag'
  // Từ HỆ THỐNG
  | 'system_update'
  | 'system_announcement'
  | 'system_alert'
  // Từ HOẠT ĐỘNG KINH DOANH
  | 'order_created'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'payment_received'
  // Từ SỰ KIỆN & WORKSHOP
  | 'event_new'
  | 'event_reminder'
  | 'workshop_new'
  | 'workshop_reminder'
  // Từ TƯỚNG CÔNG
  | 'achievement_unlocked'
  | 'milestone_reached'
  // Từ NỘI DUNG
  | 'product_new'
  | 'artwork_new'
  | 'artwork_featured'
  // Bảo mật
  | 'security_alert'
  | 'login_new_device';

export type NotificationCategory = 
  | 'from_users'      // Từ người khác
  | 'from_system'     // Từ hệ thống
  | 'from_business'   // Từ hoạt động kinh doanh
  | 'from_events'     // Từ sự kiện
  | 'from_content'    // Từ nội dung mới
  | 'from_security';  // Từ bảo mật

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  
  // Thông tin chính
  title: string;
  message: string;
  icon?: string;
  avatar?: string;
  
  // Người gửi (nếu từ người dùng khác)
  from_user_id?: string;
  from_user_name?: string;
  from_user_avatar?: string;
  
  // Liên kết
  related_id?: string;        // ID của object liên quan (product_id, order_id, etc)
  action_url?: string;        // URL để navigate
  
  // Trạng thái
  is_read: boolean;
  tao_luc: string;
  updated_at: string;
  
  // Hành động
  action_label?: string;
  action_type?: 'confirm' | 'view' | 'dismiss';
}

export interface NotificationGroup {
  category: NotificationCategory;
  label: string;
  notifications: Notification[];
  unread_count: number;
  icon: any;
  color: string;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, {
  category: NotificationCategory;
  label: string;
  icon: string;
  color: string;
  priority: number;
  description: (data?: any) => string;
}> = {
  // Từ NGƯỜI DÙNG
  'user_follow': {
    category: 'from_users',
    label: 'Theo dõi mới',
    icon: 'UserPlus',
    color: '#3B82F6',
    priority: 5,
    description: (data) => `${data?.from_user_name} đã theo dõi bạn`
  },
  'user_comment': {
    category: 'from_users',
    label: 'Bình luận mới',
    icon: 'MessageCircle',
    color: '#8B5E3C',
    priority: 4,
    description: (data) => `${data?.from_user_name} đã bình luận: "${data?.message}"`
  },
  'user_like': {
    category: 'from_users',
    label: 'Yêu thích',
    icon: 'Heart',
    color: '#EF4444',
    priority: 3,
    description: (data) => `${data?.from_user_name} yêu thích tác phẩm của bạn`
  },
  'user_message': {
    category: 'from_users',
    label: 'Tin nhắn mới',
    icon: 'Mail',
    color: '#10B981',
    priority: 6,
    description: (data) => `Tin nhắn từ ${data?.from_user_name}: "${data?.message}"`
  },
  'user_mention': {
    category: 'from_users',
    label: 'Được đề cập',
    icon: 'AtSign',
    color: '#C69C6D',
    priority: 4,
    description: (data) => `${data?.from_user_name} đã đề cập đến bạn`
  },
  'user_tag': {
    category: 'from_users',
    label: 'Được gắn thẻ',
    icon: 'Tag',
    color: '#8B5E3C',
    priority: 4,
    description: (data) => `${data?.from_user_name} đã gắn thẻ bạn`
  },

  // Từ HỆ THỐNG
  'system_update': {
    category: 'from_system',
    label: 'Cập nhật hệ thống',
    icon: 'RefreshCw',
    color: '#6366F1',
    priority: 2,
    description: (data) => 'Hệ thống đã được cập nhật với các tính năng mới'
  },
  'system_announcement': {
    category: 'from_system',
    label: 'Thông báo chung',
    icon: 'Megaphone',
    color: '#F59E0B',
    priority: 3,
    description: (data) => data?.message || 'Có thông báo chung mới từ hệ thống'
  },
  'system_alert': {
    category: 'from_system',
    label: 'Cảnh báo hệ thống',
    icon: 'AlertCircle',
    color: '#EF4444',
    priority: 5,
    description: (data) => data?.message || 'Cảnh báo từ hệ thống'
  },

  // Từ HOẠT ĐỘNG KINH DOANH
  'order_created': {
    category: 'from_business',
    label: 'Đơn hàng mới',
    icon: 'ShoppingBag',
    color: '#8B5E3C',
    priority: 4,
    description: (data) => `Đơn hàng #${data?.related_id} của bạn đã được tạo`
  },
  'order_confirmed': {
    category: 'from_business',
    label: 'Đơn hàng xác nhận',
    icon: 'CheckCircle',
    color: '#10B981',
    priority: 3,
    description: (data) => `Đơn hàng #${data?.related_id} đã được xác nhận`
  },
  'order_shipped': {
    category: 'from_business',
    label: 'Đơn hàng đã gửi',
    icon: 'Truck',
    color: '#3B82F6',
    priority: 3,
    description: (data) => `Đơn hàng #${data?.related_id} đang trên đường tới`
  },
  'order_delivered': {
    category: 'from_business',
    label: 'Đơn hàng đã giao',
    icon: 'Package',
    color: '#10B981',
    priority: 3,
    description: (data) => `Đơn hàng #${data?.related_id} đã được giao thành công`
  },
  'payment_received': {
    category: 'from_business',
    label: 'Thanh toán nhận được',
    icon: 'CreditCard',
    color: '#10B981',
    priority: 4,
    description: (data) => `Thanh toán ${data?.message} đã được xác nhận`
  },

  // Từ SỰ KIỆN & WORKSHOP
  'event_new': {
    category: 'from_events',
    label: 'Sự kiện mới',
    icon: 'Calendar',
    color: '#8B5E3C',
    priority: 2,
    description: (data) => `Sự kiện mới: ${data?.message}`
  },
  'event_reminder': {
    category: 'from_events',
    label: 'Nhắc nhở sự kiện',
    icon: 'Clock',
    color: '#F59E0B',
    priority: 4,
    description: (data) => `Sự kiện sắp diễn ra: ${data?.message}`
  },
  'workshop_new': {
    category: 'from_events',
    label: 'Workshop mới',
    icon: 'Users',
    color: '#8B5E3C',
    priority: 2,
    description: (data) => `Workshop mới: ${data?.message}`
  },
  'workshop_reminder': {
    category: 'from_events',
    label: 'Nhắc nhở workshop',
    icon: 'Bell',
    color: '#F59E0B',
    priority: 4,
    description: (data) => `Workshop sắp bắt đầu: ${data?.message}`
  },

  // Từ ĐẠT CÔNG
  'achievement_unlocked': {
    category: 'from_content',
    label: 'Thành tựu mở khóa',
    icon: 'Award',
    color: '#FBBF24',
    priority: 3,
    description: (data) => `Bạn đã mở khóa thành tựu: ${data?.message}`
  },
  'milestone_reached': {
    category: 'from_content',
    label: 'Cột mốc đạt được',
    icon: 'Target',
    color: '#FBBF24',
    priority: 3,
    description: (data) => `Chúc mừng! Bạn đã đạt ${data?.message}`
  },

  // Từ NỘI DUNG
  'product_new': {
    category: 'from_content',
    label: 'Sản phẩm mới',
    icon: 'Package',
    color: '#8B5E3C',
    priority: 1,
    description: (data) => `Tác phẩm mới: ${data?.message}`
  },
  'artwork_new': {
    category: 'from_content',
    label: 'Tác phẩm mới',
    icon: 'Image',
    color: '#8B5E3C',
    priority: 1,
    description: (data) => `Tác phẩm mới đã được thêm: ${data?.message}`
  },
  'artwork_featured': {
    category: 'from_content',
    label: 'Tác phẩm nổi bật',
    icon: 'Star',
    color: '#FBBF24',
    priority: 2,
    description: (data) => `Tác phẩm ${data?.message} đã được nổi bật`
  },

  // BẢO MẬT
  'security_alert': {
    category: 'from_security',
    label: 'Cảnh báo bảo mật',
    icon: 'Shield',
    color: '#EF4444',
    priority: 6,
    description: (data) => data?.message || 'Có hoạt động bất thường trên tài khoản'
  },
  'login_new_device': {
    category: 'from_security',
    label: 'Đăng nhập thiết bị mới',
    icon: 'Smartphone',
    color: '#F59E0B',
    priority: 5,
    description: (data) => `Đăng nhập từ thiết bị mới: ${data?.message}`
  }
};
