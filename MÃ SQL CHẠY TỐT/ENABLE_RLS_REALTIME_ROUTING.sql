-- =====================================================
-- ENABLE RLS & REALTIME CHO NHAN_SU VÀ KHACH_HANG
-- VỚI CHÍNH SÁCH PHÂN QUYỀN TRUY CẬP PHÒNG
-- =====================================================
-- 
-- LOGIC PHÂN QUYỀN:
-- 
-- 1. NHÂN SỰ (nhan_su):
--    - admin           → /phongadmin (CHỈ được vào phongadmin, KHÔNG được vào trangchu)
--    - quanly          → /phongquanly
--    - sales           → /phongsales
--    - congtacvien     → /phongctv
--    - parttime        → /phongparttime
--    - thosanxuat      → /phongtho
--    - thietke         → /phongthietke
--    ⚠️ TẤT CẢ NHÂN SỰ (KỂ CẢ ADMIN) KHÔNG ĐƯỢC VÀO /trangchu
--
-- 2. KHÁCH HÀNG (khach_hang):
--    - vip             → /phongvip + /trangchu + /phongtrunbay
--    - doitac          → /phongdoitac + /trangchu + /phongtrunbay
--    - moi             → /phongkhachmoi + /trangchu + /phongtrunbay
--    - damuahang       → /phongkhachcu + /trangchu + /phongtrunbay
--    ✅ TẤT CẢ KHÁCH HÀNG ĐỀU ĐƯỢC VÀO /trangchu VÀ /phongtrunbay
--
-- 3. KHÁCH THAM QUAN (không đăng nhập):
--    - CHỈ được vào /trangchu và /phongtrunbay
--    - KHÔNG được vào bất kỳ phòng nào khác
--
-- =====================================================

-- =====================================================
-- BƯỚC 0: KIỂM TRA CẤU TRÚC BẢNG
-- =====================================================
-- Chạy lệnh này trước để xem cột nào có trong bảng:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'nhan_su';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'khach_hang';

-- =====================================================
-- BƯỚC 1: XÓA CÁC POLICY CŨ (NẾU CÓ)
-- =====================================================

DO $$
BEGIN
    -- Xóa policies của bảng nhan_su
    DROP POLICY IF EXISTS "nhan_su_select_own" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_select_all" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_insert" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_update_own" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_delete" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_all_access" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_select_policy" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_insert_policy" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_update_policy" ON nhan_su;
    DROP POLICY IF EXISTS "nhan_su_delete_policy" ON nhan_su;
    
    -- Xóa policies của bảng khach_hang
    DROP POLICY IF EXISTS "khach_hang_select_own" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_select_all" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_insert" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_update_own" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_delete" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_all_access" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_select_policy" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_insert_policy" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_update_policy" ON khach_hang;
    DROP POLICY IF EXISTS "khach_hang_delete_policy" ON khach_hang;
    
    RAISE NOTICE '✅ Đã xóa các policy cũ';
END $$;

-- =====================================================
-- BƯỚC 2: BẬT RLS CHO CẢ HAI BẢNG
-- =====================================================

ALTER TABLE nhan_su ENABLE ROW LEVEL SECURITY;
ALTER TABLE khach_hang ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BƯỚC 3: TẠO FUNCTION LẤY EMAIL TỪ AUTH.UID()
-- =====================================================

-- Function lấy email của user đang đăng nhập
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Function kiểm tra user hiện tại có phải admin không (qua email)
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM nhan_su 
        WHERE LOWER(email) = LOWER(get_current_user_email())
        AND vi_tri_normalized = 'admin'
    );
$$;

-- Function kiểm tra user hiện tại có phải staff (admin/sales/quanly) không
CREATE OR REPLACE FUNCTION is_current_user_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM nhan_su 
        WHERE LOWER(email) = LOWER(get_current_user_email())
        AND vi_tri_normalized IN ('admin', 'sales', 'quanly')
    );
$$;

-- =====================================================
-- BƯỚC 4: TẠO RLS POLICIES CHO BẢNG NHAN_SU
-- (Sử dụng email để match thay vì auth_user_id)
-- =====================================================

-- Policy cho SELECT: Nhân sự xem được data của mình, Admin xem tất cả
CREATE POLICY "nhan_su_select_policy" ON nhan_su
    FOR SELECT
    USING (
        -- 1. Email của user đang đăng nhập khớp với email trong row
        LOWER(email) = LOWER(get_current_user_email())
        OR
        -- 2. User hiện tại là admin
        is_current_user_admin()
    );

-- Policy cho INSERT: Chỉ admin mới được thêm nhân sự
CREATE POLICY "nhan_su_insert_policy" ON nhan_su
    FOR INSERT
    WITH CHECK (
        is_current_user_admin()
    );

-- Policy cho UPDATE: Nhân sự cập nhật của mình, admin cập nhật tất cả
CREATE POLICY "nhan_su_update_policy" ON nhan_su
    FOR UPDATE
    USING (
        LOWER(email) = LOWER(get_current_user_email())
        OR
        is_current_user_admin()
    );

-- Policy cho DELETE: Chỉ admin mới được xóa
CREATE POLICY "nhan_su_delete_policy" ON nhan_su
    FOR DELETE
    USING (
        is_current_user_admin()
    );

-- =====================================================
-- BƯỚC 5: TẠO RLS POLICIES CHO BẢNG KHACH_HANG
-- =====================================================

-- Policy cho SELECT: Khách hàng xem data của mình, Staff xem tất cả
CREATE POLICY "khach_hang_select_policy" ON khach_hang
    FOR SELECT
    USING (
        -- 1. Email khớp
        LOWER(email) = LOWER(get_current_user_email())
        OR
        -- 2. User là admin/sales/quanly
        is_current_user_staff()
    );

-- Policy cho INSERT: Staff có thể thêm khách hàng
CREATE POLICY "khach_hang_insert_policy" ON khach_hang
    FOR INSERT
    WITH CHECK (
        is_current_user_staff()
    );

-- Policy cho UPDATE: Khách hàng cập nhật của mình, staff cập nhật tất cả
CREATE POLICY "khach_hang_update_policy" ON khach_hang
    FOR UPDATE
    USING (
        LOWER(email) = LOWER(get_current_user_email())
        OR
        is_current_user_staff()
    );

-- Policy cho DELETE: Chỉ admin mới được xóa
CREATE POLICY "khach_hang_delete_policy" ON khach_hang
    FOR DELETE
    USING (
        is_current_user_admin()
    );

-- =====================================================
-- BƯỚC 6: BẬT REALTIME CHO CẢ HAI BẢNG
-- =====================================================

-- Bật realtime cho bảng nhan_su (bỏ qua lỗi nếu đã có)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE nhan_su;
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'nhan_su đã có trong realtime publication';
END $$;

-- Bật realtime cho bảng khach_hang (bỏ qua lỗi nếu đã có)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE khach_hang;
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'khach_hang đã có trong realtime publication';
END $$;

-- =====================================================
-- BƯỚC 7: TẠO BẢNG ROUTING_PERMISSIONS (Lưu quyền truy cập phòng)
-- =====================================================

-- Tạo bảng lưu quyền truy cập các phòng/trang
CREATE TABLE IF NOT EXISTS routing_permissions (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL, -- 'nhan_su', 'khach_hang', 'visitor'
    role_normalized VARCHAR(50) NOT NULL, -- vi_tri_normalized hoặc phan_loai_normalized
    allowed_routes TEXT[] NOT NULL, -- Danh sách các route được phép
    default_route VARCHAR(100) NOT NULL, -- Route mặc định sau đăng nhập
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Xóa dữ liệu cũ nếu có
TRUNCATE TABLE routing_permissions;

-- =====================================================
-- BƯỚC 8: THÊM DỮ LIỆU QUYỀN TRUY CẬP CHO NHÂN SỰ
-- =====================================================

INSERT INTO routing_permissions (user_type, role_normalized, allowed_routes, default_route) VALUES
-- Admin: CHỈ được vào phongadmin, KHÔNG được vào trangchu
('nhan_su', 'admin', ARRAY['/phongadmin', '/api'], '/phongadmin'),

-- Quản Lý: Chỉ được vào phòng quản lý
('nhan_su', 'quanly', ARRAY['/phongquanly', '/api'], '/phongquanly'),

-- Sales: Chỉ được vào phòng sales
('nhan_su', 'sales', ARRAY['/phongsales', '/api'], '/phongsales'),

-- Cộng Tác Viên: Chỉ được vào phòng CTV
('nhan_su', 'congtacvien', ARRAY['/phongctv', '/api'], '/phongctv'),

-- Part-time: Chỉ được vào phòng part-time
('nhan_su', 'parttime', ARRAY['/phongparttime', '/api'], '/phongparttime'),

-- Thợ Sản Xuất: Chỉ được vào phòng thợ
('nhan_su', 'thosanxuat', ARRAY['/phongtho', '/api'], '/phongtho'),

-- Thiết Kế: Chỉ được vào phòng thiết kế
('nhan_su', 'thietke', ARRAY['/phongthietke', '/api'], '/phongthietke');

-- =====================================================
-- BƯỚC 9: THÊM DỮ LIỆU QUYỀN TRUY CẬP CHO KHÁCH HÀNG
-- =====================================================

INSERT INTO routing_permissions (user_type, role_normalized, allowed_routes, default_route) VALUES
-- VIP: Được vào phòng VIP + trang chủ + phòng trưng bày
('khach_hang', 'vip', ARRAY['/phongvip', '/trangchu', '/phongtrunbay', '/api'], '/trangchu'),

-- Đối Tác: Được vào phòng đối tác + trang chủ + phòng trưng bày
('khach_hang', 'doitac', ARRAY['/phongdoitac', '/trangchu', '/phongtrunbay', '/api'], '/trangchu'),

-- Khách Mới: Được vào phòng khách mới + trang chủ + phòng trưng bày
('khach_hang', 'moi', ARRAY['/phongkhachmoi', '/trangchu', '/phongtrunbay', '/api'], '/trangchu'),

-- Đã Mua Hàng: Được vào phòng khách cũ + trang chủ + phòng trưng bày
('khach_hang', 'damuahang', ARRAY['/phongkhachcu', '/trangchu', '/phongtrunbay', '/api'], '/trangchu');

-- =====================================================
-- BƯỚC 10: THÊM QUYỀN CHO KHÁCH THAM QUAN (VISITOR)
-- =====================================================

INSERT INTO routing_permissions (user_type, role_normalized, allowed_routes, default_route) VALUES
-- Visitor: CHỈ được vào trang chủ và phòng trưng bày
('visitor', 'guest', ARRAY['/trangchu', '/phongtrunbay', '/'], '/trangchu');

-- =====================================================
-- BƯỚC 11: TẠO RPC FUNCTION ĐỂ KIỂM TRA QUYỀN TRUY CẬP
-- =====================================================

-- Function kiểm tra user có được phép truy cập route không
CREATE OR REPLACE FUNCTION check_route_permission(
    p_user_type VARCHAR,
    p_role_normalized VARCHAR,
    p_route VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_allowed BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM routing_permissions
        WHERE user_type = p_user_type
        AND role_normalized = p_role_normalized
        AND p_route = ANY(allowed_routes)
    ) INTO v_allowed;
    
    RETURN v_allowed;
END;
$$;

-- Function lấy route mặc định cho user
CREATE OR REPLACE FUNCTION get_default_route(
    p_user_type VARCHAR,
    p_role_normalized VARCHAR
)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_route VARCHAR;
BEGIN
    SELECT default_route INTO v_route
    FROM routing_permissions
    WHERE user_type = p_user_type
    AND role_normalized = p_role_normalized
    LIMIT 1;
    
    RETURN COALESCE(v_route, '/');
END;
$$;

-- Function lấy danh sách route được phép
CREATE OR REPLACE FUNCTION get_allowed_routes(
    p_user_type VARCHAR,
    p_role_normalized VARCHAR
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_routes TEXT[];
BEGIN
    SELECT allowed_routes INTO v_routes
    FROM routing_permissions
    WHERE user_type = p_user_type
    AND role_normalized = p_role_normalized
    LIMIT 1;
    
    RETURN COALESCE(v_routes, ARRAY['/']);
END;
$$;

-- =====================================================
-- BƯỚC 12: GRANT QUYỀN EXECUTE CHO CÁC RPC FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_route_permission(VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION check_route_permission(VARCHAR, VARCHAR, VARCHAR) TO anon;

GRANT EXECUTE ON FUNCTION get_default_route(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_default_route(VARCHAR, VARCHAR) TO anon;

GRANT EXECUTE ON FUNCTION get_allowed_routes(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_allowed_routes(VARCHAR, VARCHAR) TO anon;

-- Grant select trên bảng routing_permissions
GRANT SELECT ON routing_permissions TO authenticated;
GRANT SELECT ON routing_permissions TO anon;

-- =====================================================
-- BƯỚC 13: VERIFY - KIỂM TRA KẾT QUẢ
-- =====================================================

-- Kiểm tra RLS đã bật chưa
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('nhan_su', 'khach_hang');

-- Kiểm tra policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('nhan_su', 'khach_hang');

-- Kiểm tra routing_permissions
SELECT * FROM routing_permissions ORDER BY user_type, role_normalized;

-- =====================================================
-- TỔNG KẾT ROUTING:
-- =====================================================
-- 
-- 🔴 NHÂN SỰ (CẤM VÀO TRANGCHU):
--    admin       → /phongadmin
--    quanly      → /phongquanly
--    sales       → /phongsales
--    congtacvien → /phongctv
--    parttime    → /phongparttime
--    thosanxuat  → /phongtho
--    thietke     → /phongthietke
--
-- 🟢 KHÁCH HÀNG (ĐƯỢC VÀO TRANGCHU + PHONGTRUNBAY):
--    vip        → /phongvip + /trangchu + /phongtrunbay
--    doitac     → /phongdoitac + /trangchu + /phongtrunbay
--    moi        → /phongkhachmoi + /trangchu + /phongtrunbay
--    damuahang  → /phongkhachcu + /trangchu + /phongtrunbay
--
-- 🟡 VISITOR (CHỈ ĐƯỢC):
--    guest      → /trangchu + /phongtrunbay
--
-- =====================================================
