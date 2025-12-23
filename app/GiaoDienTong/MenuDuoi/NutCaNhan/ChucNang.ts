import { supabase } from '@/app/ThuVien/ketNoiSupabase';

export const xuLyDangXuat = async () => {
    if (!confirm('Bạn có muốn đăng xuất khỏi hệ thống?')) return;
    
    // Xóa sạch dữ liệu cục bộ
    localStorage.removeItem('USER_INFO');
    localStorage.removeItem('LA_ADMIN_CUNG');
    localStorage.removeItem('GLOBAL_FULLSCREEN_PREF'); 
    localStorage.removeItem('USER_ROLE');
    sessionStorage.clear();
    
    // Đăng xuất Supabase
    await supabase.auth.signOut();
    
    // Chuyển hướng
    window.location.href = '/'; 
};