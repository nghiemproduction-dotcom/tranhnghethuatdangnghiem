import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { DataNormalizer } from '@/app/ThuVien/DataNormalizer';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU CHUẨN ---

// Quyền hạn mặc định (có thể mở rộng sau này)
const DEFAULT_PERMISSIONS = {
  isAdmin: false,
  canView: true,
  canEdit: false,
  canDelete: false,
};

export interface UserInfo {
  id: string;
  email: string;
  ho_ten: string | null;
  so_dien_thoai: string | null;
  hinh_anh?: string | null;
  
  // Phân loại quan trọng
  userType: 'nhan_su' | 'khach_hang';
  role: string; // Đây là giá trị quan trọng nhất để định tuyến (VD: 'admin', 'sales', 'khtrongtam')
  
  // Các trường chi tiết từ DB (để hiển thị)
  vi_tri?: string | null;            // VD: "Thợ Sản Xuất"
  vi_tri_normalized?: string | null; // VD: "thosanxuat"
  phan_loai?: string | null;         // VD: "KH Trọng tâm"
  phan_loai_normalized?: string | null; // VD: "khtrongtam"
  
  permissions: typeof DEFAULT_PERMISSIONS;
}

export class AuthService {

  /**
   * 1. HÀM CỐT LÕI: NHẬN DIỆN USER QUA EMAIL
   * Logic: Check bảng nhan_su trước -> Nếu không có thì check khach_hang
   */
  static async identifyUser(email: string): Promise<UserInfo | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    try {
      // --- BƯỚC 1: TÌM TRONG BẢNG NHÂN SỰ ---
      const { data: nhanSu, error: errNS } = await supabase
        .from('nhan_su')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (nhanSu && !errNS) {
        // Nếu là nhân sự, role chính là vi_tri_normalized
        // Nếu vi_tri_normalized null, fallback về 'parttime' cho an toàn
        const roleCode = nhanSu.vi_tri_normalized || 'parttime';
        
        return {
          id: nhanSu.id,
          email: nhanSu.email,
          ho_ten: nhanSu.ho_ten,
          so_dien_thoai: nhanSu.so_dien_thoai,
          hinh_anh: nhanSu.hinh_anh,
          
          userType: 'nhan_su',
          role: roleCode, // <-- Dùng cái này để tra bảng routing_permissions
          
          vi_tri: nhanSu.vi_tri,
          vi_tri_normalized: roleCode,
          
          permissions: {
            ...DEFAULT_PERMISSIONS,
            isAdmin: roleCode === 'admin' || roleCode === 'quanly'
          }
        };
      }

      // --- BƯỚC 2: TÌM TRONG BẢNG KHÁCH HÀNG ---
      const { data: khachHang, error: errKH } = await supabase
        .from('khach_hang')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (khachHang && !errKH) {
        // Nếu là khách hàng, role chính là phan_loai_normalized
        // VD: 'vip', 'doitac', 'khtrongtam'
        const roleCode = khachHang.phan_loai_normalized || 'moi';

        return {
          id: khachHang.id,
          email: khachHang.email,
          ho_ten: khachHang.ho_ten,
          so_dien_thoai: khachHang.so_dien_thoai,
          
          userType: 'khach_hang',
          role: roleCode, // <-- Dùng cái này để tra bảng routing_permissions

          phan_loai: khachHang.phan_loai,
          phan_loai_normalized: roleCode,
          
          permissions: DEFAULT_PERMISSIONS
        };
      }

      // Không tìm thấy ở đâu cả
      return null;

    } catch (error) {
      console.error('AuthService: Lỗi định danh user:', error);
      return null;
    }
  }

  /**
   * 2. HÀM HỖ TRỢ: LẤY USER HIỆN TẠI TỪ SESSION
   * Dùng cho Client Side (UserContext)
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    // Gọi hàm identify ở trên để lấy thông tin chi tiết từ DB
    return await this.identifyUser(user.email);
  }

  /**
   * 3. HÀM RPC (QUAN TRỌNG CHO CONGDANGNHAP.TSX)
   * Hàm này gọi RPC trong database để bypass RLS nếu cần thiết,
   * hoặc đơn giản là tái sử dụng logic identifyUser ở trên.
   * Để đảm bảo tương thích với code cũ của bạn, tôi viết hàm này wrap lại logic trên.
   */
  static async getUserByEmailWithRpc(email: string): Promise<UserInfo | null> {
    // Ưu tiên dùng logic identifyUser ở trên vì nó query trực tiếp bảng chuẩn
    return await this.identifyUser(email);
    
    /* Ghi chú: Nếu bạn thực sự muốn dùng RPC (Database Function) 'get_user_profile_by_email', 
       hãy đảm bảo function đó trong Postgres trả về đúng cấu trúc cột như mong đợi.
       Hiện tại, query trực tiếp (client-side query) là an toàn và dễ debug nhất 
       với cấu trúc bảng bạn vừa cung cấp.
    */
  }

  /**
   * 4. ĐĂNG XUẤT
   */
  static async signOut() {
    return await supabase.auth.signOut();
  }

  /**
   * 5. HELPER: KIỂM TRA QUYỀN ADMIN
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.permissions.isAdmin ?? false;
  }
}