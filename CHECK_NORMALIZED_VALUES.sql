-- 📋 CHECK NORMALIZED VALUES FROM DATABASE

-- Check nhan_su table
SELECT DISTINCT 
  id,
  ho_ten,
  vi_tri,
  vi_tri_normalized
FROM nhan_su
WHERE vi_tri IS NOT NULL
  AND vi_tri_normalized IS NOT NULL
ORDER BY vi_tri_normalized;

-- Check khach_hang table  
SELECT DISTINCT
  id,
  ho_ten,
  phan_loai,
  phan_loai_normalized
FROM khach_hang
WHERE phan_loai IS NOT NULL
  AND phan_loai_normalized IS NOT NULL
ORDER BY phan_loai_normalized;
