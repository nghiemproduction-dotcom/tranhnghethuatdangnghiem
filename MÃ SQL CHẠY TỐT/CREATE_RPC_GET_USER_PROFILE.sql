-- =====================================================
-- TẠO RPC FUNCTION: get_user_profile_by_email
-- =====================================================
-- 
-- Mục đích: Cho phép lấy thông tin user từ email sau khi đăng nhập
-- Vấn đề: RLS chặn query trực tiếp vì auth.uid() chưa khớp với id trong bảng
-- Giải pháp: Dùng SECURITY DEFINER để bypass RLS khi load profile
--
-- =====================================================

-- Xóa function cũ nếu có
DROP FUNCTION IF EXISTS get_user_profile_by_email(TEXT);

-- Tạo function mới
CREATE OR REPLACE FUNCTION get_user_profile_by_email(p_email TEXT)
RETURNS TABLE (
    id UUID,
    ho_ten TEXT,
    email TEXT,
    so_dien_thoai TEXT,
    vi_tri TEXT,
    vi_tri_normalized TEXT,
    phan_loai TEXT,
    phan_loai_normalized TEXT,
    hinh_anh TEXT,
    trang_thai TEXT,
    source TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Quan trọng: bypass RLS
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- Normalize email
    v_email := LOWER(TRIM(p_email));
    
    -- Tìm trong bảng nhan_su trước
    RETURN QUERY
    SELECT 
        ns.id::UUID,
        ns.ho_ten::TEXT,
        ns.email::TEXT,
        ns.so_dien_thoai::TEXT,
        ns.vi_tri::TEXT,
        ns.vi_tri_normalized::TEXT,
        NULL::TEXT as phan_loai,
        NULL::TEXT as phan_loai_normalized,
        ns.hinh_anh::TEXT,
        ns.trang_thai::TEXT,
        'nhan_su'::TEXT as source
    FROM nhan_su ns
    WHERE LOWER(TRIM(ns.email)) = v_email
    LIMIT 1;
    
    -- Nếu tìm thấy trong nhan_su thì return luôn
    IF FOUND THEN
        RETURN;
    END IF;
    
    -- Không tìm thấy trong nhan_su, tìm trong khach_hang
    RETURN QUERY
    SELECT 
        kh.id::UUID,
        kh.ho_ten::TEXT,
        kh.email::TEXT,
        kh.so_dien_thoai::TEXT,
        NULL::TEXT as vi_tri,
        NULL::TEXT as vi_tri_normalized,
        kh.phan_loai::TEXT,
        kh.phan_loai_normalized::TEXT,
        NULL::TEXT as hinh_anh,
        NULL::TEXT as trang_thai,
        'khach_hang'::TEXT as source
    FROM khach_hang kh
    WHERE LOWER(TRIM(kh.email)) = v_email
    LIMIT 1;
    
    RETURN;
END;
$$;

-- Grant quyền execute cho authenticated và anon users
GRANT EXECUTE ON FUNCTION get_user_profile_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_by_email(TEXT) TO anon;

-- =====================================================
-- TEST FUNCTION
-- =====================================================
-- Chạy để test:
-- SELECT * FROM get_user_profile_by_email('nghiemproduction@gmail.com');
-- SELECT * FROM get_user_profile_by_email('vip1@example.com');

-- =====================================================
-- VERIFY
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_profile_by_email';
