-- ============================================
-- 🟢 CẤP AUTH USER CHO TẤT CẢ NHÂN SỰ & KHÁCH HÀNG
-- ============================================
-- Chạy trong Supabase Dashboard > SQL Editor
-- Email: lấy từ cột email
-- Password: lấy từ cột so_dien_thoai (mặc định: 123456)
-- ============================================

-- BƯỚC 1: Tạo auth users từ bảng NHAN_SU
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  LOWER(TRIM(ns.email)),
  crypt(COALESCE(ns.so_dien_thoai, '123456'), gen_salt('bf')),
  NOW(), NOW(), NOW(),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
  jsonb_build_object(
    'ho_ten', ns.ho_ten,
    'vi_tri', ns.vi_tri,
    'vi_tri_normalized', ns.vi_tri_normalized,
    'user_type', 'nhan_su',
    'source_id', ns.id
  ),
  false, 'authenticated', 'authenticated', '', '', '', ''
FROM nhan_su ns
WHERE ns.email IS NOT NULL 
  AND TRIM(ns.email) != ''
  AND NOT EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE LOWER(TRIM(au.email)) = LOWER(TRIM(ns.email))
  );

-- BƯỚC 2: Tạo auth users từ bảng KHACH_HANG
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  LOWER(TRIM(kh.email)),
  crypt(COALESCE(kh.so_dien_thoai, '123456'), gen_salt('bf')),
  NOW(), NOW(), NOW(),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
  jsonb_build_object(
    'ho_ten', kh.ho_ten,
    'phan_loai', kh.phan_loai,
    'phan_loai_normalized', kh.phan_loai_normalized,
    'user_type', 'khach_hang',
    'source_id', kh.id
  ),
  false, 'authenticated', 'authenticated', '', '', '', ''
FROM khach_hang kh
WHERE kh.email IS NOT NULL 
  AND TRIM(kh.email) != ''
  AND NOT EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE LOWER(TRIM(au.email)) = LOWER(TRIM(kh.email))
  );

-- BƯỚC 3: Tạo identities cho TẤT CẢ users mới (bắt buộc để login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  au.id,
  jsonb_build_object('sub', au.id::text, 'email', au.email, 'email_verified', true),
  'email', 
  au.id::text, 
  NOW(), NOW(), NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities ai 
  WHERE ai.user_id = au.id AND ai.provider = 'email'
);

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================
SELECT '📊 TỔNG KẾT:' as info;

SELECT 'Tổng nhân sự:' as nguon, COUNT(*) as so_luong FROM nhan_su WHERE email IS NOT NULL;
SELECT 'Tổng khách hàng:' as nguon, COUNT(*) as so_luong FROM khach_hang WHERE email IS NOT NULL;
SELECT 'Tổng auth users:' as nguon, COUNT(*) as so_luong FROM auth.users;

-- DANH SÁCH TẤT CẢ TÀI KHOẢN
SELECT 
  email as "📧 Email",
  raw_user_meta_data->>'ho_ten' as "👤 Họ tên",
  raw_user_meta_data->>'user_type' as "📋 Loại",
  COALESCE(raw_user_meta_data->>'vi_tri', raw_user_meta_data->>'phan_loai') as "💼 Vị trí/Phân loại",
  '(SĐT)' as "🔑 Mật khẩu"
FROM auth.users
ORDER BY raw_user_meta_data->>'user_type', email;
