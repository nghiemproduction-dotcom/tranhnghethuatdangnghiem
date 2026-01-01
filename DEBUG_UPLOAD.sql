-- ============================================
-- DEBUG UPLOAD ISSUE - STEP BY STEP
-- ============================================

-- Chạy từng phần này riêng lẻ để thấy kết quả

-- === BƯỚC 1: Kiểm tra bucket tồn tại ===
SELECT 'BUCKET DETAILS:' as info;
SELECT * FROM storage.buckets WHERE id = 'avatar';

-- === BƯỚC 2: Kiểm tra RLS ===
SELECT 'RLS STATUS:' as info;
SELECT * FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects';

-- === BƯỚC 3: Liệt kê TẤT CẢ policies hiện tại ===
SELECT 'CURRENT POLICIES:' as info;
SELECT policyname, roles::text, qual, with_check FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- === BƯỚC 4: Xóa tất cả policy cũ ===
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar_public_select" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar_public_insert" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar_public_update" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar_public_delete" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar-select" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar-insert" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar-update" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar-delete" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "avatar_full_access" ON storage.objects CASCADE;

SELECT 'OLD POLICIES DELETED' as status;

-- === BƯỚC 5: Tạo policy mới - CHỈ INSERT ===
CREATE POLICY "avatar_insert_public"
ON storage.objects 
FOR INSERT 
TO authenticated, anon
WITH CHECK (bucket_id = 'avatar');

-- === BƯỚC 6: Tạo policy cho SELECT ===
CREATE POLICY "avatar_select_public"
ON storage.objects 
FOR SELECT 
TO authenticated, anon
USING (bucket_id = 'avatar');

-- === BƯỚC 7: Tạo policy cho UPDATE ===
CREATE POLICY "avatar_update_public"
ON storage.objects 
FOR UPDATE 
TO authenticated, anon
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- === BƯỚC 8: Kiểm tra lại policies mới ===
SELECT 'NEW POLICIES CREATED:' as status;
SELECT policyname, roles::text FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- === BƯỚC 9: Kiểm tra bucket một lần nữa ===
SELECT 'FINAL BUCKET STATUS:' as info;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'avatar';

-- === BƯỚC 10: Đếm objects trong bucket ===
SELECT 'OBJECTS IN AVATAR BUCKET:' as info;
SELECT COUNT(*) as total_files FROM storage.objects WHERE bucket_id = 'avatar';
SELECT name, created_at FROM storage.objects WHERE bucket_id = 'avatar' ORDER BY created_at DESC LIMIT 5;
