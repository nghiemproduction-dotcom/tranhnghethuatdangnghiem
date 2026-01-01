-- QUERY 5: Kiểm tra policy mới
SELECT policyname, roles FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
