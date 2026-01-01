'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, AlertTriangle, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { createVatTuAction, updateVatTuAction } from '@/app/actions/QuyenHanKho';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

const FIELD_ORDER = ['ma_sku', 'ten_vat_tu', 'loai_vat_tu', 'don_vi_tinh', 'ton_kho', 'gia_von', 'gia_ban', 'hinh_anh'];
const COLUMN_LABELS: any = { ma_sku: "Mã SKU", ten_vat_tu: "Tên vật tư", loai_vat_tu: "Phân loại", don_vi_tinh: "Đơn vị", ton_kho: "Tồn kho", gia_von: "Giá vốn", gia_ban: "Giá bán", hinh_anh: "Hình ảnh" };

export default function FormVatTu({ isOpen, onClose, onSuccess, initialData }: any) {
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) setFormData(initialData ? { ...initialData } : { loai_vat_tu: 'nguyen_lieu', ton_kho: 0 });
    }, [isOpen, initialData]);

    const handleChange = (k: string, v: any) => setFormData((p: any) => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!formData.ten_vat_tu) return setError("Thiếu tên vật tư");
        setIsSaving(true);
        try {
            const action = initialData?.id ? updateVatTuAction(initialData.id, formData) : createVatTuAction(formData);
            const res = await action;
            if (res.success) { onSuccess(); onClose(); } else throw new Error(res.error);
        } catch (e: any) { setError(e.message); } finally { setIsSaving(false); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true);
        try {
            const compressed = await compressImage(file, 0.7, 800);
            const name = `prod_${Date.now()}.jpg`;
            const { error } = await supabase.storage.from('products').upload(name, compressed);
            if (error) throw error;
            const { data } = supabase.storage.from('products').getPublicUrl(name);
            handleChange('hinh_anh', data.publicUrl);
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[200]">
            <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl flex flex-col shadow-2xl h-[85vh]">
                <div className="p-4 text-center border-b border-white/10"><h2 className="text-[#C69C6D] font-black uppercase tracking-widest">{initialData ? 'CẬP NHẬT' : 'THÊM MỚI'}</h2></div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                    {error && <div className="p-2 bg-red-900/20 text-red-400 text-xs font-bold rounded">{error}</div>}
                    
                    {/* Upload */}
                    <div onClick={() => !uploading && fileRef.current?.click()} className="flex flex-col items-center cursor-pointer group">
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-[#C69C6D]/50 flex items-center justify-center overflow-hidden bg-black">
                            {formData.hinh_anh ? <img src={formData.hinh_anh} className="w-full h-full object-cover"/> : <ImageIcon className="text-[#C69C6D]/30"/>}
                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div>}
                        </div>
                        <span className="text-[10px] text-[#C69C6D] font-bold mt-2 uppercase flex items-center gap-1"><UploadCloud size={12}/> {formData.hinh_anh ? 'Đổi Ảnh' : 'Tải Ảnh'}</span>
                        <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*"/>
                    </div>

                    {FIELD_ORDER.filter(k => k !== 'hinh_anh').map(k => (
                        <div key={k} className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-[#C69C6D] uppercase">{COLUMN_LABELS[k]}</label>
                            {k === 'loai_vat_tu' ? (
                                <select value={formData[k]||''} onChange={e => handleChange(k, e.target.value)} className="bg-black border border-[#C69C6D]/40 rounded-lg p-3 text-white text-sm font-bold">
                                    <option value="nguyen_lieu">Nguyên Liệu</option><option value="thanh_pham">Thành Phẩm</option><option value="dich_vu">Dịch Vụ</option>
                                </select>
                            ) : (
                                <input type={k.includes('gia') || k === 'ton_kho' ? 'number' : 'text'} value={formData[k]||''} onChange={e => handleChange(k, e.target.value)} className="bg-black border border-[#C69C6D]/40 rounded-lg p-3 text-white text-sm font-bold"/>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-lg">Hủy</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 bg-[#C69C6D] text-black font-bold uppercase text-xs rounded-lg flex justify-center items-center gap-2">{isSaving && <Loader2 className="animate-spin" size={14}/>} Lưu</button>
                </div>
            </div>
        </div>
    );
}