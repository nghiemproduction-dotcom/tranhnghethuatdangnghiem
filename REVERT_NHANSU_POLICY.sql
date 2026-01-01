-- Củng cố policy SELECT cho bảng nhan_su
-- Cho phép admin và quanly xem toàn bộ; user thường chỉ xem được dòng của mình.

-- Helper: kiểm tra user hiện tại là admin hoặc quanly
CREATE OR REPLACE FUNCTION is_current_user_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
	SELECT EXISTS (
		SELECT 1 FROM nhan_su
		WHERE LOWER(email) = LOWER(get_current_user_email())
		  AND vi_tri_normalized IN ('admin', 'quanly')
	);
$$;

-- Bật RLS nếu chưa bật
ALTER TABLE nhan_su ENABLE ROW LEVEL SECURITY;

-- Thay policy SELECT để admin/quanly thấy tất cả, người khác chỉ thấy dòng của mình
DROP POLICY IF EXISTS "nhan_su_select_policy" ON nhan_su;
CREATE POLICY "nhan_su_select_policy" ON nhan_su
	FOR SELECT
	USING (
		LOWER(email) = LOWER(get_current_user_email())
		OR is_current_user_admin_or_manager()
	);
