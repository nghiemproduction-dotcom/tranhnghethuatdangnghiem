-- QUERY 3: Xóa TẤT CẢ policy cũ
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_select" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar-select" ON storage.objects;
DROP POLICY IF EXISTS "avatar-insert" ON storage.objects;
DROP POLICY IF EXISTS "avatar-update" ON storage.objects;
DROP POLICY IF EXISTS "avatar-delete" ON storage.objects;
DROP POLICY IF EXISTS "avatar_full_access" ON storage.objects;

SELECT 'All policies deleted' as status;
