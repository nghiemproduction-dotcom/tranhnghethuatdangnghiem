-- ============================================
-- 🟢 KIỂM TRA CẤU TRÚC BẢNG KHACH_HANG
-- ============================================
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================

-- BƯỚC 1: Xem tất cả các cột trong bảng khach_hang
SELECT 
  column_name as "📋 Tên cột",
  data_type as "📊 Kiểu dữ liệu",
  is_nullable as "❓ Cho phép NULL",
  column_default as "🔧 Giá trị mặc định"
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'khach_hang'
ORDER BY ordinal_position;

-- ============================================
-- 🟢 THÊM CỘT NORMALIZED VÀ KHÁCH HÀNG MẪU
-- ============================================

-- BƯỚC 2: Thêm cột phan_loai_normalized nếu chưa có
ALTER TABLE khach_hang ADD COLUMN IF NOT EXISTS phan_loai_normalized TEXT;

-- BƯỚC 3: Tạo/Cập nhật function normalize (nếu chưa có)
CREATE OR REPLACE FUNCTION normalize_vietnamese(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN RETURN NULL; END IF;
  RETURN LOWER(
    TRANSLATE(
      REPLACE(input_text, ' ', ''),
      'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ-',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyydaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- BƯỚC 4: Thêm khách hàng mẫu với đủ các loại phân loại

-- VIP - thêm 2 người
INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Nguyễn Đại Gia', 'vip1@example.com', '0901111111', 'VIP', 'vip'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'vip1@example.com');

INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Trần Kim Cương', 'vip2@example.com', '0902222222', 'VIP', 'vip'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'vip2@example.com');

-- Đối tác - thêm 2 người
INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Công Ty ABC', 'doitac1@example.com', '0903333333', 'Đối tác', 'doitac'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'doitac1@example.com');

INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Công Ty XYZ', 'doitac2@example.com', '0904444444', 'Đối tác', 'doitac'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'doitac2@example.com');

-- Mới - thêm 2 người
INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Lê Văn Mới', 'moi1@example.com', '0905555555', 'Mới', 'moi'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'moi1@example.com');

INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Phạm Thị Mới', 'moi2@example.com', '0906666666', 'Mới', 'moi'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'moi2@example.com');

-- Đã Mua Hàng - thêm 2 người
INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Hoàng Văn Mua', 'damuahang1@example.com', '0907777777', 'Đã Mua Hàng', 'damuahang'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'damuahang1@example.com');

INSERT INTO khach_hang (id, ho_ten, email, so_dien_thoai, phan_loai, phan_loai_normalized)
SELECT gen_random_uuid(), 'Vũ Thị Mua', 'damuahang2@example.com', '0908888888', 'Đã Mua Hàng', 'damuahang'
WHERE NOT EXISTS (SELECT 1 FROM khach_hang WHERE email = 'damuahang2@example.com');

-- BƯỚC 5: Cập nhật phan_loai_normalized cho tất cả khách hàng cũ
UPDATE khach_hang 
SET phan_loai_normalized = normalize_vietnamese(phan_loai)
WHERE phan_loai_normalized IS NULL OR phan_loai_normalized = '';

-- ============================================
-- BƯỚC 6: TẠO AUTH USERS CHO KHÁCH HÀNG MỚI
-- ============================================
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

-- Tạo identities cho users mới
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(), au.id,
  jsonb_build_object('sub', au.id::text, 'email', au.email, 'email_verified', true),
  'email', au.id::text, NOW(), NOW(), NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities ai 
  WHERE ai.user_id = au.id AND ai.provider = 'email'
);

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================
SELECT 
  ho_ten as "👤 Họ tên",
  email as "📧 Email",
  phan_loai as "📋 Phân loại gốc",
  phan_loai_normalized as "🔤 Phân loại normalized",
  so_dien_thoai as "📱 SĐT (mật khẩu)"
FROM khach_hang
ORDER BY phan_loai_normalized, ho_ten;

-- ============================================
-- BẢNG MAPPING PHÂN LOẠI
-- ============================================
/*
| Phân loại gốc    | Normalized      |
|------------------|-----------------|
| VIP              | vip             |
| Đối tác          | doitac          |
| Mới              | moi             |
| Đã Mua Hàng      | damuahang       |
| Tiềm năng        | tiemnang        |
| Thường           | thuong          |
*/

-- ============================================
-- ✅ HƯỚNG DẪN CHECK PHÂN LOẠI TRONG CODE:
-- if (user.phan_loai_normalized === 'vip') { ... }
-- if (user.phan_loai_normalized === 'doitac') { ... }
-- if (user.phan_loai_normalized === 'moi') { ... }
-- if (user.phan_loai_normalized === 'damuahang') { ... }
-- ============================================
