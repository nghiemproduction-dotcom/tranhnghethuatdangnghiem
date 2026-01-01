-- Thêm cột hinh_anh vào bảng khach_hang
-- Chạy SQL này trong Supabase Dashboard > SQL Editor

ALTER TABLE "khach_hang" 
ADD COLUMN IF NOT EXISTS "hinh_anh" TEXT;

-- Kiểm tra kết quả
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'khach_hang';
