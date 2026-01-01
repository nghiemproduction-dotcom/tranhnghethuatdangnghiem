import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { LoggerService } from '@/app/ThuVien/LoggerService';

const logger = LoggerService.createScoped('xuLyDangXuat');

export const xuLyDangXuat = async () => {
    try {
        logger.info('🚪 Bắt đầu quá trình đăng xuất...');
        
        // 1. Xóa NGAY TẤT CẢ dữ liệu user trong localStorage
        localStorage.removeItem('USER_INFO');
        localStorage.removeItem('USER_ROLE');
        localStorage.removeItem('user_role');
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.removeItem('SAVED_EMAIL');
        
        // Xóa tất cả token Supabase (bắt đầu bằng 'sb-')
        Object.keys(localStorage)
            .filter(key => key.startsWith('sb-'))
            .forEach(key => localStorage.removeItem(key));
        
        // Xóa sessionStorage
        sessionStorage.clear();
        
        // Xóa cookie visitor nếu có
        document.cookie = 'VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax';
        
        logger.info('✅ Đã xóa sạch localStorage và sessionStorage');
        
        // 2. Logout Supabase (scope: global để logout tất cả devices)
        try {
            await supabase.auth.signOut({ scope: 'global' });
            logger.info('✅ Supabase signOut thành công');
        } catch (err) {
            logger.error('Supabase signOut error (ignored)', err);
        }
        
        logger.info('🏃 Chuyển hướng về trang chủ để đăng nhập lại...');
        
        // 3. Redirect về trang chủ (bắt buộc đăng nhập lại)
        // Dùng window.location.href thay vì replace để đảm bảo refresh hoàn toàn
        window.location.href = '/';
        
    } catch (error) {
        logger.error('❌ Lỗi đăng xuất', error);
        // Vẫn clear và redirect nếu lỗi
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    }
};