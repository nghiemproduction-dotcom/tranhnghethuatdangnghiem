'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle,  Hash,   Loader2, Upload, ImageIcon, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';

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

    // 🟢 FIX CAN EDIT: Đồng bộ danh sách Role
    const canEdit = ['admin', 'adminsystem', 'quanly', 'manager', 'admin_cung'].some(r => userRole.includes(r));
    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // ... (Giữ nguyên các hàm xử lý ảnh và input) ...
    // --- LOGIC NÉN ẢNH ---
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 800;
                let width = img.width; let height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                let quality = 0.7;
                const tryCompress = (q: number) => {
                    canvas.toBlob((blob) => {
                        if(!blob) return reject("Lỗi nén ảnh");
                        if(blob.size < 50 * 1024 || q < 0.1) { resolve(blob); } else { tryCompress(q - 0.1); }
                    }, 'image/jpeg', q);
                }
                tryCompress(quality);
            };
            img.onerror = reject;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colKey: string) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            setUploadingImg(true);
            const compressedBlob = await compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { error } = await supabase.storage.from('images').upload(fileName, compressedFile);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
            setFormData((prev: any) => ({ ...prev, [colKey]: publicUrl }));
        } catch (err: any) { alert("Lỗi upload ảnh: " + err.message); } finally { setUploadingImg(false); }
    };

    const validateForm = () => {
        for (const col of config.danhSachCot) {
            const val = formData[col.key];
            if (col.batBuoc && !val && val !== 0) throw new Error(`Trường "${col.label || col.key}" là bắt buộc.`);
            if (['dien_thoai', 'sdt', 'phone', 'mobile'].includes(col.key)) {
                if (val && !/^\d{10}$/.test(String(val))) throw new Error(`Số điện thoại phải bao gồm đúng 10 chữ số.`);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true); setError('');
        try {
            validateForm();
            const payload: any = {};
            config.danhSachCot.forEach(col => {
                if (!isEditMode && col.tuDong) return;
                if (formData[col.key] !== undefined) payload[col.key] = formData[col.key];
            });
            if (isEditMode) { const { error } = await supabase.from(config.bangDuLieu).update(payload).eq('id', initialData.id); if (error) throw error; } 
            else { const { error } = await supabase.from(config.bangDuLieu).insert(payload); if (error) throw error; }
            onSuccess(); onClose();
        } catch (err: any) { setError(err.message || 'Lỗi lưu dữ liệu.'); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa dữ liệu này?')) return;
        setLoading(true);
        try { const { error } = await supabase.from(config.bangDuLieu).delete().eq('id', initialData.id); if (error) throw error; onSuccess(); onClose(); } 
        catch (err: any) { alert("Lỗi xóa: " + err.message); setLoading(false); }
    };

    const renderInput = (col: any) => {
        const val = formData[col.key] || '';
        const isReadOnly = !canEdit || (col.tuDong && isEditMode);
        const baseClass = "w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg px-3 py-3 text-sm text-[#F5E6D3] focus:border-[#C69C6D] outline-none transition-all placeholder-[#5D4037] disabled:opacity-50 disabled:cursor-not-allowed";

        if (['hinh_anh', 'avatar', 'image'].includes(col.key)) return null;
        if (['dien_thoai', 'sdt', 'phone'].includes(col.key)) {
            return ( <div className="relative"> <input type="text" value={val} onChange={(e) => setFormData({...formData, [col.key]: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} disabled={isReadOnly} className={baseClass} placeholder="09..." /> <Phone size={14} className="absolute right-3 top-3 text-[#5D4037]"/> </div> );
        }
        if (['integer', 'bigint', 'numeric', 'number'].includes(col.kieuDuLieu)) {
            return ( <div className="relative"> <input type="number" value={val} onChange={(e) => setFormData({...formData, [col.key]: e.target.value})} disabled={isReadOnly} className={baseClass}/> <Hash size={14} className="absolute right-3 top-3 text-[#5D4037]"/> </div> );
        }
        if (col.key.includes('ngay') || col.kieuDuLieu.includes('date')) {
            const dateVal = val ? String(val).split('T')[0] : '';
            return <input type="date" value={dateVal} onChange={(e) => setFormData({...formData, [col.key]: e.target.value})} disabled={isReadOnly} className={`${baseClass} [color-scheme:dark]`}/>;
        }
        if (col.key.includes('mo_ta') || col.key.includes('ghi_chu')) {
            return <textarea rows={3} value={val} onChange={(e) => setFormData({...formData, [col.key]: e.target.value})} disabled={isReadOnly} className={baseClass}/>;
        }
        return <input type="text" value={val} onChange={(e) => setFormData({...formData, [col.key]: e.target.value})} disabled={isReadOnly} className={baseClass}/>;
    };

    const imgCol = config.danhSachCot.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key));

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[990] flex flex-col bg-[#050505]/95 backdrop-blur-xl animate-in slide-in-from-right-10 duration-300 border-l border-[#8B5E3C]/30 shadow-2xl">
            <style jsx>{` .custom-scroll::-webkit-scrollbar { width: 4px; } .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; } `}</style>

            <div className="h-[clamp(60px,15vw,70px)] px-6 border-b border-[#8B5E3C]/20 flex items-center justify-between bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent shrink-0">
                <h2 className="text-[clamp(16px,5vw,20px)] font-bold text-[#C69C6D] uppercase tracking-wide truncate">
                    {isEditMode ? 'Thông Tin Chi Tiết' : 'Thêm Mới Dữ Liệu'}
                </h2>
                <div className="flex gap-2">
                    {canEdit && isEditMode && <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-900/20 rounded-full transition-all"><Trash2 size={20}/></button>}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#8B5E3C] hover:text-[#C69C6D]"><X size={20}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                {imgCol && (
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group w-32 h-32">
                            {formData[imgCol.key] ? (
                                <img src={formData[imgCol.key]} className="w-32 h-32 rounded-full object-cover border-4 border-[#C69C6D] shadow-[0_0_20px_rgba(198,156,109,0.2)]" alt="Avatar"/>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-[#1a120f] flex items-center justify-center border-4 border-[#8B5E3C]/50 shadow-inner"><ImageIcon size={40} className="text-[#5D4037]"/></div>
                            )}
                            {canEdit && (
                                <label className="absolute bottom-0 right-0 p-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
                                    {uploadingImg ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imgCol.key)} disabled={uploadingImg}/>
                                </label>
                            )}
                        </div>
                    </div>
                )}

                {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-red-200 text-sm"><AlertCircle size={16}/> {error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {config.danhSachCot.map((col) => {
                        if (!isEditMode && col.tuDong) return null;
                        if (col.key === 'id' || ['hinh_anh', 'avatar', 'image'].includes(col.key)) return null;
                        return (
                            <div key={col.key} className={col.key.includes('mo_ta') ? 'md:col-span-2' : ''}>
                                <label className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider mb-1.5 ml-1 block">{col.label || col.key} {col.batBuoc && <span className="text-red-500">*</span>}</label>
                                {renderInput(col)}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="h-[60px] bg-[#110d0c] border-t border-[#8B5E3C]/30 flex items-center justify-between px-6 shrink-0 shadow-lg relative z-50">
                 <button onClick={onClose} className="p-2 rounded-full text-[#8B5E3C] hover:text-[#C69C6D] hover:bg-white/5 transition-all active:scale-90"><ArrowLeft size={24} strokeWidth={2} /></button>
                 
                 {canEdit ? (
                     <button onClick={handleSave} disabled={loading} className="px-8 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(198,156,109,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                         {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} LƯU LẠI
                     </button>
                 ) : (
                     <span className="text-xs text-[#5D4037] font-bold uppercase">Chỉ xem</span>
                 )}

                 <button className="p-2 rounded-full text-[#8B5E3C]/30 cursor-not-allowed"><ArrowRight size={24} strokeWidth={2} /></button>
            </div>
        </div>
    );
}