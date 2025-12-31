-- =====================================================
-- CẬP NHẬT VI_TRI_NORMALIZED VÀ PHAN_LOAI_NORMALIZED
-- Đảm bảo tất cả user đều có giá trị normalized để routing hoạt động
-- =====================================================

-- =====================================================
-- BƯỚC 1: TẠO FUNCTION CHUẨN HÓA TIẾNG VIỆT
-- =====================================================

CREATE OR REPLACE FUNCTION normalize_vietnamese(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    result TEXT;
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    result := input_text;
    
    -- Chuyển thành chữ thường
    result := LOWER(result);
    
    -- Thay thế các ký tự có dấu bằng không dấu
    result := TRANSLATE(result, 
        'áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
    );
    
    -- Xóa tất cả ký tự không phải chữ cái và số
    result := REGEXP_REPLACE(result, '[^a-z0-9]', '', 'g');
    
    RETURN result;
END;
$$;

-- =====================================================
-- BƯỚC 2: THÊM CỘT NORMALIZED NẾU CHƯA CÓ
-- =====================================================

-- Thêm cột vi_tri_normalized cho bảng nhan_su
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nhan_su' AND column_name = 'vi_tri_normalized'
    ) THEN
        ALTER TABLE nhan_su ADD COLUMN vi_tri_normalized VARCHAR(50);
        RAISE NOTICE '✅ Đã thêm cột vi_tri_normalized vào bảng nhan_su';
    ELSE
        RAISE NOTICE '⚠️ Cột vi_tri_normalized đã tồn tại trong bảng nhan_su';
    END IF;
END $$;

-- Thêm cột phan_loai_normalized cho bảng khach_hang
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'khach_hang' AND column_name = 'phan_loai_normalized'
    ) THEN
        ALTER TABLE khach_hang ADD COLUMN phan_loai_normalized VARCHAR(50);
        RAISE NOTICE '✅ Đã thêm cột phan_loai_normalized vào bảng khach_hang';
    ELSE
        RAISE NOTICE '⚠️ Cột phan_loai_normalized đã tồn tại trong bảng khach_hang';
    END IF;
END $$;

-- =====================================================
-- BƯỚC 3: CẬP NHẬT GIÁ TRỊ NORMALIZED CHO NHAN_SU
-- =====================================================

-- Mapping vi_tri → vi_tri_normalized
UPDATE nhan_su SET vi_tri_normalized = 
    CASE normalize_vietnamese(vi_tri)
        -- Admin
        WHEN 'admin' THEN 'admin'
        WHEN 'quantri' THEN 'admin'
        WHEN 'quantrihethong' THEN 'admin'
        WHEN 'quanlihethong' THEN 'admin'
        
        -- Quản Lý
        WHEN 'quanly' THEN 'quanly'
        WHEN 'giamdoc' THEN 'quanly'
        WHEN 'phogiamdoc' THEN 'quanly'
        WHEN 'truongphong' THEN 'quanly'
        WHEN 'manager' THEN 'quanly'
        
        -- Sales
        WHEN 'sales' THEN 'sales'
        WHEN 'kinhdoanh' THEN 'sales'
        WHEN 'banhang' THEN 'sales'
        WHEN 'cskh' THEN 'sales'
        WHEN 'truongban' THEN 'sales'
        WHEN 'nhanvienkinhdoanh' THEN 'sales'
        
        -- Cộng Tác Viên
        WHEN 'ctv' THEN 'congtacvien'
        WHEN 'congtacvien' THEN 'congtacvien'
        WHEN 'doitac' THEN 'congtacvien'
        
        -- Part-time
        WHEN 'parttime' THEN 'parttime'
        WHEN 'thoivu' THEN 'parttime'
        WHEN 'sinhvien' THEN 'parttime'
        WHEN 'lamthem' THEN 'parttime'
        
        -- Thợ Sản Xuất
        WHEN 'tho' THEN 'thosanxuat'
        WHEN 'thosanxuat' THEN 'thosanxuat'
        WHEN 'kythuat' THEN 'thosanxuat'
        WHEN 'lapdat' THEN 'thosanxuat'
        WHEN 'truongtho' THEN 'thosanxuat'
        WHEN 'nhanvienkyhat' THEN 'thosanxuat'
        
        -- Thiết Kế
        WHEN 'thietke' THEN 'thietke'
        WHEN 'designer' THEN 'thietke'
        WHEN 'hoasi' THEN 'thietke'
        WHEN 'truongnhomthietke' THEN 'thietke'
        WHEN 'nhanvienthietke' THEN 'thietke'
        
        -- Mặc định: parttime
        ELSE 'parttime'
    END
WHERE vi_tri IS NOT NULL AND (vi_tri_normalized IS NULL OR vi_tri_normalized = '');

-- =====================================================
-- BƯỚC 4: CẬP NHẬT GIÁ TRỊ NORMALIZED CHO KHACH_HANG
-- =====================================================

-- Mapping phan_loai → phan_loai_normalized
UPDATE khach_hang SET phan_loai_normalized = 
    CASE normalize_vietnamese(phan_loai)
        -- VIP
        WHEN 'vip' THEN 'vip'
        WHEN 'khachvip' THEN 'vip'
        WHEN 'khachhangthanhtiet' THEN 'vip'
        WHEN 'thuonggia' THEN 'vip'
        
        -- Đối Tác
        WHEN 'doitac' THEN 'doitac'
        WHEN 'partner' THEN 'doitac'
        WHEN 'nhabuon' THEN 'doitac'
        WHEN 'dailythunhat' THEN 'doitac'
        
        -- Khách Mới
        WHEN 'moi' THEN 'moi'
        WHEN 'khachmoi' THEN 'moi'
        WHEN 'tiemnang' THEN 'moi'
        WHEN 'chuamuahang' THEN 'moi'
        
        -- Đã Mua Hàng (Khách Cũ)
        WHEN 'damuahang' THEN 'damuahang'
        WHEN 'khachcu' THEN 'damuahang'
        WHEN 'datungmua' THEN 'damuahang'
        WHEN 'quaylai' THEN 'damuahang'
        
        -- Mặc định: khách mới
        ELSE 'moi'
    END
WHERE phan_loai IS NOT NULL AND (phan_loai_normalized IS NULL OR phan_loai_normalized = '');

-- =====================================================
-- BƯỚC 5: TẠO TRIGGER TỰ ĐỘNG CẬP NHẬT NORMALIZED
-- =====================================================

-- Trigger cho nhan_su
CREATE OR REPLACE FUNCTION auto_normalize_nhan_su_vi_tri()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.vi_tri IS NOT NULL THEN
        NEW.vi_tri_normalized := 
            CASE normalize_vietnamese(NEW.vi_tri)
                WHEN 'admin' THEN 'admin'
                WHEN 'quantri' THEN 'admin'
                WHEN 'quantrihethong' THEN 'admin'
                WHEN 'quanlihethong' THEN 'admin'
                WHEN 'quanly' THEN 'quanly'
                WHEN 'giamdoc' THEN 'quanly'
                WHEN 'phogiamdoc' THEN 'quanly'
                WHEN 'truongphong' THEN 'quanly'
                WHEN 'manager' THEN 'quanly'
                WHEN 'sales' THEN 'sales'
                WHEN 'kinhdoanh' THEN 'sales'
                WHEN 'banhang' THEN 'sales'
                WHEN 'cskh' THEN 'sales'
                WHEN 'ctv' THEN 'congtacvien'
                WHEN 'congtacvien' THEN 'congtacvien'
                WHEN 'parttime' THEN 'parttime'
                WHEN 'thoivu' THEN 'parttime'
                WHEN 'sinhvien' THEN 'parttime'
                WHEN 'tho' THEN 'thosanxuat'
                WHEN 'thosanxuat' THEN 'thosanxuat'
                WHEN 'kythuat' THEN 'thosanxuat'
                WHEN 'thietke' THEN 'thietke'
                WHEN 'designer' THEN 'thietke'
                ELSE 'parttime'
            END;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_normalize_nhan_su_vi_tri ON nhan_su;
CREATE TRIGGER trigger_normalize_nhan_su_vi_tri
    BEFORE INSERT OR UPDATE OF vi_tri ON nhan_su
    FOR EACH ROW
    EXECUTE FUNCTION auto_normalize_nhan_su_vi_tri();

-- Trigger cho khach_hang
CREATE OR REPLACE FUNCTION auto_normalize_khach_hang_phan_loai()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.phan_loai IS NOT NULL THEN
        NEW.phan_loai_normalized := 
            CASE normalize_vietnamese(NEW.phan_loai)
                WHEN 'vip' THEN 'vip'
                WHEN 'khachvip' THEN 'vip'
                WHEN 'doitac' THEN 'doitac'
                WHEN 'partner' THEN 'doitac'
                WHEN 'moi' THEN 'moi'
                WHEN 'khachmoi' THEN 'moi'
                WHEN 'damuahang' THEN 'damuahang'
                WHEN 'khachcu' THEN 'damuahang'
                ELSE 'moi'
            END;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_normalize_khach_hang_phan_loai ON khach_hang;
CREATE TRIGGER trigger_normalize_khach_hang_phan_loai
    BEFORE INSERT OR UPDATE OF phan_loai ON khach_hang
    FOR EACH ROW
    EXECUTE FUNCTION auto_normalize_khach_hang_phan_loai();

-- =====================================================
-- BƯỚC 6: VERIFY - KIỂM TRA KẾT QUẢ
-- =====================================================

-- Kiểm tra nhan_su đã có vi_tri_normalized
SELECT 
    id, 
    ho_ten, 
    vi_tri, 
    vi_tri_normalized,
    CASE vi_tri_normalized
        WHEN 'admin' THEN '→ /phongadmin'
        WHEN 'quanly' THEN '→ /phongquanly'
        WHEN 'sales' THEN '→ /phongsales'
        WHEN 'congtacvien' THEN '→ /phongctv'
        WHEN 'parttime' THEN '→ /phongparttime'
        WHEN 'thosanxuat' THEN '→ /phongtho'
        WHEN 'thietke' THEN '→ /phongthietke'
        ELSE '→ /phongparttime (default)'
    END as redirect_to
FROM nhan_su 
ORDER BY vi_tri_normalized;

-- Kiểm tra khach_hang đã có phan_loai_normalized
SELECT 
    id, 
    ho_ten, 
    phan_loai, 
    phan_loai_normalized,
    CASE phan_loai_normalized
        WHEN 'vip' THEN '→ /trangchu + /phongtrunbay + /phongvip'
        WHEN 'doitac' THEN '→ /trangchu + /phongtrunbay + /phongdoitac'
        WHEN 'moi' THEN '→ /trangchu + /phongtrunbay + /phongkhachmoi'
        WHEN 'damuahang' THEN '→ /trangchu + /phongtrunbay + /phongkhachcu'
        ELSE '→ /trangchu + /phongtrunbay (default)'
    END as allowed_routes
FROM khach_hang 
ORDER BY phan_loai_normalized;

-- =====================================================
-- TỔNG KẾT:
-- =====================================================
-- 
-- NHÂN SỰ (vi_tri_normalized):
--   admin       → /phongadmin (CẤM /trangchu)
--   quanly      → /phongquanly (CẤM /trangchu)
--   sales       → /phongsales (CẤM /trangchu)
--   congtacvien → /phongctv (CẤM /trangchu)
--   parttime    → /phongparttime (CẤM /trangchu)
--   thosanxuat  → /phongtho (CẤM /trangchu)
--   thietke     → /phongthietke (CẤM /trangchu)
--
-- KHÁCH HÀNG (phan_loai_normalized):
--   vip        → /trangchu + /phongtrunbay + /phongvip
--   doitac     → /trangchu + /phongtrunbay + /phongdoitac
--   moi        → /trangchu + /phongtrunbay + /phongkhachmoi
--   damuahang  → /trangchu + /phongtrunbay + /phongkhachcu
--
-- VISITOR (không đăng nhập):
--   guest      → /trangchu + /phongtrunbay CHỈ
--
-- =====================================================
