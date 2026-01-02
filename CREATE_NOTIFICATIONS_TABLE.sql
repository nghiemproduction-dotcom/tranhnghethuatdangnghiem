-- ================================================================
-- TẠO BẢNG NOTIFICATIONS CHO NÚT THÔNG BÁO
-- Chạy file này trên Supabase SQL Editor
-- ================================================================

-- 1. TẠO BẢNG NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Loại thông báo
    type TEXT NOT NULL DEFAULT 'system_announcement',
    category TEXT NOT NULL DEFAULT 'from_system',
    
    -- Nội dung chính
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT,
    avatar TEXT,
    
    -- Người gửi (nếu từ người dùng khác)
    from_user_id UUID,
    from_user_name TEXT,
    from_user_avatar TEXT,
    
    -- Liên kết
    related_id TEXT,
    action_url TEXT,
    
    -- Trạng thái
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Hành động
    action_label TEXT,
    action_type TEXT CHECK (action_type IN ('confirm', 'view', 'dismiss')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TẠO INDEX ĐỂ QUERY NHANH
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 3. BẬT RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. TẠO POLICIES - MỞ CHO MỌI NGƯỜI ĐÃ ĐĂNG NHẬP
-- Policy SELECT: Mọi nhân sự đều đọc được thông báo của mình
DROP POLICY IF EXISTS "Nhan su doc thong bao cua minh" ON notifications;
CREATE POLICY "Nhan su doc thong bao cua minh" ON notifications
    FOR SELECT
    TO authenticated
    USING (true);  -- Mở hết cho authenticated users

-- Policy INSERT: Mọi nhân sự đều tạo được thông báo
DROP POLICY IF EXISTS "Nhan su tao thong bao" ON notifications;
CREATE POLICY "Nhan su tao thong bao" ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy UPDATE: Mọi nhân sự đều cập nhật được (đánh dấu đã đọc)
DROP POLICY IF EXISTS "Nhan su cap nhat thong bao" ON notifications;
CREATE POLICY "Nhan su cap nhat thong bao" ON notifications
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy DELETE: Mọi nhân sự đều xóa được thông báo của mình
DROP POLICY IF EXISTS "Nhan su xoa thong bao" ON notifications;
CREATE POLICY "Nhan su xoa thong bao" ON notifications
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. BẬT REALTIME CHO BẢNG
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 6. TẠO FUNCTION TỰ ĐỘNG CẬP NHẬT updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- ================================================================
-- 7. TẠO DỮ LIỆU DEMO CHO TẤT CẢ NHÂN SỰ
-- ================================================================

-- Lấy tất cả user_id từ bảng nhan_su và tạo thông báo demo
INSERT INTO notifications (user_id, type, category, title, message, icon, is_read, created_at)
SELECT 
    id as user_id,
    'system_announcement' as type,
    'from_system' as category,
    '🎉 Chào mừng đến NghiemArt!' as title,
    'Chào ' || ho_ten || '! Bạn đã kết nối thành công với hệ thống thông báo NghiemArt. Mọi cập nhật quan trọng sẽ hiển thị tại đây.' as message,
    'Bell' as icon,
    false as is_read,
    NOW() - INTERVAL '1 hour'
FROM nhan_su
WHERE id IS NOT NULL;

-- Thông báo về tính năng mới
INSERT INTO notifications (user_id, type, category, title, message, icon, action_url, action_label, action_type, is_read, created_at)
SELECT 
    id as user_id,
    'system_update' as type,
    'from_system' as category,
    '✨ Tính năng mới: Chat hỗ trợ' as title,
    'Giờ đây bạn có thể chat trực tiếp với khách hàng qua nút Hỗ Trợ. Hãy thử ngay!' as message,
    'MessageCircle' as icon,
    '/phongsales' as action_url,
    'Khám phá' as action_label,
    'view' as action_type,
    false as is_read,
    NOW() - INTERVAL '30 minutes'
FROM nhan_su
WHERE id IS NOT NULL;

-- Thông báo nhắc nhở
INSERT INTO notifications (user_id, type, category, title, message, icon, is_read, created_at)
SELECT 
    id as user_id,
    'event_reminder' as type,
    'from_events' as category,
    '📅 Nhắc nhở: Họp team cuối tuần' as title,
    'Đừng quên buổi họp tổng kết tuần vào thứ 7 lúc 9:00 sáng nhé!' as message,
    'Calendar' as icon,
    true as is_read,  -- Đã đọc
    NOW() - INTERVAL '2 days'
FROM nhan_su
WHERE id IS NOT NULL;

-- Thông báo đơn hàng mẫu cho Sales
INSERT INTO notifications (user_id, type, category, title, message, icon, related_id, action_url, is_read, created_at)
SELECT 
    id as user_id,
    'order_created' as type,
    'from_business' as category,
    '🛒 Đơn hàng mới #DH001' as title,
    'Khách hàng Nguyễn Văn A vừa đặt đơn hàng trị giá 2.500.000đ. Kiểm tra ngay!' as message,
    'ShoppingCart' as icon,
    'DH001' as related_id,
    '/phongsales' as action_url,
    false as is_read,
    NOW() - INTERVAL '15 minutes'
FROM nhan_su
WHERE vi_tri IN ('sales', 'quan_ly', 'admin');

-- Thông báo bảo mật
INSERT INTO notifications (user_id, type, category, title, message, icon, is_read, created_at)
SELECT 
    id as user_id,
    'security_alert' as type,
    'from_security' as category,
    '🔐 Đăng nhập từ thiết bị mới' as title,
    'Phát hiện đăng nhập từ Windows 10 - Chrome. Nếu không phải bạn, hãy đổi mật khẩu ngay.' as message,
    'Shield' as icon,
    true as is_read,
    NOW() - INTERVAL '5 days'
FROM nhan_su
WHERE id IS NOT NULL
LIMIT 5;  -- Chỉ tạo cho 5 người

-- ================================================================
-- 8. KIỂM TRA KẾT QUẢ
-- ================================================================
SELECT 
    '✅ Tạo bảng notifications thành công!' as ket_qua,
    COUNT(*) as so_thong_bao_da_tao,
    COUNT(DISTINCT user_id) as so_user_co_thong_bao
FROM notifications;
