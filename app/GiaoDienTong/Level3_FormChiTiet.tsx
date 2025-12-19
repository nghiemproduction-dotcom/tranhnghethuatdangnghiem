'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Loader2, Upload, ImageIcon, Check } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';
// 🟢 Đảm bảo bạn đã tạo file InputRegistry.tsx ở đường dẫn này
import { renderField } from '@/app/GiaoDienTong/ModalTaoModule/ColumnTypes/InputRegistry'; 

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    config: ModuleConfig;
    initialData?: any; 
    userRole: string; 
}

export default function Level3_FormChiTiet({ isOpen, onClose, onSuccess, config, initialData, userRole }: Props) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [error, setError] = useState('');

    // Kiểm tra quyền
    const canEdit = ['admin', 'adminsystem', 'quanly', 'manager', 'thietke', 'boss'].some(r => userRole.includes(r));
    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // --- LOGIC XỬ LÝ ẢNH ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colKey: string) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingImg(true);
        try {
            const fileName = `${config.bangDuLieu}/${Date.now()}.jpg`;
            const { error } = await supabase.storage.from('images').upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            setFormData((prev: any) => ({ ...prev, [colKey]: data.publicUrl }));
        } catch (err: any) { alert(err.message); } finally { setUploadingImg(false); }
    };

    // --- LOGIC LƯU DỮ LIỆU ---
    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            const payload: any = {};
            config.danhSachCot.forEach(col => {
                if (col.tuDong) return; // Bỏ qua cột tự động
                const val = formData[col.key];
                
                // Chuẩn hóa dữ liệu trước khi gửi
                if ((col.kieuDuLieu === 'link_array' || col.kieuDuLieu === 'text[]') && Array.isArray(val)) {
                    payload[col.key] = val.filter((v: string) => v && v.trim() !== '');
                } else if (['integer', 'number', 'float', 'numeric'].includes(col.kieuDuLieu)) {
                    payload[col.key] = val === '' ? null : Number(val);
                } else {
                    if (val !== undefined) payload[col.key] = val;
                }
            });

            if (isEditMode) { 
                const { error } = await supabase.from(config.bangDuLieu).update(payload).eq('id', initialData.id);
                if (error) throw error;
            } else { 
                const { error } = await supabase.from(config.bangDuLieu).insert(payload);
                if (error) throw error;
            }
            onSuccess(); onClose();
        } catch (err: any) { setError('Lỗi lưu: ' + err.message); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa vĩnh viễn?')) return;
        setLoading(true);
        const { error } = await supabase.from(config.bangDuLieu).delete().eq('id', initialData.id);
        setLoading(false);
        if (!error) { onSuccess(); onClose(); } else alert(error.message);
    };

    const imgCol = config.danhSachCot.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key));

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl h-[90vh] bg-[#110d0c] border border-[#8B5E3C]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                
                {/* Header */}
                <div className="h-16 border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 bg-[#1a120f] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#C69C6D]/10 rounded-lg">{isEditMode ? <Check size={20} className="text-[#C69C6D]"/> : <Upload size={20} className="text-[#C69C6D]"/>}</div>
                        <div>
                            <h2 className="text-lg font-bold text-[#F5E6D3] uppercase">{isEditMode ? 'Cập Nhật' : 'Thêm Mới'}</h2>
                            <p className="text-[10px] text-[#8B5E3C]">MODULE: {config.tenModule}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && isEditMode && <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={20}/></button>}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={24}/></button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Cột ảnh (Trái) */}
                    {imgCol && (
                        <div className="w-full lg:w-[30%] bg-[#0f0b0a] border-r border-[#8B5E3C]/20 p-6 flex flex-col items-center justify-center">
                            <div className="relative w-full aspect-square bg-[#1a120f] rounded-xl flex items-center justify-center text-[#5D4037] overflow-hidden group border border-[#8B5E3C]/30">
                                {formData[imgCol.key] ? <img src={formData[imgCol.key]} className="w-full h-full object-cover"/> : <ImageIcon size={48}/>}
                                {canEdit && (
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[#C69C6D] transition-opacity">
                                        {uploadingImg ? <Loader2 size={32} className="animate-spin"/> : <Upload size={32}/>}
                                        <span className="text-xs font-bold mt-2 uppercase">Tải ảnh</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imgCol.key)} disabled={uploadingImg}/>
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cột Form (Phải) */}
                    <div className="flex-1 bg-[#110d0c] p-8 overflow-y-auto custom-scroll">
                        {error && <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200"><AlertCircle size={20}/> {error}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.danhSachCot.map((col) => {
                                if (['hinh_anh', 'avatar', 'image'].includes(col.key)) return null;
                                
                                // Kiểm tra phân quyền (Nếu có cấu hình quyền xem)
                                if (col.quyenXem && col.quyenXem.length > 0 && !col.quyenXem.some(role => userRole.includes(role))) return null;
                                
                                const isReadOnly = !canEdit || (col.quyenSua && col.quyenSua.length > 0 && !col.quyenSua.some(role => userRole.includes(role)));
                                const isFullWidth = ['mo_ta', 'ghi_chu', 'file_thiet_ke', 'lich_su_chinh_sua'].includes(col.key) || col.kieuDuLieu === 'link_array' || col.kieuDuLieu === 'history';

                                return (
                                    <div key={col.key} className={isFullWidth ? "md:col-span-2" : ""}>
                                        <label className="flex items-center gap-1 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-widest mb-2">
                                            {col.label} {col.batBuoc && <span className="text-red-500">*</span>}
                                        </label>
                                        
                                        {/* 🟢 GỌI RENDER TỪ REGISTRY (ĐÃ FIX LỖI TYPE ANY) */}
                                        {renderField(
                                            col, 
                                            formData[col.key], 
                                            (val: any) => setFormData({ ...formData, [col.key]: val }), 
                                            isReadOnly || col.tuDong || false
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {canEdit && (
                    <div className="h-20 border-t border-[#8B5E3C]/20 bg-[#161210] flex items-center justify-end px-8 gap-4">
                        <button onClick={onClose} className="px-6 py-3 rounded-lg text-gray-400 hover:text-[#F5E6D3] font-bold text-xs uppercase">Hủy Bỏ</button>
                        <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase rounded-lg shadow-lg">
                            {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} <span>Lưu Dữ Liệu</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}