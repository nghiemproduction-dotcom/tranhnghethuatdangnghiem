# Generic Form Components với Extension Points

## Tổng quan

Dự án này cung cấp các component form generic có thể tái sử dụng cho việc tạo mới và chỉnh sửa dữ liệu trong tất cả các bảng của hệ thống, với hệ thống **Extension Points** mạnh mẽ để xử lý các trường hợp ngoại lệ.

## Components

### 1. GenericForm

Component form chính có thể xử lý việc tạo mới và chỉnh sửa cho bất kỳ bảng nào.

**Props:**
- `config: ModuleConfig` - Cấu hình module chứa thông tin bảng và các cột
- `initialData?: any` - Dữ liệu ban đầu (cho chế độ edit)
- `onSubmit: (data: any) => void` - Callback khi submit thành công
- `onCancel: () => void` - Callback khi hủy
- `isCreateMode: boolean` - true = tạo mới, false = chỉnh sửa
- `userRole?: string` - Vai trò người dùng (mặc định: 'user')
- `userEmail?: string` - Email người dùng để tự động điền
- `parentTitle?: string` - Tiêu đề phụ (hiển thị trong modal)

**Tính năng:**
- Tự động generate form fields dựa trên `config.danhSachCot`
- Hỗ trợ đầy đủ các loại field: text, textarea, number, boolean, date, datetime, image, select_dynamic
- Validation tự động cho các field bắt buộc
- Upload ảnh tự động
- Xử lý select dropdown từ bảng liên kết
- Auto-fill các field hệ thống (nguoi_tao, tao_luc, cap_nhat_luc)

### 2. GenericFormModal

Component modal wrapper cho GenericForm, cung cấp giao diện modal đầy đủ.

## Extension Points - Xử lý trường hợp ngoại lệ

GenericForm hỗ trợ các **extension points** để customize behavior cho từng bảng cụ thể mà không cần thay đổi code core.

### 1. Custom Form Component (Override hoàn toàn)

```typescript
const customFormConfig: ModuleConfig = {
    // ... config cơ bản
    formExtensions: {
        customFormComponent: MyCustomFormComponent
    }
};
```

### 2. Extension Functions

```typescript
const extensions = {
    // Validation tùy chỉnh
    customValidation: (data, config) => ({
        isValid: boolean,
        errors: Record<string, string>
    }),

    // Xử lý trước khi submit
    beforeSubmit: async (data, config) => {
        // Modify data before saving
        return modifiedData;
    },

    // Xử lý sau khi submit
    afterSubmit: async (data, config) => {
        // Side effects after successful save
    },

    // Khởi tạo form với logic đặc biệt
    onFormInit: (formData, config) => {
        // Set default values, computed fields, etc.
        return modifiedFormData;
    },

    // Xử lý khi thay đổi field
    onFormChange: (field, value, formData, config) => {
        // Computed fields, cascading updates, etc.
        return modifiedFormData;
    }
};
```

### 3. Field-level Customizations

```typescript
const extensions = {
    fieldOverrides: {
        'field_key': {
            // Override field properties
            label: 'Custom Label',
            batBuoc: true,
            readOnly: true,

            // Custom renderer cho field này
            customRenderer: (value, onChange, error) => (
                <CustomFieldComponent value={value} onChange={onChange} error={error} />
            ),

            // Custom validation cho field này
            customValidation: (value) => {
                if (value < 0) return 'Phải >= 0';
                return '';
            }
        }
    },

    // Hoặc custom renderer cho tất cả fields
    customFieldRenderer: (field, value, onChange, error) => {
        if (field.key === 'special_field') {
            return <SpecialFieldRenderer {...} />;
        }
        return null; // Sử dụng renderer mặc định
    }
};
```

## Ví dụ thực tế

### Đơn hàng với tính toán tự động

```typescript
const donHangExtensions = {
    customValidation: (data) => {
        const errors = {};
        if (data.so_luong < 0) errors.so_luong = 'Số lượng không âm';
        if (data.don_gia <= 0) errors.don_gia = 'Đơn giá > 0';

        // Tính tổng tiền
        data.tong_tien = data.so_luong * data.don_gia;

        return { isValid: Object.keys(errors).length === 0, errors };
    },

    beforeSubmit: async (data) => {
        // Tính thuế và gửi notification
        data.thue_vat = data.tong_tien * 0.1;
        data.tong_tien_sau_thue = data.tong_tien + data.thue_vat;

        await sendNotification(data);
        return data;
    },

    afterSubmit: async (data) => {
        // Cập nhật kho hàng
        await updateInventory(data.san_pham_id, -data.so_luong);
    },

    fieldOverrides: {
        'tong_tien': {
            readOnly: true,
            customRenderer: (value) => (
                <div className="calculated-field">
                    {value?.toLocaleString()} VND
                </div>
            )
        }
    }
};
```

### Khách hàng với phone number đặc biệt

```typescript
const khachHangExtensions = {
    customFieldRenderer: (field, value, onChange, error) => {
        if (field.key === 'dien_thoai') {
            return (
                <div className="phone-input">
                    <select className="country-code">
                        <option>+84</option>
                        <option>+1</option>
                    </select>
                    <input
                        type="tel"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Số điện thoại"
                    />
                </div>
            );
        }
        return null;
    }
};
```

## Cách sử dụng

### 1. Định nghĩa extensions

```typescript
// Trong file riêng hoặc cùng file config
const myTableExtensions = {
    // ... extension logic
};
```

### 2. Thêm vào ModuleConfig

```typescript
const config: ModuleConfig = {
    id: 'my-table',
    tenModule: 'My Table',
    bangDuLieu: 'my_table',
    danhSachCot: [...],
    formExtensions: myTableExtensions
};
```

### 3. Sử dụng như bình thường

```tsx
<GenericForm
    config={config}
    isCreateMode={true}
    onSubmit={handleSubmit}
    onCancel={handleCancel}
/>
```

## Lợi ích

- ✅ **Không cần thay đổi code core** - Extensions hoàn toàn tách biệt
- ✅ **Linh hoạt tối đa** - Có thể override từ field level đến toàn bộ form
- ✅ **Dễ maintain** - Logic riêng cho từng bảng được nhóm lại
- ✅ **Backward compatible** - Các bảng không có extensions vẫn hoạt động bình thường
- ✅ **Type-safe** - TypeScript hỗ trợ đầy đủ

## File tham khảo

- `FormExtensions_Examples.tsx` - Các ví dụ thực tế
- `GenericForm.tsx` - Implementation chi tiết
- `GenericModule.tsx` - Tích hợp với hệ thống module