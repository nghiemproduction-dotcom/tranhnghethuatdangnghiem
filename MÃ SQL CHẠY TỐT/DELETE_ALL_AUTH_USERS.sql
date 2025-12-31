-- ============================================
-- 🔴 XÓA TẤT CẢ USERS TRONG SUPABASE AUTH
-- ============================================
-- ⚠️ CẢNH BÁO: Thao tác này KHÔNG THỂ HOÀN TÁC!
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================

-- BƯỚC 1: Xóa tất cả sessions (bắt buộc trước)
DELETE FROM auth.sessions;

-- BƯỚC 2: Xóa tất cả refresh tokens
DELETE FROM auth.refresh_tokens;

-- BƯỚC 3: Xóa tất cả identities (social login links)
DELETE FROM auth.identities;

-- BƯỚC 4: Xóa tất cả MFA factors (nếu có)
DELETE FROM auth.mfa_factors;

-- BƯỚC 5: Xóa tất cả users
DELETE FROM auth.users;

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================
SELECT 'Users còn lại:' as info, COUNT(*) as count FROM auth.users;

-- ============================================
-- ✅ SAU KHI CHẠY:
-- - Tất cả users sẽ bị xóa
-- - Tất cả sessions sẽ bị xóa  
-- - Users đang đăng nhập sẽ bị logout
-- - Cần tạo user mới để đăng nhập lại
-- ============================================
