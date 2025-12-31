-- Check vi_tri_normalized for admin user
SELECT 
  id,
  ho_ten,
  email,
  vi_tri,
  vi_tri_normalized
FROM nhan_su
WHERE LOWER(email) = 'nghiemproduction@gmail.com'
  OR LOWER(email) LIKE '%nghiem%'
ORDER BY created_at DESC;
