-- ============================================
-- COMPLETE FIX: AVATAR BUCKET ON SUPABASE
-- ============================================

-- 1. Tạo/Kiểm tra Bucket 'avatar' (PUBLIC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatar', 
  'avatar', 
  true, 
  10485760, -- 10MB
  '{}'
)
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 10485760;

-- 2. Xóa tất cả policy cũ
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "avatar-select" ON storage.objects;
DROP POLICY IF EXISTS "avatar-insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar-update" ON storage.objects;
DROP POLICY IF EXISTS "avatar-delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar-public-read" ON storage.objects;
DROP POLICY IF EXISTS "avatar-public-write" ON storage.objects;

-- 3. POLICY ĐƠNGIẢN: MỞ TOÀN QUYỀN CHO BUCKET 'avatar'
-- SELECT (Đọc công khai)
CREATE POLICY "avatar_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar');

-- INSERT (Tải lên công khai - không cần auth)
CREATE POLICY "avatar_public_insert"
ON storage.objects FOR INSERT
TO public, authenticated
WITH CHECK (bucket_id = 'avatar');

-- UPDATE (Cập nhật công khai)
CREATE POLICY "avatar_public_update"
ON storage.objects FOR UPDATE
TO public, authenticated
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- DELETE (Xóa công khai)
CREATE POLICY "avatar_public_delete"
ON storage.objects FOR DELETE
TO public, authenticated
USING (bucket_id = 'avatar');

-- 4. Kiểm tra bucket
SELECT 'Setup complete!' as status, 
       id, 
       name, 
       public, 
       file_size_limit 
FROM storage.buckets 
WHERE id = 'avatar';
