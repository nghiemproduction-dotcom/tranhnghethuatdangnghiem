import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { LoggerService } from '@/app/ThuVien/LoggerService';

const logger = LoggerService.createScoped('xuLyDangXuat');

export const xuLyDangXuat = async () => {
    try {
        logger.info('Starting logout process...');
        
        // 1. Xóa dữ liệu user NGAY (không đợi signOut)
        localStorage.removeItem('USER_INFO');
        localStorage.removeItem('USER_ROLE');
        localStorage.removeItem('user_role');
        localStorage.removeItem('LA_ADMIN_CUNG');
        // Xóa token Supabase bị kẹt (tránh JSON.parse 'undefined')
        Object.keys(localStorage)
            .filter(key => key.startsWith('sb-'))
            .forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
        
        // 2. Logout Supabase (non-blocking)
        supabase.auth.signOut({ scope: 'global' }).catch(err => {
            logger.error('Supabase signOut error', err);
        });
        
        logger.info('Logout initiated, redirecting now...');
        
        // 3. Redirect immediately (không đợi signOut hoàn thành)
        window.location.replace('/');
    } catch (error) {
        logger.error('Logout failed', error);
        // Vẫn clear và redirect nếu lỗi
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/');
    }
};