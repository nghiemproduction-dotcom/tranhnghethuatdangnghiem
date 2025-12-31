-- =====================================================
-- TEST RPC FUNCTIONS - Kiểm tra nhanh
-- =====================================================

-- Test 1: Kiểm tra bảng routing_permissions có data không
SELECT * FROM routing_permissions ORDER BY user_type, role_normalized;

-- Test 2: Test RPC get_default_route cho admin
SELECT get_default_route('nhan_su', 'admin');

-- Test 3: Test RPC get_default_route cho sales
SELECT get_default_route('nhan_su', 'sales');

-- Test 4: Test RPC get_default_route cho khách VIP
SELECT get_default_route('khach_hang', 'vip');

-- Test 5: Test RPC check_route_permission
SELECT check_route_permission('nhan_su', 'admin', '/phongadmin');
SELECT check_route_permission('nhan_su', 'admin', '/trangchu');

-- Test 6: Test RPC get_user_profile_by_email (thay email thật)
SELECT * FROM get_user_profile_by_email('nghiemproduction@gmail.com');

-- Test 7: Kiểm tra cột normalized trong bảng nhan_su
SELECT 
    ho_ten, 
    email, 
    vi_tri, 
    vi_tri_normalized 
FROM nhan_su 
WHERE email = 'nghiemproduction@gmail.com';

-- Test 8: Kiểm tra cột normalized trong bảng khach_hang
SELECT 
    ho_ten, 
    email, 
    phan_loai, 
    phan_loai_normalized 
FROM khach_hang 
LIMIT 5;
