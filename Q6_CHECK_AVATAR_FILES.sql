-- QUERY 6: Kiểm tra xem có file nào trong bucket 'avatar' không
SELECT name, bucket_id, owner, created_at, updated_at, metadata 
FROM storage.objects 
WHERE bucket_id = 'avatar' 
ORDER BY created_at DESC 
LIMIT 50;
