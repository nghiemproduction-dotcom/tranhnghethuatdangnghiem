# DANH SÁCH FILE .TSX CÓ THỂ XÓA (KHÔNG ĐƯỢC SỬ DỤNG)

## ⚠️ LƯU Ý TRƯỚC KHI XÓA:
1. Backup code trước khi xóa
2. Kiểm tra lại một lần nữa bằng cách tìm kiếm trong toàn bộ project
3. Một số file có thể được import động (dynamic import) hoặc dùng trong cấu hình đặc biệt

---

## 📋 DANH SÁCH FILE CHẮC CHẮN KHÔNG ĐƯỢC SỬ DỤNG:

### 1. Level 3 Generic Components (ĐÃ XÓA ✅)
- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/Level3_FormDisplay.tsx`
  - **Lý do**: Không tìm thấy import nào trong codebase
  - **Ghi chú**: Có vẻ là file cũ, đã được thay thế bởi FormNhapLieu
  - **Trạng thái**: ĐÃ XÓA

- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/thongtinchung.tsx`
  - **Lý do**: Không tìm thấy import nào
  - **Ghi chú**: Có vẻ là component cũ không còn được dùng
  - **Trạng thái**: ĐÃ XÓA

- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/Tab_KhachHangPhuTrach.tsx`
  - **Lý do**: Không được import trong level3generic.tsx (không có trong tabList)
  - **Ghi chú**: Component có vẻ được tạo nhưng chưa được tích hợp vào hệ thống
  - **Trạng thái**: ĐÃ XÓA

### 2. Level 2 Generic Components (ĐÃ XÓA ✅)
- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/HeaderDayDu.tsx`
  - **Trạng thái**: ĐÃ XÓA
- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/NutDongBoNhanSu.tsx`
  - **Trạng thái**: ĐÃ XÓA
- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/NutPhanQuyen.tsx`
  - **Trạng thái**: ĐÃ XÓA
- ✅ `app/GiaoDienTong/ModalDaCap/Modulegeneric/level2generic/TableView.tsx`
  - **Trạng thái**: ĐÃ XÓA
  - **Lý do**: Các file này không được import ở đâu trong codebase

### 3. Dashboard Builder
- ✅ `app/GiaoDienTong/DashboardBuilder/ModalCauHinhCot.tsx`
  - **Lý do**: Không tìm thấy import

### 4. CongDangNhap (Đăng nhập)
- ✅ `app/CongDangNhap/ChanForm.tsx`
  - **Lý do**: Có comment trong CongDangNhap.tsx (dòng 12) nói rằng đã bỏ import ChanForm
  - **Ghi chú**: File này đã được loại bỏ khỏi code

### 5. Trang chủ
- ✅ `app/trangchu/NutXemThem.tsx`
  - **Lý do**: Không tìm thấy import

---

## ⚠️ CÁC FILE CẦN KIỂM TRA THÊM (Có thể được dùng nhưng script không phát hiện):

### Có thể được dùng qua dynamic import hoặc string reference:
- `app/GiaoDienTong/HieuUngNen/HieuUngNen.tsx`
- `app/GiaoDienTong/HieuUngNen/LopPhuLanMau.tsx`
- `app/GiaoDienTong/KhungGiaoDienTong.tsx`
- `app/GiaoDienTong/MenuDuoi/GiaoDien/NutToiLui.tsx`
- `app/GiaoDienTong/MenuDuoi/NutCaNhan/GiaoDienChiTiet.tsx`
- `app/GiaoDienTong/MenuTren/LoiChao.tsx`
- `app/GiaoDienTong/MenuTren/NutGioHang.tsx`
- `app/GiaoDienTong/MenuTren/NutQR.tsx`
- `app/GiaoDienTong/MenuTren/NutThongBao.tsx`
- `app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuKhien.tsx`
- `app/components/BaoVeLoi.tsx`
- `app/components/GlobalCodeEditor.tsx`
- `app/components/KhungUngDungMobile.tsx`
- `app/components/Secured.tsx`

---

## 🔍 CÁCH KIỂM TRA THỦ CÔNG:

1. Mở file cần kiểm tra
2. Tìm kiếm tên component trong toàn bộ project (Ctrl+Shift+F)
3. Kiểm tra xem có được import ở đâu không
4. Kiểm tra xem có được dùng trong cấu hình JSON/TS không

---

## ✅ KHUYẾN NGHỊ:

**Có thể xóa an toàn ngay:**
- Level3_FormDisplay.tsx
- thongtinchung.tsx
- Tab_KhachHangPhuTrach.tsx (nếu không có kế hoạch sử dụng)
- ChanForm.tsx
- HeaderDayDu.tsx
- NutDongBoNhanSu.tsx
- NutPhanQuyen.tsx
- TableView.tsx
- ModalCauHinhCot.tsx
- NutXemThem.tsx

**Cần kiểm tra kỹ trước khi xóa:**
- Các file trong mục "CẦN KIỂM TRA THÊM"

