# 📋 DANH SÁCH KHÁCH HÀNG (BẢNG khach_hang)
> **Cập nhật lần cuối:** 31/12/2025 - 10:56 UTC

---

## 📊 TỔNG QUAN

| Thống Kê | Số Lượng |
|----------|----------|
| **Tổng khách hàng** | 10 người |
| **VIP** | 3 |
| **Đối tác** | 2 |
| **Mới** | 2 |
| **Đã Mua Hàng** | 2 |
| **KH Trọng tâm** | 1 |

---

## 🟣 VIP (3 khách)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Nguyễn Đại Gia | vip1@example.com | 0901111111 | `0901111111` |
| Trần Kim Cương | vip2@example.com | 0902222222 | `0902222222` |
| Trần Khắc Tâm | khactam@gmail.com | 12345678 | `12345678` |

---

## 🤝 ĐỐI TÁC (2 khách)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Công Ty ABC | doitac1@example.com | 0903333333 | `0903333333` |
| Công Ty XYZ | doitac2@example.com | 0904444444 | `0904444444` |

---

## 🆕 MỚI (2 khách)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Lê Văn Mới | moi1@example.com | 0905555555 | `0905555555` |
| Phạm Thị Mới | moi2@example.com | 0906666666 | `0906666666` |

---

## 🛒 ĐÃ MUA HÀNG (2 khách)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Hoàng Văn Mua | damuahang1@example.com | 0907777777 | `0907777777` |
| Vũ Thị Mua | damuahang2@example.com | 0908888888 | `0908888888` |

---

## ⭐ KH TRỌNG TÂM (1 khách)

| Họ Tên | Email | SĐT | Password |
|--------|-------|-----|----------|
| Phà Ca | phaca@gmail.com | 123456789 | `123456789` |

⚠️ **LƯU Ý:** `khtrongtam` chưa có trong routing_permissions! Cần thêm nếu muốn đăng nhập được.

---

## 🔑 THÔNG TIN ĐĂNG NHẬP

- **Email:** Sử dụng email trong bảng
- **Password:** Sử dụng số điện thoại (so_dien_thoai)

---

## 📍 ROUTING SAU ĐĂNG NHẬP

| phan_loai_normalized | Route Mặc Định | Routes Được Phép |
|----------------------|----------------|------------------|
| `vip` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongvip` |
| `doitac` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongdoitac` |
| `moi` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongkhachmoi` |
| `damuahang` | `/trangchu` | `/trangchu`, `/phongtrunbay`, `/phongkhachcu` |
| `khtrongtam` | ⚠️ CHƯA CÓ | ⚠️ CẦN THÊM VÀO routing_permissions |

✅ **TẤT CẢ KHÁCH HÀNG ĐƯỢC VÀO /trangchu VÀ /phongtrunbay**

---

## 📝 RAW DATA (JSON)

```json
[
  {
    "id": "2e03c5ca-807f-44bb-9758-dd8a515a6118",
    "ho_ten": "Nguyễn Đại Gia",
    "email": "vip1@example.com",
    "phan_loai": "VIP",
    "phan_loai_normalized": "vip",
    "so_dien_thoai": "0901111111"
  },
  {
    "id": "6954aec9-aae2-4f49-881b-9a735e8b743d",
    "ho_ten": "Trần Kim Cương",
    "email": "vip2@example.com",
    "phan_loai": "VIP",
    "phan_loai_normalized": "vip",
    "so_dien_thoai": "0902222222"
  },
  {
    "id": "5faa2f59-442b-48fb-afe2-7ea750cdf752",
    "ho_ten": "Trần Khắc Tâm",
    "email": "khactam@gmail.com",
    "phan_loai": "VIP",
    "phan_loai_normalized": "vip",
    "so_dien_thoai": "12345678"
  },
  {
    "id": "50f11c54-e44e-4be1-aeda-4ab2beea80ae",
    "ho_ten": "Công Ty ABC",
    "email": "doitac1@example.com",
    "phan_loai": "Đối tác",
    "phan_loai_normalized": "doitac",
    "so_dien_thoai": "0903333333"
  },
  {
    "id": "efcee530-73ab-4320-9198-ae01e8b84569",
    "ho_ten": "Công Ty XYZ",
    "email": "doitac2@example.com",
    "phan_loai": "Đối tác",
    "phan_loai_normalized": "doitac",
    "so_dien_thoai": "0904444444"
  },
  {
    "id": "657653a9-2561-4464-bd53-771f301e9014",
    "ho_ten": "Lê Văn Mới",
    "email": "moi1@example.com",
    "phan_loai": "Mới",
    "phan_loai_normalized": "moi",
    "so_dien_thoai": "0905555555"
  },
  {
    "id": "3e1375f2-1d16-49b8-8393-9f26d24629d6",
    "ho_ten": "Phạm Thị Mới",
    "email": "moi2@example.com",
    "phan_loai": "Mới",
    "phan_loai_normalized": "moi",
    "so_dien_thoai": "0906666666"
  },
  {
    "id": "4770be90-2df4-4c55-a099-cc24b48bad89",
    "ho_ten": "Hoàng Văn Mua",
    "email": "damuahang1@example.com",
    "phan_loai": "Đã Mua Hàng",
    "phan_loai_normalized": "damuahang",
    "so_dien_thoai": "0907777777"
  },
  {
    "id": "90e8db71-8a47-44e9-a916-5f43f3e3040d",
    "ho_ten": "Vũ Thị Mua",
    "email": "damuahang2@example.com",
    "phan_loai": "Đã Mua Hàng",
    "phan_loai_normalized": "damuahang",
    "so_dien_thoai": "0908888888"
  },
  {
    "id": "69d9e25e-e174-44b7-a988-c16044b44f5c",
    "ho_ten": "Phà Ca",
    "email": "phaca@gmail.com",
    "phan_loai": "KH Trọng tâm",
    "phan_loai_normalized": "khtrongtam",
    "so_dien_thoai": "123456789"
  }
]
```
