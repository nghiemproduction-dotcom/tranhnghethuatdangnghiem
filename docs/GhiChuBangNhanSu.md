# 📋 DANH SÁCH NHÂN SỰ (BẢNG nhan_su)
> **Cập nhật lần cuối:** 31/12/2025 - 10:55 UTC

---

## 📊 TỔNG QUAN

| Thống Kê | Số Lượng |
|----------|----------|
| **Tổng nhân sự** | 10 người |
| **Admin** | 1 |
| **Quản lý** | 1 |
| **Sales** | 2 |
| **CTV** | 2 |
| **Part-time** | 2 |
| **Thợ sản xuất** | 1 |
| **Thiết kế** | 1 |

---

## 🔴 ADMIN (1 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Tommy Nghiêm | nghiemproduction@gmail.com | 0939852511 | `0939852511` |

---

## 🟠 QUẢN LÝ (1 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Chi | nguyenhongkhanhchi@gmail.com | 0939941588 | `0939941588` |

---

## 🟡 SALES (2 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Ms. Sale | sales@artspace.vn | 0909000111 | `0909000111` |
| Nguyễn Văn Bán | sales2@artspace.vn | 0901234567 | `0901234567` |

---

## 🟢 CỘNG TÁC VIÊN (2 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Trần Thị CTV | ctv1@artspace.vn | 0912345678 | `0912345678` |
| Lê Văn Hợp Tác | ctv2@artspace.vn | 0923456789 | `0923456789` |

---

## 🔵 PART-TIME (2 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Phạm Thị Part | parttime1@artspace.vn | 0934567890 | `0934567890` |
| Hoàng Văn Thời Vụ | parttime2@artspace.vn | 0945678901 | `0945678901` |

---

## 🟣 THỢ SẢN XUẤT (1 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Võ Văn Thợ | tho1@artspace.vn | 0956789012 | `0956789012` |

---

## 🩷 THIẾT KẾ (1 người)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Đỗ Thị Design | design@artspace.vn | 0967890123 | `0967890123` |

---

## 🔑 THÔNG TIN ĐĂNG NHẬP

- **Email:** Sử dụng email trong bảng
- **Password:** Sử dụng số điện thoại (so_dien_thoai)

---

## 📍 ROUTING SAU ĐĂNG NHẬP

| vi_tri_normalized | Route Mặc Định |
|-------------------|----------------|
| `admin` | `/phongadmin` |
| `quanly` | `/phongquanly` |
| `sales` | `/phongsales` |
| `congtacvien` | `/phongctv` |
| `parttime` | `/phongparttime` |
| `thosanxuat` | `/phongtho` |
| `thietke` | `/phongthietke` |

⚠️ **TẤT CẢ NHÂN SỰ KHÔNG ĐƯỢC VÀO /trangchu**

---

## 📝 RAW DATA (JSON)

```json
[
  {
    "id": "622d711d-3f1c-4978-a529-163a1c8a4bca",
    "ho_ten": "Tommy Nghiêm",
    "email": "nghiemproduction@gmail.com",
    "vi_tri": "Admin",
    "vi_tri_normalized": "admin",
    "so_dien_thoai": "0939852511"
  },
  {
    "id": "5315e23f-a3f2-4026-be88-d235aa4d73cb",
    "ho_ten": "Chi",
    "email": "nguyenhongkhanhchi@gmail.com",
    "vi_tri": "Quản lý",
    "vi_tri_normalized": "quanly",
    "so_dien_thoai": "0939941588"
  },
  {
    "id": "9d929ed3-5d80-465b-9eef-cd49e69c9f9e",
    "ho_ten": "Ms. Sale",
    "email": "sales@artspace.vn",
    "vi_tri": "Sales",
    "vi_tri_normalized": "sales",
    "so_dien_thoai": "0909000111"
  },
  {
    "id": "2ff20747-3971-480c-82ad-c3fa7f4320f7",
    "ho_ten": "Nguyễn Văn Bán",
    "email": "sales2@artspace.vn",
    "vi_tri": "Sales",
    "vi_tri_normalized": "sales",
    "so_dien_thoai": "0901234567"
  },
  {
    "id": "8e833655-e501-4014-a5e2-f437eed7babc",
    "ho_ten": "Trần Thị CTV",
    "email": "ctv1@artspace.vn",
    "vi_tri": "Cộng Tác Viên",
    "vi_tri_normalized": "congtacvien",
    "so_dien_thoai": "0912345678"
  },
  {
    "id": "f13dbabb-f5a9-4ae0-8d51-05a3b3de0922",
    "ho_ten": "Lê Văn Hợp Tác",
    "email": "ctv2@artspace.vn",
    "vi_tri": "Cộng Tác Viên",
    "vi_tri_normalized": "congtacvien",
    "so_dien_thoai": "0923456789"
  },
  {
    "id": "46ba0b09-d34d-403e-ab24-a2dd67420057",
    "ho_ten": "Phạm Thị Part",
    "email": "parttime1@artspace.vn",
    "vi_tri": "Part-time",
    "vi_tri_normalized": "parttime",
    "so_dien_thoai": "0934567890"
  },
  {
    "id": "ae514782-a6c2-4d84-96d7-969d49f79a16",
    "ho_ten": "Hoàng Văn Thời Vụ",
    "email": "parttime2@artspace.vn",
    "vi_tri": "Part-time",
    "vi_tri_normalized": "parttime",
    "so_dien_thoai": "0945678901"
  },
  {
    "id": "1e264937-bff5-411c-a887-5f6a00b8dec9",
    "ho_ten": "Võ Văn Thợ",
    "email": "tho1@artspace.vn",
    "vi_tri": "Thợ Sản Xuất",
    "vi_tri_normalized": "thosanxuat",
    "so_dien_thoai": "0956789012"
  },
  {
    "id": "8cf52994-ba71-4796-a1db-ff5c6d4656d2",
    "ho_ten": "Đỗ Thị Design",
    "email": "design@artspace.vn",
    "vi_tri": "Thiết Kế",
    "vi_tri_normalized": "thietke",
    "so_dien_thoai": "0967890123"
  }
]
```
