-- ================================================================
-- KIỂM TRA CÁC BẢNG DỮ LIỆU CẦN CHO FRONTEND
-- Chạy file này trên Supabase SQL Editor để kiểm tra
-- ================================================================

-- 1. KIỂM TRA BẢNG TỒN TẠI (CHỈ CẦN CHẠY PHẦN NÀY TRƯỚC)
SELECT 
    table_name as bang,
    CASE 
        WHEN table_name = 'tu_van_sessions' THEN '🟢 Nút Hỗ Trợ + Tư Vấn KH'
        WHEN table_name = 'tu_van_messages' THEN '🟢 Tin nhắn chat'
        WHEN table_name = 'notifications' THEN '🟢 Nút Thông Báo'
    END as dung_cho,
    '✅ Đã tồn tại' as trang_thai
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('tu_van_sessions', 'tu_van_messages', 'notifications')

UNION ALL

SELECT 
    bang_can_co,
    dung_cho,
    '❌ CHƯA CÓ - Cần tạo!' as trang_thai
FROM (
    VALUES 
        ('tu_van_sessions', '🔴 Nút Hỗ Trợ + Tư Vấn KH'),
        ('tu_van_messages', '🔴 Tin nhắn chat'),
        ('notifications', '🔴 Nút Thông Báo')
) AS required(bang_can_co, dung_cho)
WHERE bang_can_co NOT IN (
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('tu_van_sessions', 'tu_van_messages', 'notifications')
)
ORDER BY bang;
