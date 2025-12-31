-- ============================================
-- 🟢 THÊM NHÂN SỰ MẪU VỚI ĐỦ CÁC VỊ TRÍ
-- ============================================
-- Các vị trí: Admin, Quản lý, Sales, Cộng Tác Viên, Part-time
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================

-- BƯỚC 1: Tạo function normalize text (viết thường, không dấu)
CREATE OR REPLACE FUNCTION normalize_vietnamese(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    TRANSLATE(
      input_text,
      'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyydaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyd'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- BƯỚC 2: Thêm cột vi_tri_normalized nếu chưa có
ALTER TABLE nhan_su ADD COLUMN IF NOT EXISTS vi_tri_normalized TEXT;

-- BƯỚC 2.5: Tạo unique constraint trên email (nếu chưa có)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'nhan_su_email_unique'
  ) THEN
    ALTER TABLE nhan_su ADD CONSTRAINT nhan_su_email_unique UNIQUE (email);
  END IF;
EXCEPTION WHEN others THEN
  -- Bỏ qua nếu có lỗi (email trùng)
  RAISE NOTICE 'Could not create unique constraint, continuing...';
END $$;

-- BƯỚC 3: Thêm nhân sự mẫu với đủ các vị trí (chỉ thêm nếu email chưa tồn tại)

-- Sales - thêm 1 người
INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Nguyễn Văn Bán', 'sales2@artspace.vn', '0901234567', 'Sales', 'sales', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'sales2@artspace.vn');

-- Cộng Tác Viên - thêm 2 người
INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Trần Thị CTV', 'ctv1@artspace.vn', '0912345678', 'Cộng Tác Viên', 'congtacvien', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'ctv1@artspace.vn');

INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Lê Văn Hợp Tác', 'ctv2@artspace.vn', '0923456789', 'Cộng Tác Viên', 'congtacvien', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'ctv2@artspace.vn');

-- Part-time - thêm 2 người
INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Phạm Thị Part', 'parttime1@artspace.vn', '0934567890', 'Part-time', 'parttime', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'parttime1@artspace.vn');

INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Hoàng Văn Thời Vụ', 'parttime2@artspace.vn', '0945678901', 'Part-time', 'parttime', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'parttime2@artspace.vn');

-- Thợ Sản Xuất - thêm 1 người
INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Võ Văn Thợ', 'tho1@artspace.vn', '0956789012', 'Thợ Sản Xuất', 'thosanxuat', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'tho1@artspace.vn');

-- Thiết Kế - thêm 1 người
INSERT INTO nhan_su (id, ho_ten, email, so_dien_thoai, vi_tri, vi_tri_normalized, trang_thai)
SELECT gen_random_uuid(), 'Đỗ Thị Design', 'design@artspace.vn', '0967890123', 'Thiết Kế', 'thietke', 'Đang làm việc'
WHERE NOT EXISTS (SELECT 1 FROM nhan_su WHERE email = 'design@artspace.vn');

-- BƯỚC 4: Cập nhật vi_tri_normalized cho tất cả nhân sự cũ
UPDATE nhan_su 
SET vi_tri_normalized = normalize_vietnamese(REPLACE(vi_tri, ' ', ''))
WHERE vi_tri_normalized IS NULL OR vi_tri_normalized = '';

-- ============================================
-- BƯỚC 5: TẠO AUTH USERS CHO NHÂN SỰ MỚI
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
  vi_tri as "💼 Vị trí gốc",
  vi_tri_normalized as "🔤 Vị trí normalized",
  so_dien_thoai as "📱 SĐT (mật khẩu)"
FROM nhan_su
ORDER BY vi_tri_normalized, ho_ten;

-- ============================================
-- BẢNG MAPPING VỊ TRÍ
-- ============================================
/*
| Vị trí gốc        | Normalized       |
|-------------------|------------------|
| Admin             | admin            |
| Quản lý           | quanly           |
| Sales             | sales            |
| Cộng Tác Viên     | congtacvien      |
| Part-time         | parttime         |
| Thợ Sản Xuất      | thosanxuat       |
| Thiết Kế          | thietke          |
| Kỹ Thuật          | kythuat          |
*/

-- ============================================
-- ✅ HƯỚNG DẪN CHECK VỊ TRÍ TRONG CODE:
-- if (user.vi_tri_normalized === 'admin') { ... }
-- if (user.vi_tri_normalized === 'quanly') { ... }
-- if (user.vi_tri_normalized === 'sales') { ... }
-- if (user.vi_tri_normalized === 'congtacvien') { ... }
-- if (user.vi_tri_normalized === 'parttime') { ... }
-- ============================================
