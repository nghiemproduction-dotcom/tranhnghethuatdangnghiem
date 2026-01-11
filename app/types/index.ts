// ✅ User & Auth Types
export interface User {
  id: string;
  ho_ten: string;
  email: string;
  avatar_url?: string | null;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  cccd?: string | null;
  vi_tri?: string | null;
  phan_loai?: string | null;
  userType: 'nhan_su' | 'khach_hang' | 'guest';
  role?: string;
  permissions?: string[];
}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  error?: string | null;
}

// ✅ Event Types
export interface ContentVisibilityEvent extends CustomEvent {
  detail: {
    id: string;
    open: boolean;
  };
}

// ✅ Component Props Types
export interface MenuTrenProps {
  nguoiDung: User | null;
  loiChao: string;
}

export interface MenuDuoiProps {
  currentUser: User | null;
  onToggleContent: (isOpen: boolean) => void;
}

export interface NutVuongProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  onClick?: () => void;
}

// ✅ Chat Metadata Types
export interface MessageMetadata {
  edited?: boolean;
  edited_at?: string;
  pinned?: boolean;
  forwarded?: boolean;
  forwarded_from?: string;
  [key: string]: any;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  filename: string;
  size: number;
  mime_type?: string;
}

export interface ConversationMetadata {
  description?: string;
  avatar_url?: string;
  settings?: {
    mute_notifications?: boolean;
    archive?: boolean;
    pin?: boolean;
  };
  [key: string]: any;
}

// ✅ API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ✅ Chat Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  attachments?: Array<{
    id: string;
    url: string;
    type: 'image' | 'file';
    name?: string;
  }>;
  tao_luc: string;
  updated_at: string;
  reply_to_id?: string;
  reply_to?: ChatMessage;
  reactions?: Array<{
    id: string;
    emoji: string;
    user_id: string;
  }>;
}

export interface Order {
  id: string;
  ma_don: string;
  ten_khach: string | null;
  sdt: string | null;
  dia_chi: string | null;
  ghi_chu: string | null;
  trang_thai: 'moi' | 'dang_xu_ly' | 'dang_giao' | 'hoan_thanh' | 'huy';
  tong_tien: number;
  nguoi_tao: string;
  tao_luc: string;
  cap_nhat_luc: string;
}

export interface OrderItem {
  id: string;
  don_hang_id: string;
  ten_san_pham: string | null;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}
