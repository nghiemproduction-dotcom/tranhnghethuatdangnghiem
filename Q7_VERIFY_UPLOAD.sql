-- Kiểm tra file vừa upload
SELECT name, bucket_id, owner, created_at, metadata
FROM storage.objects 
WHERE bucket_id = 'avatar' 
ORDER BY created_at DESC 
LIMIT 10;
