# 📜 NGUYÊN TẮC LÀM VIỆC

> File này chứa các nguyên tắc bắt buộc mà AI phải tuân theo khi làm việc với dự án này.
> Trước khi tạo file, folder, hàm mới - PHẢI đọc file này trước.

---

## ⚠️ NGUYÊN TẮC SỐ 0: TỐI QUAN TRỌNG

> **TRƯỚC KHI LÀM BẤT CỨ VIỆC GÌ, AI PHẢI:**
> 
> 1. **ĐỌC** file NguyenTac.md này
> 2. **HIỂU** tất cả các nguyên tắc
> 3. **ÁP DỤNG ĐÚNG** mọi nguyên tắc liên quan
> 
> ❌ **KHÔNG ĐƯỢC** làm trước rồi sửa sau
> ❌ **KHÔNG ĐƯỢC** bỏ qua bất kỳ nguyên tắc nào
> ❌ **KHÔNG ĐƯỢC** tự ý làm khác nguyên tắc
> 
> ✅ **NẾU KHÔNG CHẮC** → HỎI USER TRƯỚC

---

## 🚫 NGUYÊN TẮC 0.5: KHÔNG HARDCODE (CẤM SỬ DỤNG)

> **TUYỆT ĐỐI KHÔNG ĐƯỢC** hardcode text/nội dung trực tiếp trong component/file code.
> Mọi text hiển thị cho user **PHẢI** đến từ:
> - 📖 **Translation system** (hàm `t()` hoặc i18n library)
> - ⚙️ **Configuration file** (`config.ts`, `.env`, etc.)
> - 🗄️ **Database** (query từ bảng config hoặc content)
> - 🎨 **Component props** (truyền từ parent component)

### ❌ HARDCODING SAI (KHÔNG ĐƯỢC LÀM)

```tsx
// ❌ SAI: Text hardcode trực tiếp
export function LoginForm() {
  return (
    <button>Đăng nhập</button>
  );
}

// ❌ SAI: Multiple hardcoded strings
const message = 'Đăng nhập thất bại. Vui lòng thử lại.';
return <div>{message}</div>;

// ❌ SAI: Conditional hardcode
{language === 'vi' ? 'Đăng nhập' : 'Login'}
```

### ✅ CÁCH LÀM ĐÚNG

```tsx
// ✅ ĐÚNG: Sử dụng translation function
const { t } = useAppSettings();
return <button>{t('auth.login')}</button>;

// ✅ ĐÚNG: Lấy từ config
import { AUTH_LABELS } from '@/app/ThuVien/config';
return <button>{AUTH_LABELS.login}</button>;

// ✅ ĐÚNG: Lấy từ props
export function LoginForm({ label = 'Đăng nhập' }) {
  return <button>{label}</button>;
}

// ✅ ĐÚNG: Lấy từ database
const label = await getTranslation('auth.login');
return <button>{label}</button>;
```

### 📋 Các file PHẢI TUÂN THỦ nguyên tắc này

| File/Folder | Yêu cầu |
|------------|---------|
| **`app/CongDangNhap/**` | Mọi text phải từ translation system |
| **`app/GiaoDienTong/**` | Mọi label/placeholder phải từ config hoặc props |
| **`app/components/**` | Không hardcode messages, errors, labels |
| **`app/trangchu/**` | Sử dụng i18n cho multiple languages |
| **Mọi component có UI text** | **CẤM HARDCODE** |

### ⚡ Lợi ích

- ✅ Dễ dàng thay đổi text mà không cần sửa code
- ✅ Support multi-language không cần refactor
- ✅ Tái sử dụng text ở nhiều chỗ
- ✅ Maintain consistency toàn app
- ✅ Code sạch, readable, scalable

---

## 🏷️ NGUYÊN TẮC 1: CÁCH ĐẶT TÊN

### 1.1. Đặt tên FILE

| Loại file | Quy tắc | Ví dụ đúng | Ví dụ sai |
|-----------|---------|------------|-----------|
| **Component React** | PascalCase tiếng Việt không dấu | `KhungGiaoDienTong.tsx` | `khung-giao-dien-tong.tsx` |
| **Page (Next.js)** | Luôn là `page.tsx` trong folder tiếng Việt | `trangchu/page.tsx` | `TrangChu.tsx` |
| **Service/Utility** | PascalCase + hậu tố mô tả | `AuthService.ts`, `RoleRedirectService.ts` | `auth-service.ts` |
| **Type definitions** | PascalCase + `KieuDuLieu` | `KieuDuLieu.ts` | `types.ts` |
| **SQL scripts** | UPPER_CASE_SNAKE | `ENABLE_RLS_REALTIME_ROUTING.sql` | `enable-rls.sql` |
| **Documentation** | PascalCase tiếng Việt không dấu | `NguyenTac.md`, `GhiChuBangNhanSu.md` | `nguyen-tac.md` |
| **Config files** | Giữ nguyên chuẩn (lowercase) | `tailwind.config.ts`, `next.config.mjs` | N/A |

### 1.2. Đặt tên FOLDER

| Loại folder | Quy tắc | Ví dụ đúng | Ví dụ sai |
|-------------|---------|------------|-----------|
| **Trang/Route** | Tiếng Việt không dấu, lowercase | `trangchu`, `phongtrunbay` | `TrangChu`, `phong-trung-bay` |
| **Module/Feature** | PascalCase tiếng Việt không dấu | `GiaoDienTong`, `ThuVien` | `giao-dien-tong` |
| **Hệ thống** | Giữ nguyên chuẩn Next.js | `app`, `api`, `components` | N/A |
| **Docs** | lowercase | `docs` | `Docs` |

### 1.3. Đặt tên HÀM (Functions)

| Loại hàm | Quy tắc | Ví dụ đúng | Ví dụ sai |
|----------|---------|------------|-----------|
| **React Component** | PascalCase | `KhungGiaoDienTong()` | `khungGiaoDienTong()` |
| **Custom Hook** | camelCase + prefix `use` | `useAuth()`, `useRoutePermission()` | `UseAuth()` |
| **Utility function** | camelCase tiếng Anh | `getUserRole()`, `checkPermission()` | `get_user_role()` |
| **SQL function** | snake_case | `get_current_user_email()` | `getCurrentUserEmail()` |
| **Event handler** | camelCase + prefix `handle` | `handleLogin()`, `handleSubmit()` | `onLogin()` |

### 1.4. Đặt tên BIẾN (Variables)

| Loại biến | Quy tắc | Ví dụ đúng | Ví dụ sai |
|-----------|---------|------------|-----------|
| **Biến thường** | camelCase | `currentUser`, `isAdmin` | `current_user` |
| **Hằng số** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` | `maxRetries` |
| **Boolean** | Prefix `is`, `has`, `can` | `isLoggedIn`, `hasPermission` | `loggedIn` |
| **Array** | Số nhiều | `users`, `permissions` | `userList` |
| **State React** | camelCase + setter `set` | `[user, setUser]` | `[User, SetUser]` |

### 1.5. Đặt tên BẢNG DATABASE (Tables)

| Quy tắc | Ví dụ đúng | Ví dụ sai |
|---------|------------|-----------|
| snake_case tiếng Việt không dấu | `nhan_su`, `khach_hang` | `NhanSu`, `khách_hàng` |
| Số ít | `don_hang` | `don_hangs` |
| Prefix theo module nếu cần | `chat_messages`, `chat_conversations` | `messages` |

### 1.6. Đặt tên CỘT DATABASE (Columns)

| Quy tắc | Ví dụ đúng | Ví dụ sai |
|---------|------------|-----------|
| snake_case | `ho_ten`, `email`, `so_dien_thoai` | `hoTen`, `SoDienThoai` |
| Cột normalized thêm hậu tố | `vi_tri_normalized`, `phan_loai_normalized` | `vitri_norm` |
| Foreign key thêm `_id` | `user_id`, `order_id` | `userId` |
| Timestamp dùng `_at` | `created_at`, `updated_at` | `createdDate` |

---

## 🏠 NGUYÊN TẮC 2: CẤU TRÚC PHÒNG (ROOM)

> Mọi phòng/room được tạo ra **BẮT BUỘC** phải có đầy đủ các thành phần sau:

### 2.1. Các thành phần bắt buộc

| Thành phần | Mô tả | Import từ |
|------------|-------|-----------|
| **MenuTren** | Menu navigation phía trên | `@/app/GiaoDienTong/MenuTren/MenuTren` |
| **MenuDuoi** | Menu navigation phía dưới | `@/app/GiaoDienTong/MenuDuoi/MenuDuoi` |
| **Gradient nền** | Background gradient màu sắc | CSS inline hoặc Tailwind |

### 2.2. Template chuẩn cho một phòng

```tsx
'use client';

import React from 'react';
import MenuTren from '@/app/GiaoDienTong/MenuTren/MenuTren';
import MenuDuoi from '@/app/GiaoDienTong/MenuDuoi/MenuDuoi';

export default function PhongXxx() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[màu1] via-[màu2] to-[màu3]">
      {/* Menu Trên */}
      <MenuTren />
      
      {/* Nội dung chính */}
      <main className="pt-16 pb-20 px-4">
        {/* Content here */}
      </main>
      
      {/* Menu Dưới */}
      <MenuDuoi />
    </div>
  );
}
```

### 2.3. Bảng màu gradient theo loại phòng

| Phòng | Gradient | Ý nghĩa |
|-------|----------|---------|
| **phongadmin** | `from-slate-900 via-slate-800 to-slate-900` | Tối, chuyên nghiệp |
| **phongquanly** | `from-blue-900 via-slate-800 to-blue-900` | Xanh dương, quyền lực |
| **phongsales** | `from-emerald-900 via-slate-800 to-emerald-900` | Xanh lá, tăng trưởng |
| **phongctv** | `from-purple-900 via-slate-800 to-purple-900` | Tím, sáng tạo |
| **phongparttime** | `from-orange-900 via-slate-800 to-orange-900` | Cam, năng động |
| **phongtho** | `from-amber-900 via-stone-800 to-amber-900` | Vàng nâu, thủ công |
| **phongthietke** | `from-pink-900 via-slate-800 to-pink-900` | Hồng, nghệ thuật |
| **phongvip** | `from-yellow-900 via-amber-800 to-yellow-900` | Vàng gold, sang trọng |
| **phongdoitac** | `from-cyan-900 via-slate-800 to-cyan-900` | Xanh cyan, hợp tác |
| **phongkhachmoi** | `from-teal-900 via-slate-800 to-teal-900` | Xanh teal, chào đón |
| **phongkhachcu** | `from-indigo-900 via-slate-800 to-indigo-900` | Indigo, thân thuộc |
| **trangchu** | `from-zinc-900 via-black to-zinc-900` | Đen, trang trọng |
| **phongtrunbay** | `from-stone-900 via-neutral-800 to-stone-900` | Nâu đá, gallery |

### 2.4. Checklist tạo phòng mới

- [ ] Có import MenuTren
- [ ] Có import MenuDuoi
- [ ] Có gradient background (from-via-to)
- [ ] Có padding-top cho MenuTren (~pt-16)
- [ ] Có padding-bottom cho MenuDuoi (~pb-20)
- [ ] Có min-h-screen để full màn hình

---

## � NGUYÊN TẮC 3: PHÂN QUYỀN TRUY CẬP PHÒNG

> **BẢO MẬT 3 LỚP**: Mỗi phòng PHẢI có kiểm tra quyền ở **MIDDLEWARE** + **FRONTEND** + **BACKEND**

### 3.1. Ma trận phân quyền

#### 🔴 NHÂN SỰ (nhan_su) - CẤM VÀO /trangchu

| Vị trí (vi_tri) | Phòng được phép | Route |
|-----------------|-----------------|-------|
| **admin** | Phòng Admin | `/phongadmin` |
| **quanly** | Phòng Quản Lý | `/phongquanly` |
| **sales** | Phòng Sales | `/phongsales` |
| **congtacvien** | Phòng CTV | `/phongctv` |
| **parttime** | Phòng Part-time | `/phongparttime` |
| **thosanxuat** | Phòng Thợ | `/phongtho` |
| **thietke** | Phòng Thiết Kế | `/phongthietke` |

> ⚠️ **QUAN TRỌNG**: Tất cả nhân sự (kể cả admin) **KHÔNG ĐƯỢC** vào `/trangchu`

#### 🟢 KHÁCH HÀNG (khach_hang) - ĐƯỢC VÀO /trangchu

| Phân loại (phan_loai) | Phòng riêng | Các route được phép |
|-----------------------|-------------|---------------------|
| **vip** | Phòng VIP | `/phongvip`, `/trangchu`, `/phongtrunbay` |
| **doitac** | Phòng Đối Tác | `/phongdoitac`, `/trangchu`, `/phongtrunbay` |
| **moi** | Phòng Khách Mới | `/phongkhachmoi`, `/trangchu`, `/phongtrunbay` |
| **damuahang** | Phòng Khách Cũ | `/phongkhachcu`, `/trangchu`, `/phongtrunbay` |
| **khtrongtam** | Phòng VIP | `/trangchu`, `/phongtrunbay` |

#### 🟡 KHÁCH THAM QUAN (visitor - không đăng nhập)

| Route được phép | Ghi chú |
|-----------------|---------|
| `/trangchu` | Trang chủ |
| `/phongtrunbay` | Phòng trưng bày |
| `/` | Root redirect |

### 3.2. Bảo mật lớp 1: MIDDLEWARE (Server-side) ⭐ QUAN TRỌNG NHẤT

> **KHÔNG THỂ BYPASS** - Chạy trên server trước khi page load

File: `middleware.ts`

```typescript
// Ma trận phân quyền
const ROOM_PERMISSIONS: Record<string, string[]> = {
  '/phongadmin': ['admin'],
  '/phongquanly': ['quanly', 'admin'],
  '/phongsales': ['sales', 'admin'],
  // ...
};

// Kiểm tra trong middleware
const matchedRoom = Object.keys(ROOM_PERMISSIONS).find(room => path.startsWith(room));
if (matchedRoom) {
  const allowedRoles = ROOM_PERMISSIONS[matchedRoom];
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL('/CongDangNhap', request.url));
  }
}
```

### 3.3. Bảo mật lớp 2: FRONTEND (Client-side)

Mỗi phòng **BẮT BUỘC** có đoạn code kiểm tra quyền ở đầu component:

```tsx
// 🔐 KIỂM TRA QUYỀN TRUY CẬP - FRONTEND
useEffect(() => {
  const checkAccess = () => {
    const userInfo = localStorage.getItem('USER_INFO');
    if (!userInfo) {
      router.push('/CongDangNhap');
      return;
    }
    
    const user = JSON.parse(userInfo);
    const allowedRoles = ['admin']; // Thay đổi theo từng phòng
    
    if (!allowedRoles.includes(user.role)) {
      router.push('/'); // Redirect về trang chủ hoặc phòng của họ
      return;
    }
    
    setUser(user);
    setLoading(false);
  };
  
  checkAccess();
}, [router]);
```

### 3.4. Bảo mật lớp 3: BACKEND (Supabase RLS)

Mỗi bảng/RPC liên quan đến phòng **BẮT BUỘC** có RLS policy:

```sql
-- Ví dụ: Chỉ admin xem được dữ liệu admin
CREATE POLICY "admin_only" ON admin_data
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM nhan_su 
    WHERE LOWER(email) = LOWER(get_current_user_email())
    AND vi_tri_normalized = 'admin'
  )
);
```

### 3.5. Mapping role → allowed routes

```typescript
const ROLE_ROUTES = {
  // Nhân sự
  admin: ['/phongadmin', '/api'],
  quanly: ['/phongquanly', '/api'],
  sales: ['/phongsales', '/api'],
  congtacvien: ['/phongctv', '/api'],
  parttime: ['/phongparttime', '/api'],
  thosanxuat: ['/phongtho', '/api'],
  thietke: ['/phongthietke', '/api'],
  
  // Khách hàng
  vip: ['/phongvip', '/trangchu', '/phongtrunbay', '/api'],
  doitac: ['/phongdoitac', '/trangchu', '/phongtrunbay', '/api'],
  moi: ['/phongkhachmoi', '/trangchu', '/phongtrunbay', '/api'],
  damuahang: ['/phongkhachcu', '/trangchu', '/phongtrunbay', '/api'],
  khtrongtam: ['/trangchu', '/phongtrunbay', '/api'],
  
  // Visitor
  guest: ['/trangchu', '/phongtrunbay', '/'],
};
```

### 3.6. Checklist bảo mật khi tạo phòng

- [ ] **Lớp 1 (Middleware)**: Thêm route vào `ROOM_PERMISSIONS` trong `middleware.ts`
- [ ] **Lớp 2 (Frontend)**: Có useEffect kiểm tra quyền ở đầu component
- [ ] **Lớp 3 (Backend)**: RLS policy cho dữ liệu nhạy cảm
- [ ] Có redirect nếu không có quyền
- [ ] Loading state trong khi kiểm tra
- [ ] Không render nội dung nếu chưa xác thực

---

## 📝 GHI CHÚ

- File này được tạo ngày: **31/12/2024**
- Cập nhật lần cuối: **31/12/2024** - Nâng cấp lên Bảo mật 3 lớp (thêm Middleware)
- Mọi thay đổi phải được ghi nhận vào phần này

---

## ✅ CHECKLIST TRƯỚC KHI TẠO MỚI

Trước khi tạo file/folder/hàm mới, AI phải tự hỏi:

- [ ] Đã đọc file NguyenTac.md chưa?
- [ ] Tên có đúng quy tắc đặt tên không?
- [ ] Có trùng với file/folder/hàm đã có không?
- [ ] Vị trí đặt file có hợp lý không?
- [ ] Có cần cập nhật documentation không?

---

> ⚠️ **QUAN TRỌNG**: Nếu không chắc chắn về cách đặt tên, hãy HỎI USER trước khi tạo.
