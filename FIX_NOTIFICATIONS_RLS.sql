-- FIX 1: Kiểm tra RLS policies hiện tại trên bảng notifications
SELECT policyname, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'notifications'
ORDER BY policyname;
