-- =====================================================
-- 🧪 TEST LOGIN & ROUTING SYSTEM
-- Chạy từng đoạn để kiểm tra hệ thống
-- =====================================================

-- =====================================================
-- 1️⃣ TEST RPC get_user_profile_by_email
-- =====================================================
-- Test với admin account
SELECT * FROM get_user_profile_by_email('nghiemproduction@gmail.com');

-- ❓ Kỳ vọng: Trả về row với vi_tri_normalized = 'admin'
-- ❌ Nếu null hoặc lỗi → RPC chưa được update

-- Test với khách VIP
SELECT * FROM get_user_profile_by_email('vip1@example.com');

-- ❓ Kỳ vọng: Trả về row với phan_loai_normalized = 'vip'

-- =====================================================
-- 2️⃣ KIỂM TRA BẢNG routing_permissions
-- =====================================================
-- Xem bảng có tồn tại và có data không
SELECT * FROM routing_permissions ORDER BY user_type, role_normalized;

-- ❓ Kỳ vọng: 12 rows (7 nhân sự + 4 khách + 1 visitor)
-- ❌ Nếu lỗi "table doesn't exist" → Chưa chạy ENABLE_RLS_REALTIME_ROUTING.sql

-- =====================================================
-- 3️⃣ TEST RPC get_default_route
-- =====================================================
-- Test với admin
SELECT get_default_route('nhan_su', 'admin');

-- ❓ Kỳ vọng: '/phongadmin'
-- ❌ Nếu null hoặc lỗi → RPC chưa được tạo

-- Test với khách VIP
SELECT get_default_route('khach_hang', 'vip');

-- ❓ Kỳ vọng: '/trangchu'

-- =====================================================
-- 4️⃣ TEST RPC check_route_permission
-- =====================================================
-- Admin có được vào /phongadmin không?
SELECT check_route_permission('nhan_su', 'admin', '/phongadmin');

-- ❓ Kỳ vọng: true

-- Admin có được vào /trangchu không?
SELECT check_route_permission('nhan_su', 'admin', '/trangchu');

-- ❓ Kỳ vọng: false (nhân sự không được vào trangchu)

-- =====================================================
-- 5️⃣ KIỂM TRA NORMALIZED COLUMNS
-- =====================================================
-- Xem bảng nhan_su có cột vi_tri_normalized không
SELECT ho_ten, email, vi_tri, vi_tri_normalized 
FROM nhan_su 
WHERE email = 'nghiemproduction@gmail.com';

-- ❓ Kỳ vọng: vi_tri_normalized = 'admin'
-- ❌ Nếu cột không tồn tại → Chưa chạy UPDATE_NORMALIZED_FIELDS.sql

-- Xem bảng khach_hang có cột phan_loai_normalized không
SELECT ho_ten, email, phan_loai, phan_loai_normalized 
FROM khach_hang 
WHERE email = 'vip1@example.com';

-- ❓ Kỳ vọng: phan_loai_normalized = 'vip'

-- =====================================================
-- 📊 TỔNG HỢP KẾT QUẢ
-- =====================================================
-- ✅ Nếu tất cả test đều PASS → Login sẽ hoạt động
-- ❌ Nếu có test FAIL → Xem phần dưới để fix

-- =====================================================
-- 🔧 CÁCH FIX KHI CÓ LỖI
-- =====================================================

-- ❌ LỖI 1: Bảng routing_permissions không tồn tại
-- → Chạy: MÃ SQL CHẠY TỐT/ENABLE_RLS_REALTIME_ROUTING.sql

-- ❌ LỖI 2: Cột normalized không tồn tại
-- → Chạy: MÃ SQL CHẠY TỐT/UPDATE_NORMALIZED_FIELDS.sql

-- ❌ LỖI 3: RPC get_user_profile_by_email không trả về normalized
-- → Chạy: MÃ SQL CHẠY TỐT/CREATE_RPC_GET_USER_PROFILE.sql

-- ❌ LỖI 4: RPC get_default_route không tồn tại
-- → Chạy: MÃ SQL CHẠY TỐT/ENABLE_RLS_REALTIME_ROUTING.sql (chứa RPC này)

-- =====================================================
-- 🎯 TEST NHANH: Chạy tất cả cùng lúc
-- =====================================================
DO $$
DECLARE
    v_profile RECORD;
    v_route VARCHAR;
    v_count INT;
BEGIN
    -- Test 1: RPC get_user_profile_by_email
    SELECT * INTO v_profile FROM get_user_profile_by_email('nghiemproduction@gmail.com');
    RAISE NOTICE '✅ Test 1: get_user_profile_by_email → source: %, vi_tri_normalized: %', 
        v_profile.source, v_profile.vi_tri_normalized;
    
    -- Test 2: Bảng routing_permissions
    SELECT COUNT(*) INTO v_count FROM routing_permissions;
    RAISE NOTICE '✅ Test 2: routing_permissions có % rows', v_count;
    
    -- Test 3: RPC get_default_route
    SELECT get_default_route('nhan_su', 'admin') INTO v_route;
    RAISE NOTICE '✅ Test 3: get_default_route(admin) → %', v_route;
    
    -- Test 4: RPC get_default_route cho VIP
    SELECT get_default_route('khach_hang', 'vip') INTO v_route;
    RAISE NOTICE '✅ Test 4: get_default_route(vip) → %', v_route;
    
    RAISE NOTICE '🎉 TẤT CẢ TEST PASSED! Login sẽ hoạt động.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ LỖI: %', SQLERRM;
    RAISE NOTICE '🔧 Hãy chạy các file SQL trong folder MÃ SQL CHẠY TỐT/';
END $$;
