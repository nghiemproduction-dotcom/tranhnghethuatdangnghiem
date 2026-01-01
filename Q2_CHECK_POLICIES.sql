-- QUERY 2: Kiểm tra policies hiện tại
SELECT policyname, roles FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
