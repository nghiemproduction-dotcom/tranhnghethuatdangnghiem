-- QUERY 4: Tạo 1 policy duy nhất - MỞ TOÀN QUYỀN (no auth)
CREATE POLICY "avatar_anyone"
ON storage.objects 
FOR ALL
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

SELECT 'New policy created' as status;
