'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import {
    Camera, X, ChevronDown, UploadCloud, PlusCircle, Database,
    Loader2, Pencil, RotateCcw, User, Lock, Save,
    ToggleLeft, ToggleRight, Link as LinkIcon, Type, Hash, Calendar, AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { ModuleConfig, CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isCreateMode: boolean;
    userRole?: string;
    userEmail?: string;
    parentTitle?: string;
}

interface FormField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    value: any;
    error?: string;
    options?: { value: any; label: string }[];
}

export default function GenericForm({
    config,
    initialData = {},
    onSubmit,
    onCancel,
    isCreateMode,
    userRole = 'user',
    userEmail = '',
    parentTitle = ''
}: Props) {
    // 🟢 EXTENSION: Check for custom form component
    const CustomFormComponent = config.formExtensions?.customFormComponent;

    // If there's a custom form component, use it instead
    if (CustomFormComponent) {
        return (
            <CustomFormComponent
                config={config}
                initialData={initialData}
                onSubmit={onSubmit}
                onCancel={onCancel}
                isCreateMode={isCreateMode}
                userRole={userRole}
                userEmail={userEmail}
                parentTitle={parentTitle}
            />
        );
    }

    // Continue with default GenericForm logic...
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    // Initialize form data
    useEffect(() => {
        const initialFormData: Record<string, any> = {};
        config.danhSachCot?.forEach(col => {
            if (col.key === 'id' && isCreateMode) return; // Skip ID for create mode
            initialFormData[col.key] = initialData[col.key] || getDefaultValue(col);
        });

        // Auto-fill system fields
        if (isCreateMode) {
            if (userEmail) initialFormData.nguoi_tao = userEmail;
            initialFormData.tao_luc = new Date().toISOString();
        }
        initialFormData.cap_nhat_luc = new Date().toISOString();

        // 🟢 EXTENSION: Apply onFormInit if available
        let processedData = initialFormData;
        if (config.formExtensions?.onFormInit) {
            processedData = config.formExtensions.onFormInit(initialFormData, config);
        }

        setFormData(processedData);
    }, [config.danhSachCot, initialData, isCreateMode, userEmail]);

    const getDefaultValue = (col: CotHienThi) => {
        switch (col.kieuDuLieu) {
            case 'boolean': return false;
            case 'number': return 0;
            case 'date': return new Date().toISOString().split('T')[0];
            case 'datetime': return new Date().toISOString();
            case 'textarea': return '';
            case 'image': return '';
            case 'select_dynamic': return null;
            default: return '';
        }
    };

    // Fetch options for select fields
    const selectQueries = useMemo(() => {
        return config.danhSachCot?.filter(col => col.kieuDuLieu === 'select_dynamic' && col.refTable) || [];
    }, [config.danhSachCot]);

    const selectOptions = useQueries({
        queries: selectQueries.map(col => ({
            queryKey: ['options', col.refTable],
            queryFn: async () => {
                const { data, error } = await supabase.from(col.refTable!).select('*').limit(1000);
                if (error) throw error;
                return data?.map(item => ({
                    value: item.id,
                    label: item.ten || item.ho_ten || item.tieu_de || item.title || `ID: ${item.id}`
                })) || [];
            },
            enabled: !!col.refTable
        }))
    });

    const getOptionsForField = (key: string) => {
        const col = config.danhSachCot?.find(c => c.key === key);
        if (!col || col.kieuDuLieu !== 'select_dynamic') return [];
        const queryIndex = selectQueries.findIndex(q => q.key === key);
        return selectOptions[queryIndex]?.data || [];
    };

    const validateField = (key: string, value: any, col: CotHienThi): string => {
        if (col.batBuoc && (!value || value === '')) {
            return `${col.label} là bắt buộc`;
        }

        switch (col.kieuDuLieu) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Email không hợp lệ';
                }
                break;
            case 'number':
                if (value && isNaN(Number(value))) {
                    return 'Phải là số';
                }
                break;
            case 'date':
                if (value && isNaN(Date.parse(value))) {
                    return 'Ngày không hợp lệ';
                }
                break;
        }

        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        config.danhSachCot?.forEach(col => {
            if (col.key === 'id') return;
            const error = validateField(col.key, formData[col.key], col);
            if (error) newErrors[col.key] = error;
        });

        // 🟢 EXTENSION: Apply custom validation if available
        if (config.formExtensions?.customValidation) {
            const customResult = config.formExtensions.customValidation(formData, config);
            if (!customResult.isValid) {
                Object.assign(newErrors, customResult.errors);
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (key: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [key]: value };

            // 🟢 EXTENSION: Apply onFormChange if available
            if (config.formExtensions?.onFormChange) {
                return config.formExtensions.onFormChange(key, value, newData, config);
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const handleImageUpload = async (key: string, file: File) => {
        setUploadingImages(prev => ({ ...prev, [key]: true }));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `uploads/${config.bangDuLieu}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            handleFieldChange(key, publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            setErrors(prev => ({ ...prev, [key]: 'Upload thất bại' }));
        } finally {
            setUploadingImages(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 EXTENSION: Apply beforeSubmit if available
        let submitData = { ...formData };
        if (config.formExtensions?.beforeSubmit) {
            try {
                submitData = await config.formExtensions.beforeSubmit(submitData, config);
            } catch (error) {
                console.error('beforeSubmit error:', error);
                setErrors({ submit: 'Lỗi xử lý dữ liệu trước khi lưu' });
                return;
            }
        }

        if (!validateForm()) return;

        setLoading(true);
        try {
            const finalSubmitData = { ...submitData };

            // Remove empty strings for optional fields
            Object.keys(finalSubmitData).forEach(key => {
                if (finalSubmitData[key] === '') {
                    const col = config.danhSachCot?.find(c => c.key === key);
                    if (!col?.batBuoc) {
                        delete finalSubmitData[key];
                    }
                }
            });

            let result;
            if (isCreateMode) {
                const { data, error } = await supabase
                    .from(config.bangDuLieu)
                    .insert([finalSubmitData])
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await supabase
                    .from(config.bangDuLieu)
                    .update(finalSubmitData)
                    .eq('id', initialData.id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            // 🟢 EXTENSION: Apply afterSubmit if available
            if (config.formExtensions?.afterSubmit) {
                try {
                    await config.formExtensions.afterSubmit(result, config);
                } catch (error) {
                    console.error('afterSubmit error:', error);
                    // Don't block success callback for afterSubmit errors
                }
            }

            onSubmit(result);
        } catch (error: any) {
            console.error('Submit error:', error);
            setErrors({ submit: error.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    const renderField = (col: CotHienThi) => {
        if (col.key === 'id') return null;

        const value = formData[col.key];
        const error = errors[col.key];
        const isUploading = uploadingImages[col.key];

        // 🟢 EXTENSION: Check for field overrides
        const fieldOverride = config.formExtensions?.fieldOverrides?.[col.key];
        const effectiveCol = fieldOverride ? { ...col, ...fieldOverride } : col;

        // 🟢 EXTENSION: Check for custom field renderer
        if (config.formExtensions?.customFieldRenderer) {
            const customRender = config.formExtensions.customFieldRenderer(effectiveCol, value, (newValue) => handleFieldChange(col.key, newValue), error);
            if (customRender) return customRender;
        }

        // 🟢 EXTENSION: Check for field-level custom renderer
        if (fieldOverride?.customRenderer) {
            return fieldOverride.customRenderer(value, (newValue) => handleFieldChange(col.key, newValue), error);
        }

        const baseClasses = `w-full px-3 py-2 bg-[#1a1512] border rounded-lg text-[#E8D4B9] placeholder-[#8B5E3C] focus:outline-none focus:border-[#C69C6D] transition-colors ${
            error ? 'border-red-500' : 'border-[#8B5E3C]/30'
        }`;

        switch (effectiveCol.kieuDuLieu) {
            case 'textarea':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                            value={value || ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value)}
                            className={`${baseClasses} resize-none`}
                            rows={4}
                            placeholder={`Nhập ${effectiveCol.label.toLowerCase()}`}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'boolean':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <div
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                    value ? 'bg-[#C69C6D]' : 'bg-[#8B5E3C]/30'
                                }`}
                                onClick={() => handleFieldChange(effectiveCol.key, !value)}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    value ? 'translate-x-7' : 'translate-x-1'
                                }`} />
                            </div>
                            <span className="text-sm font-medium text-[#C69C6D]">
                                {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                            </span>
                        </label>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'number':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value ? Number(e.target.value) : '')}
                            className={baseClasses}
                            placeholder={`Nhập ${effectiveCol.label.toLowerCase()}`}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'date':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value)}
                            className={baseClasses}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'datetime':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="datetime-local"
                            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value)}
                            className={baseClasses}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'image':
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex items-center space-x-3">
                            {value && (
                                <img src={value} alt={effectiveCol.label} className="w-16 h-16 object-cover rounded-lg border border-[#8B5E3C]/30" />
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(effectiveCol.key, file);
                                    }}
                                    className="hidden"
                                    id={`file-${effectiveCol.key}`}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor={`file-${effectiveCol.key}`}
                                    className={`inline-flex items-center px-4 py-2 bg-[#C69C6D] text-black rounded-lg cursor-pointer hover:bg-[#C69C6D]/80 transition-colors ${
                                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                    ) : (
                                        <UploadCloud className="mr-2" size={16} />
                                    )}
                                    {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                                </label>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'select_dynamic':
                const options = getOptionsForField(effectiveCol.key);
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={value || ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value)}
                            className={baseClasses}
                        >
                            <option value="">Chọn {effectiveCol.label.toLowerCase()}</option>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            default: // text, email, etc.
                return (
                    <div key={effectiveCol.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#C69C6D]">
                            {effectiveCol.label} {effectiveCol.batBuoc && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={effectiveCol.kieuDuLieu === 'email' ? 'email' : 'text'}
                            value={value || ''}
                            onChange={(e) => handleFieldChange(effectiveCol.key, e.target.value)}
                            className={baseClasses}
                            placeholder={`Nhập ${effectiveCol.label.toLowerCase()}`}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-[#8B5E3C]/30 pb-4 mb-6">
                <h3 className="text-lg font-bold text-[#C69C6D] uppercase flex items-center gap-2">
                    <Database size={18} />
                    {isCreateMode ? 'Tạo Dữ Liệu Mới' : 'Chỉnh Sửa Thông Tin'}
                    {parentTitle && <span className="text-sm text-[#8B5E3C]"> - {parentTitle}</span>}
                </h3>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {config.danhSachCot?.map(col => renderField(col))}
                </div>

                {errors.submit && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 border-t border-[#8B5E3C]/30">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-[#8B5E3C]/30 text-[#E8D4B9] rounded-lg hover:bg-[#8B5E3C]/50 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#C69C6D] text-black rounded-lg hover:bg-[#C69C6D]/80 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={16} />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2" size={16} />
                                {isCreateMode ? 'Tạo Mới' : 'Lưu Thay Đổi'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}