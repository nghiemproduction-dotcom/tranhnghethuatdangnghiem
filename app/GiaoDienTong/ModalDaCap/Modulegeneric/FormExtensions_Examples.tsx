// Ví dụ sử dụng Form Extensions cho các trường hợp ngoại lệ

import React from 'react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

// 🟢 VÍ DỤ 1: Custom Form Component hoàn toàn cho bảng "nhan_su"
const CustomNhanSuForm = ({ config, initialData, onSubmit, onCancel, isCreateMode, ...props }: {
    config: ModuleConfig;
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isCreateMode: boolean;
    [key: string]: any;
}) => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#C69C6D]">Form Nhân Sự Đặc Biệt</h3>
            {/* Custom form logic riêng cho nhân sự */}
            <div>Custom form content here...</div>
        </div>
    );
};

// 🟢 VÍ DỤ 2: Extension points cho bảng "don_hang"
const donHangExtensions = {
    // Validation tùy chỉnh
    customValidation: (data: any, config: ModuleConfig) => {
        const errors: Record<string, string> = {};

        // Kiểm tra số lượng không âm
        if (data.so_luong < 0) {
            errors.so_luong = 'Số lượng không được âm';
        }

        // Kiểm tra đơn giá hợp lệ
        if (data.don_gia <= 0) {
            errors.don_gia = 'Đơn giá phải lớn hơn 0';
        }

        // Tính tổng tiền tự động
        data.tong_tien = data.so_luong * data.don_gia;

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Xử lý trước khi submit
    beforeSubmit: async (data: any, config: ModuleConfig) => {
        // Tính thuế VAT 10%
        data.thue_vat = data.tong_tien * 0.1;
        data.tong_tien_sau_thue = data.tong_tien + data.thue_vat;

        // Gửi email thông báo
        await fetch('/api/notifications/order-created', {
            method: 'POST',
            body: JSON.stringify({ orderId: data.id, total: data.tong_tien_sau_thue })
        });

        return data;
    },

    // Xử lý sau khi submit
    afterSubmit: async (data: any, config: ModuleConfig) => {
        // Cập nhật kho hàng
        await fetch('/api/inventory/update', {
            method: 'POST',
            body: JSON.stringify({
                productId: data.san_pham_id,
                quantity: -data.so_luong
            })
        });
    },

    // Khởi tạo form với giá trị mặc định
    onFormInit: (formData: any, config: ModuleConfig) => {
        return {
            ...formData,
            ngay_dat_hang: new Date().toISOString().split('T')[0],
            trang_thai: 'pending'
        };
    },

    // Xử lý khi thay đổi field
    onFormChange: (field: string, value: any, formData: any, config: ModuleConfig) => {
        const newData = { ...formData };

        // Tự động tính tổng khi thay đổi số lượng hoặc đơn giá
        if (field === 'so_luong' || field === 'don_gia') {
            newData.tong_tien = (newData.so_luong || 0) * (newData.don_gia || 0);
        }

        return newData;
    },

    // Override field rendering
    fieldOverrides: {
        'tong_tien': {
            readOnly: true,
            customRenderer: (value: any, onChange: (value: any) => void, error?: string) => (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#C69C6D]">
                        Tổng tiền (tự động tính)
                    </label>
                    <div className="px-3 py-2 bg-[#1a1512] border border-[#8B5E3C]/30 rounded-lg text-[#E8D4B9]">
                        {value?.toLocaleString('vi-VN')} VND
                    </div>
                </div>
            )
        },

        'san_pham_id': {
            customRenderer: (value: any, onChange: (value: any) => void, error?: string) => (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#C69C6D]">
                        Sản phẩm *
                    </label>
                    {/* Custom product selector với hình ảnh */}
                    <ProductSelector value={value} onChange={onChange} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            )
        }
    }
};

// 🟢 VÍ DỤ 3: Custom field renderer cho bảng "khach_hang"
const khachHangExtensions = {
    customFieldRenderer: (field: any, value: any, onChange: (value: any) => void, error?: string) => {
        // Custom renderer cho field phone
        if (field.key === 'dien_thoai') {
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#C69C6D]">
                        {field.label} {field.batBuoc && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex">
                        <select className="px-3 py-2 bg-[#1a1512] border border-[#8B5E3C]/30 rounded-l-lg text-[#E8D4B9]">
                            <option>+84</option>
                            <option>+1</option>
                        </select>
                        <input
                            type="tel"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 px-3 py-2 bg-[#1a1512] border-l-0 border border-[#8B5E3C]/30 rounded-r-lg text-[#E8D4B9] focus:border-[#C69C6D]"
                            placeholder="Số điện thoại"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            );
        }

        // Return null để sử dụng renderer mặc định cho các field khác
        return null;
    }
};

// 🟢 CÁCH SỬ DỤNG:

// 1. Custom form component hoàn toàn
const nhanSuConfig: ModuleConfig = {
    id: 'nhan-su-module',
    tenModule: 'Nhân Sự',
    bangDuLieu: 'nhan_su',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    danhSachCot: [],
    formExtensions: {
        customFormComponent: CustomNhanSuForm
    }
};

// 2. Extension points cho logic phức tạp
const donHangConfig: ModuleConfig = {
    id: 'don-hang-module',
    tenModule: 'Đơn Hàng',
    bangDuLieu: 'don_hang',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    danhSachCot: [],
    formExtensions: donHangExtensions
};

// 3. Custom field renderer
const khachHangConfig: ModuleConfig = {
    id: 'khach-hang-module',
    tenModule: 'Khách Hàng',
    bangDuLieu: 'khach_hang',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    danhSachCot: [],
    formExtensions: khachHangExtensions
};

// 🟢 COMPONENT HELPER (tùy chọn)
const ProductSelector = ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
    // Custom product selector với search, hình ảnh, etc.
    return (
        <div className="border border-[#8B5E3C]/30 rounded-lg p-2">
            {/* Product selection UI */}
        </div>
    );
};

export {
    CustomNhanSuForm,
    donHangExtensions,
    khachHangExtensions,
    nhanSuConfig,
    donHangConfig,
    khachHangConfig
};