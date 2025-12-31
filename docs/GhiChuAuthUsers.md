# 📋 DANH SÁCH AUTH USERS (BẢNG auth.users)
> **Cập nhật lần cuối:** 31/12/2025 - 10:57 UTC

---

## 📊 TỔNG QUAN

| Thống Kê | Số Lượng |
|----------|----------|
| **Tổng auth users** | 20 |
| **Nhân sự (nhan_su)** | 10 |
| **Khách hàng (khach_hang)** | 10 |

✅ **TẤT CẢ ĐỀU KHỚP** với bảng `nhan_su` và `khach_hang`

---

## 🔴 NHÂN SỰ (10 users)

| Họ Tên | Email | Vị Trí | Password (SĐT) |
|--------|-------|--------|----------------|
| Tommy Nghiêm | nghiemproduction@gmail.com | Admin | `0939852511` |
| Chi | nguyenhongkhanhchi@gmail.com | Quản lý | `0939941588` |
| Ms. Sale | sales@artspace.vn | Sales | `0909000111` |
| Nguyễn Văn Bán | sales2@artspace.vn | Sales | `0901234567` |
| Trần Thị CTV | ctv1@artspace.vn | Cộng Tác Viên | `0912345678` |
| Lê Văn Hợp Tác | ctv2@artspace.vn | Cộng Tác Viên | `0923456789` |
| Phạm Thị Part | parttime1@artspace.vn | Part-time | `0934567890` |
| Hoàng Văn Thời Vụ | parttime2@artspace.vn | Part-time | `0945678901` |
| Võ Văn Thợ | tho1@artspace.vn | Thợ Sản Xuất | `0956789012` |
| Đỗ Thị Design | design@artspace.vn | Thiết Kế | `0967890123` |

---

## 🟢 KHÁCH HÀNG (10 users)

| Họ Tên | Email | Phân Loại | Password (SĐT) |
|--------|-------|-----------|----------------|
| Nguyễn Đại Gia | vip1@example.com | VIP | `0901111111` |
| Trần Kim Cương | vip2@example.com | VIP | `0902222222` |
| Trần Khắc Tâm | khactam@gmail.com | VIP | `12345678` |
| Công Ty ABC | doitac1@example.com | Đối tác | `0903333333` |
| Công Ty XYZ | doitac2@example.com | Đối tác | `0904444444` |
| Lê Văn Mới | moi1@example.com | Mới | `0905555555` |
| Phạm Thị Mới | moi2@example.com | Mới | `0906666666` |
| Hoàng Văn Mua | damuahang1@example.com | Đã Mua Hàng | `0907777777` |
| Vũ Thị Mua | damuahang2@example.com | Đã Mua Hàng | `0908888888` |
| Phà Ca | phaca@gmail.com | KH Trọng tâm | `123456789` |

---

## 🔑 CÁCH ĐĂNG NHẬP

```
Email: [email từ bảng trên]
Password: [số điện thoại tương ứng]
```

### Test nhanh:

**Admin:**
- Email: `nghiemproduction@gmail.com`
- Password: `0939852511`
- → Redirect: `/phongadmin`

**Khách VIP:**
- Email: `vip1@example.com`
- Password: `0901111111`
- → Redirect: `/trangchu`

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Khách "Phà Ca"** có `phan_loai_normalized = 'khtrongtam'` - cần thêm vào `routing_permissions`
2. Password = số điện thoại trong bảng `nhan_su` hoặc `khach_hang`
3. Nếu số điện thoại null → password mặc định là `123456`

---

## 📝 RAW DATA (JSON)

```json
[
  {"email": "nghiemproduction@gmail.com", "ho_ten": "Tommy Nghiêm", "user_type": "nhan_su", "vi_tri": "Admin"},
  {"email": "nguyenhongkhanhchi@gmail.com", "ho_ten": "Chi", "user_type": "nhan_su", "vi_tri": "Quản lý"},
  {"email": "sales@artspace.vn", "ho_ten": "Ms. Sale", "user_type": "nhan_su", "vi_tri": "Sales"},
  {"email": "sales2@artspace.vn", "ho_ten": "Nguyễn Văn Bán", "user_type": "nhan_su", "vi_tri": "Sales"},
  {"email": "ctv1@artspace.vn", "ho_ten": "Trần Thị CTV", "user_type": "nhan_su", "vi_tri": "Cộng Tác Viên"},
  {"email": "ctv2@artspace.vn", "ho_ten": "Lê Văn Hợp Tác", "user_type": "nhan_su", "vi_tri": "Cộng Tác Viên"},
  {"email": "parttime1@artspace.vn", "ho_ten": "Phạm Thị Part", "user_type": "nhan_su", "vi_tri": "Part-time"},
  {"email": "parttime2@artspace.vn", "ho_ten": "Hoàng Văn Thời Vụ", "user_type": "nhan_su", "vi_tri": "Part-time"},
  {"email": "tho1@artspace.vn", "ho_ten": "Võ Văn Thợ", "user_type": "nhan_su", "vi_tri": "Thợ Sản Xuất"},
  {"email": "design@artspace.vn", "ho_ten": "Đỗ Thị Design", "user_type": "nhan_su", "vi_tri": "Thiết Kế"},
  {"email": "vip1@example.com", "ho_ten": "Nguyễn Đại Gia", "user_type": "khach_hang", "phan_loai": "VIP"},
  {"email": "vip2@example.com", "ho_ten": "Trần Kim Cương", "user_type": "khach_hang", "phan_loai": "VIP"},
  {"email": "khactam@gmail.com", "ho_ten": "Trần Khắc Tâm", "user_type": "khach_hang", "phan_loai": "VIP"},
  {"email": "doitac1@example.com", "ho_ten": "Công Ty ABC", "user_type": "khach_hang", "phan_loai": "Đối tác"},
  {"email": "doitac2@example.com", "ho_ten": "Công Ty XYZ", "user_type": "khach_hang", "phan_loai": "Đối tác"},
  {"email": "moi1@example.com", "ho_ten": "Lê Văn Mới", "user_type": "khach_hang", "phan_loai": "Mới"},
  {"email": "moi2@example.com", "ho_ten": "Phạm Thị Mới", "user_type": "khach_hang", "phan_loai": "Mới"},
  {"email": "damuahang1@example.com", "ho_ten": "Hoàng Văn Mua", "user_type": "khach_hang", "phan_loai": "Đã Mua Hàng"},
  {"email": "damuahang2@example.com", "ho_ten": "Vũ Thị Mua", "user_type": "khach_hang", "phan_loai": "Đã Mua Hàng"},
  {"email": "phaca@gmail.com", "ho_ten": "Phà Ca", "user_type": "khach_hang", "phan_loai": "KH Trọng tâm"}
]
```
