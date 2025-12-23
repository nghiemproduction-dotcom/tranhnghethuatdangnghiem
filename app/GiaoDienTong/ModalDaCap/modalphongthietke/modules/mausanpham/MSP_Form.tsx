'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Loader2, Link as LinkIcon, Plus, Minus, ExternalLink, ImageIcon, Check } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; 
}

export default function MSP_Form({ isOpen, onClose, onSuccess, initialData }: Props) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loaiOptions, setLoaiOptions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { file_thiet_ke: [] });
            loadOptions();
        }
    }, [isOpen, initialData]);

    const loadOptions = async () => {
        const { data } = await supabase.from('mau_san_pham').select('the_loai');
        if (data) {
            const opts = Array.from(new Set(data.map((i: any) => i.the_loai))).filter(Boolean) as string[];
            setLoaiOptions(opts);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Lọc mảng link rỗng
            const cleanLinks = Array.isArray(formData.file_thiet_ke) 
                ? formData.file_thiet_ke.filter((l: string) => l && l.trim() !== '') 
                : [];

            const payload = {
                // 🟢 SỬA LẠI: Dùng 'mo_ta' thay vì 'ten_mau'
                mo_ta: formData.mo_ta, 
                the_loai: formData.the_loai,
                hinh_anh: formData.hinh_anh,
                file_thiet_ke: cleanLinks,
                // Các trường khác (Người đăng, Thời gian) để Trigger SQL lo
            };

            if (initialData?.id) {
                await supabase.from('mau_san_pham').update(payload).eq('id', initialData.id);
            } else {
                await supabase.from('mau_san_pham').insert(payload);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Lỗi lưu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileName = `mau_san_pham/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { error } = await supabase.storage.from('images').upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            setFormData({ ...formData, hinh_anh: data.publicUrl });
        } catch (err: any) {
            alert('Upload lỗi: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    const links = Array.isArray(formData.file_thiet_ke) ? formData.file_thiet_ke : [];

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-[#110d0c] border border-[#8B5E3C]/30 rounded-2xl flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* Header */}
                <div className="h-16 border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 bg-[#1a120f] shrink-0 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-[#F5E6D3] uppercase tracking-wide">
                        {initialData ? 'Cập Nhật Mẫu Sản Phẩm' : 'Thêm Mẫu Mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={24}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
                    
                    {/* Cột Trái: Ảnh */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="relative w-full aspect-square bg-[#0f0b0a] border-2 border-[#8B5E3C]/30 border-dashed rounded-xl flex items-center justify-center overflow-hidden group mb-4">
                            {formData.hinh_anh ? (
                                <img src={formData.hinh_anh} className="w-full h-full object-cover" alt="Preview"/>
                            ) : (
                                <div className="flex flex-col items-center text-[#5D4037]">
                                    <ImageIcon size={48} strokeWidth={1}/>
                                    <span className="text-xs mt-2 uppercase tracking-widest">Chưa có ảnh</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[#C69C6D] gap-2">
                                {uploading ? <Loader2 size={32} className="animate-spin"/> : <Upload size={32}/>}
                                <span className="text-xs font-bold uppercase">Tải ảnh lên</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
                            </label>
                        </div>
                    </div>

                    {/* Cột Phải: Form Input */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Mô Tả / Tên Mẫu <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                // 🟢 SỬA LẠI: Dùng 'mo_ta'
                                value={formData.mo_ta || ''} 
                                onChange={(e) => setFormData({...formData, mo_ta: e.target.value})}
                                className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#F5E6D3] focus:border-[#C69C6D] outline-none placeholder-[#5D4037]"
                                placeholder="Nhập tên hoặc mô tả mẫu..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Thể Loại</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    list="ds-theloai"
                                    value={formData.the_loai || ''} 
                                    onChange={(e) => setFormData({...formData, the_loai: e.target.value})}
                                    className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#F5E6D3] focus:border-[#C69C6D] outline-none placeholder-[#5D4037]"
                                    placeholder="Chọn hoặc nhập mới..."
                                />
                                <datalist id="ds-theloai">
                                    {loaiOptions.map((opt, i) => <option key={i} value={opt} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">File Thiết Kế (Google Drive Links)</label>
                            <div className="space-y-2 bg-[#1a120f]/50 p-3 rounded-xl border border-[#8B5E3C]/20">
                                {links.map((link: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={link} 
                                            onChange={(e) => {
                                                const newLinks = [...links]; newLinks[idx] = e.target.value;
                                                setFormData({...formData, file_thiet_ke: newLinks});
                                            }}
                                            className="flex-1 bg-[#1a120f] border border-[#8B5E3C]/30 rounded px-3 py-2 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none"
                                            placeholder="https://drive.google.com/..."
                                        />
                                        {link && <a href={link} target="_blank" className="p-2 text-[#C69C6D] hover:bg-[#C69C6D]/10 rounded"><ExternalLink size={16}/></a>}
                                        <button onClick={() => setFormData({...formData, file_thiet_ke: links.filter((_:any, i:number) => i !== idx)})} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Minus size={16}/></button>
                                    </div>
                                ))}
                                <button onClick={() => setFormData({...formData, file_thiet_ke: [...links, '']})} className="flex items-center gap-2 text-xs font-bold text-[#C69C6D] mt-2 px-3 py-2 border border-dashed border-[#8B5E3C]/50 w-full justify-center hover:bg-[#C69C6D]/10 rounded">
                                    <Plus size={14}/> Thêm Link File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-20 border-t border-[#8B5E3C]/20 bg-[#161210] flex items-center justify-end px-8 shrink-0 gap-4 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-3 rounded-lg text-gray-400 hover:text-[#F5E6D3] font-bold text-xs uppercase tracking-widest transition-colors">Hủy Bỏ</button>
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg">
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                        <span>Lưu Dữ Liệu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}