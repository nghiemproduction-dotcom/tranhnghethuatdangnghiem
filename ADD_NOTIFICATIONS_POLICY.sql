-- FIX 3: Thêm policy cho phép authenticated user xem notifications
-- Nếu policy đã tồn tại, Supabase sẽ báo lỗi (bỏ qua)

CREATE POLICY "Authenticated users can select notifications"
ON notifications FOR SELECT
USING (auth.role() = 'authenticated');

-- Alternative: Cho phép public xem tất cả (nếu muốn)
CREATE POLICY "Public can select notifications"
ON notifications FOR SELECT
USING (true);
