import { supabase } from '@/utils/supabase/client';

export type UserInfo = {
  id: string;
  email: string;
  ho_ten?: string | null;
  so_dien_thoai?: string | null;
  hinh_anh?: string | null;
  userType: 'nhan_su' | 'khach_hang' | 'guest';
  role: string;
  permissions: { isAdmin: boolean };
  vi_tri_normalized?: string | null;
  phan_loai_normalized?: string | null;
  vi_tri?: string | null;
  phan_loai?: string | null;
};

export class AuthService {
  static async identifyUser(email: string): Promise<UserInfo | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`/api/auth/identify?email=${encodeURIComponent(cleanEmail)}`);
      if (!res.ok) {
        console.warn('[AuthService.identifyUser] identify API failed', await res.text());
        return null;
      }

      const { user } = await res.json();
      return user as UserInfo | null;
    } catch (error) {
      console.error('AuthService.identifyUser error', error);
      return null;
    }
  }

  static async getCurrentUser(): Promise<UserInfo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;
    return await this.identifyUser(user.email);
  }

  static async signOut() {
    return await supabase.auth.signOut();
  }

  static async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.permissions.isAdmin ?? false;
  }

  // ✅ [MỚI] Thêm hàm này để sửa lỗi ở layout
  static async getUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (e) {
      return null;
    }
  }
}