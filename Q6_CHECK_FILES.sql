-- QUERY 6: Đếm files trong bucket avatar
SELECT COUNT(*) as total_files FROM storage.objects WHERE bucket_id = 'avatar';

-- QUERY 7: Xem 5 file mới nhất
SELECT name, created_at FROM storage.objects WHERE bucket_id = 'avatar' ORDER BY created_at DESC LIMIT 5;
