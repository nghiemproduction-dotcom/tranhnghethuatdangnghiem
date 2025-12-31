import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { LoggerService } from '@/app/ThuVien/LoggerService';

const logger = LoggerService.createScoped('xuLyDangXuat');

export const xuLyDangXuat = async () => {
    // Fallback: luôn redirect về trang chủ sau 1s để tránh kẹt UI
    let redirected = false;
    const forceRedirect = () => {
        if (redirected) return;
        redirected = true;
        window.location.href = '/';
    };
    const timeoutId = window.setTimeout(forceRedirect, 1000);

    try {
        logger.info('Starting logout process...');
        
        // Xóa sạch dữ liệu cục bộ
        localStorage.removeItem('USER_INFO');
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.removeItem('GLOBAL_FULLSCREEN_PREF'); 
        localStorage.removeItem('USER_ROLE');
        localStorage.removeItem('user_role');
        sessionStorage.clear();
        
        logger.debug('Local storage cleared');
        
        // Đăng xuất Supabase (nếu lỗi vẫn tiếp tục redirect)
        const { error } = await supabase.auth.signOut();
        if (error) {
            logger.error('Supabase signOut error', error);
        }
        
        logger.info('Logout successful, redirecting to home...');
        forceRedirect();
    } catch (error) {
        logger.error('Logout failed', error);
        forceRedirect();
    } finally {
        window.clearTimeout(timeoutId);
    }
};