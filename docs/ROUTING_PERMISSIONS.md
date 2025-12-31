# 📋 HỆ THỐNG PHÂN QUYỀN ROUTING - GHI NHỚ
> **Cập nhật:** 31/12/2025
> **Trạng thái:** ✅ ĐÃ TRIỂN KHAI THÀNH CÔNG

---

## 🎯 TỔNG QUAN

Hệ thống phân quyền routing đã được cấu hình trong Supabase với:
- **RLS (Row Level Security)** cho bảng `nhan_su` và `khach_hang`
- **Realtime** đã bật cho cả 2 bảng
- **Bảng `routing_permissions`** lưu quyền truy cập từng loại user

---

## 🔴 NHÂN SỰ (nhan_su) - CẤM VÀO /trangchu

| vi_tri_normalized | Route Mặc Định | Routes Được Phép |
|-------------------|----------------|------------------|
| `admin` | `/phongadmin` | `/phongadmin`, `/api` |
| `quanly` | `/phongquanly` | `/phongquanly`, `/api` |
| `sales` | `/phongsales` | `/phongsales`, `/api` |
| `congtacvien` | `/phongctv` | `/phongctv`, `/api` |
| `parttime` | `/phongparttime` | `/phongparttime`, `/api` |
| `thosanxuat` | `/phongtho` | `/phongtho`, `/api` |
| `thietke` | `/phongthietke` | `/phongthietke`, `/api` |

⚠️ **LƯU Ý:** TẤT CẢ nhân sự (kể cả Admin) đều **KHÔNG** được phép vào `/trangchu`

---

## 🟢 KHÁCH HÀNG (khach_hang) - ĐƯỢC VÀO /trangchu

| phan_loai_normalized | Route Mặc Định | Routes Được Phép |
|----------------------|----------------|------------------|
| `vip` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongvip`, `/api` |
| `doitac` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongdoitac`, `/api` |
| `moi` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongkhachmoi`, `/api` |
| `damuahang` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongkhachcu`, `/api` |

✅ Tất cả khách hàng đều được vào `/trangchu` và `/phongtrunbay`

---

## 🟡 KHÁCH THAM QUAN (Visitor - Không đăng nhập)

| Role | Route Mặc Định | Routes Được Phép |
|------|----------------|------------------|
| `guest` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/` |

🚫 Visitor **KHÔNG** được vào bất kỳ phòng riêng nào

---

## 🗄️ CẤU TRÚC DATABASE

### Bảng `routing_permissions`
```sql
CREATE TABLE routing_permissions (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL,      -- 'nhan_su', 'khach_hang', 'visitor'
    role_normalized VARCHAR(50) NOT NULL, -- vi_tri_normalized hoặc phan_loai_normalized
    allowed_routes TEXT[] NOT NULL,       -- Danh sách routes được phép
    default_route VARCHAR(100) NOT NULL,  -- Route mặc định sau login
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RPC Functions Có Sẵn
```sql
-- Kiểm tra quyền truy cập route
check_route_permission(user_type, role_normalized, route) → BOOLEAN

-- Lấy route mặc định
get_default_route(user_type, role_normalized) → VARCHAR

-- Lấy danh sách routes được phép
get_allowed_routes(user_type, role_normalized) → TEXT[]
```

### Helper Functions (Nội bộ)
```sql
get_current_user_email()  -- Lấy email user đang login
is_current_user_admin()   -- Kiểm tra có phải admin
is_current_user_staff()   -- Kiểm tra có phải staff (admin/sales/quanly)
```

---

## 🔐 RLS POLICIES

### Bảng `nhan_su`
| Policy | Quyền |
|--------|-------|
| SELECT | Xem data mình + Admin xem tất cả |
| INSERT | Chỉ Admin |
| UPDATE | Cập nhật data mình + Admin cập nhật tất cả |
| DELETE | Chỉ Admin |

### Bảng `khach_hang`
| Policy | Quyền |
|--------|-------|
| SELECT | Xem data mình + Staff xem tất cả |
| INSERT | Staff (admin/sales/quanly) |
| UPDATE | Cập nhật data mình + Staff cập nhật tất cả |
| DELETE | Chỉ Admin |

---

## 📁 FILE LIÊN QUAN

### SQL Scripts
- `MÃ SQL CHẠY TỐT/ENABLE_RLS_REALTIME_ROUTING.sql` - Script chính
- `MÃ SQL CHẠY TỐT/UPDATE_NORMALIZED_FIELDS.sql` - Cập nhật cột normalized

### Frontend Code
- `app/ThuVien/RoleRedirectService.ts` - Logic routing client-side
- `app/page.tsx` - Trang welcome, redirect theo role
- `app/trangchu/page.tsx` - Chặn nhân sự, cho phép khách hàng + visitor

---

## ✅ CHECKLIST ĐÃ HOÀN THÀNH

- [x] RLS bật cho `nhan_su`
- [x] RLS bật cho `khach_hang`
- [x] Realtime bật cho `nhan_su`
- [x] Realtime bật cho `khach_hang`
- [x] Bảng `routing_permissions` đã tạo
- [x] 7 quyền nhân sự đã thêm
- [x] 4 quyền khách hàng đã thêm
- [x] 1 quyền visitor đã thêm
- [x] RPC functions đã tạo và grant quyền
- [x] Frontend `RoleRedirectService.ts` đã cập nhật
- [x] `trangchu/page.tsx` chặn nhân sự
- [x] `page.tsx` redirect đúng role

---

## 🧪 CÁCH TEST

1. **Test nhân sự:**
   - Đăng nhập với account nhân sự
   - Phải được redirect về phòng của họ (VD: admin → /phongadmin)
   - Nếu cố gắng vào /trangchu → bị redirect về phòng

2. **Test khách hàng:**
   - Đăng nhập với account khách hàng
   - Được redirect về /trangchu
   - Có thể vào /phongtrunbay và phòng riêng của họ

3. **Test visitor:**
   - Không đăng nhập, chọn "Tham Quan"
   - Chỉ được vào /trangchu và /phongtrunbay
   - Vào phòng khác → bị redirect về /trangchu

---

## 📞 LIÊN HỆ

Nếu cần thay đổi quyền, sửa bảng `routing_permissions` trong Supabase Dashboard hoặc chạy lại SQL script.
