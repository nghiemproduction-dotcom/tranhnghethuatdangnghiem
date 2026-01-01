-- ============================================
-- KIỂM TRA CHI TIẾT POLICIES CỦA BUCKET AVATAR
-- ============================================

-- 1. Kiểm tra bucket 'avatar' tồn tại không
SELECT 'BƯỚC 1: KIỂM TRA BUCKET' as step;
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'avatar';

-- 2. Kiểm tra RLS status
SELECT 'BƯỚC 2: KIỂM TRA RLS' as step;
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Liệt kê tất cả policies trên storage.objects
SELECT 'BƯỚC 3: LIỆT KÊ TẤT CẢ POLICIES' as step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 4. Xóa TẤT CẢ policy cũ (HARD RESET)
SELECT 'BƯỚC 4: XÓA TẤT CẢ POLICY CŨ' as step;
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_select" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar-select" ON storage.objects;
DROP POLICY IF EXISTS "avatar-insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar-update" ON storage.objects;
DROP POLICY IF EXISTS "avatar-delete" ON storage.objects;

-- 5. Tạo 1 policy duy nhất - MỞ TOÀN QUYỀN
SELECT 'BƯỚC 5: TẠO POLICY MỚI - MỞ TOÀN QUYỀN' as step;

-- Policy cho phép MỌICÔNG VIỆC trên bucket avatar (không cần auth)
CREATE POLICY "avatar_full_access"
ON storage.objects
FOR ALL
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- 6. Kiểm tra lại policies
SELECT 'BƯỚC 6: KIỂM TRA LẠI POLICIES SAU KHI TẠO' as step;
SELECT 
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 7. Kiểm tra bucket status cuối cùng
SELECT 'BƯỚC 7: TRẠNG THÁI BUCKET CUỐI CÙNG' as step;
SELECT 
    id as bucket_id,
    name,
    public,
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE id = 'avatar';

-- 8. Tính năng chẩn đoán: Thử insert test record
SELECT 'BƯỚC 8: TEST INSERT' as step;
-- LƯU Ý: Nếu INSERT thành công thì policy đúng!
-- Nếu INSERT lỗi "permission denied" thì policy sai!

-- Xem nội dung bucket avatar
SELECT 'BƯỚC 9: KIỂM TRA OBJECTS TRONG BUCKET AVATAR' as step;
SELECT 
    id,
    name,
    bucket_id,
    created_at,
    updated_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'avatar'
LIMIT 10;

SELECT '✅ CHECK COMPLETE!' as final_status;
