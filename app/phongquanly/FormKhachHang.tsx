'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Save, Loader2, AlertTriangle, Plus, 
    Image as ImageIcon, UploadCloud, Check
} from 'lucide-react';
import { useUser } from '@/app/ThuVien/UserContext';
import { createKhachHangAction, updateKhachHangAction, getDistinctValuesAction } from '@/app/actions/QuyenHanQuanLy';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

// Helper: Chuyển tiếng Việt có dấu thành không dấu (để tạo normalized field)
const toNonAccentVietnamese = (str: string) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return str.replace(/\s+/g, ''); // Xóa khoảng trắng để làm ID (vd: "Đã mua" -> "damua")
};

const FIELD_ORDER = ['ho_ten', 'phan_loai', 'so_dien_thoai', 'email', 'dia_chi', 'hinh_anh'];

const COLUMN_LABELS: Record<string, string> = {
    ho_ten: "Họ và Tên", phan_loai: "Phân loại", so_dien_thoai: "Số điện thoại",
    email: "Email", dia_chi: "Địa chỉ", hinh_anh: "Avatar"
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
    ho_ten: "Nguyễn Văn A...", phan_loai: "Chọn phân loại...",
    email: "khach@example.com", so_dien_thoai: "09xxxxxxxxx",
    dia_chi: "Số nhà, đường...", hinh_anh: ""
};

const toTitleCase = (str: string) => str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
const normalizeFileName = (str: string) => str.toLowerCase().replace(/đ/g, 'd').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_");

interface Props {
    isOpen: boolean; onClose: () => void; onSuccess: () => void;
    initialData?: any; zIndex?: number;
}

export default function FormKhachHang({ isOpen, onClose, onSuccess, initialData, zIndex = 200 }: Props) {
    const { user } = useUser();
    const [formData, setFormData] = useState<any>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [isAddingCat, setIsAddingCat] = useState(false);
    const [newCat, setNewCat] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) loadData();
    }, [isOpen, initialData]);

    const loadData = async () => {
        setLoading(true); setError(null);
        try {
            // Lấy danh sách phân loại có sẵn để gợi ý
            const res = await getDistinctValuesAction('khach_hang', 'phan_loai');
            if (res.success) setCategories((res.data || []) as string[]);
            
            // Nếu có initialData (Sửa) thì fill vào, không thì mặc định (Thêm mới)
            setFormData(initialData ? { ...initialData } : { phan_loai: 'Mới' });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleChange = (k: string, v: any) => {
        if (k === 'ho_ten') v = toTitleCase(v);
        if (k === 'so_dien_thoai') v = v.replace(/[^0-9]/g, '');
        setFormData((p: any) => ({ ...p, [k]: v }));
    };

    const handleSave = async () => {
        if (!formData.ho_ten?.trim()) return setError("Thiếu tên khách hàng");
        if (!formData.phan_loai) return setError("Thiếu phân loại");
        
        setIsSaving(true); setError(null);
        try {
            // 🟢 Tự động tạo normalized field cho phân loại
            const normalizedCat = toNonAccentVietnamese(formData.phan_loai);
            const payload = { ...formData, phan_loai_normalized: normalizedCat };

            const action = initialData?.id ? updateKhachHangAction(initialData.id, payload) : createKhachHangAction(payload);
            const res = await action;
            
            if (res.success) { 
                onSuccess(); 
                onClose(); 
            } else {
                throw new Error(res.error);
            }
        } catch (e: any) { setError(e.message); } finally { setIsSaving(false); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!formData.ho_ten) {
            setError("Vui lòng nhập tên khách hàng trước khi tải ảnh");
            if (fileRef.current) fileRef.current.value = '';
            return;
        }
        
        setUploading(true);
        setError(null);
        
        try {
            const compressed = await compressImage(file, 0.5, 400);
            const name = `kh_${normalizeFileName(formData.ho_ten)}_${Date.now()}.jpg`;
            
            const { data: uploadData, error: upErr } = await supabase.storage
                .from('avatar')
                .upload(name, compressed, { 
                    upsert: true,
                    contentType: 'image/jpeg',
                    cacheControl: '3600'
                });
            
            if (upErr) throw new Error(upErr.message);
            
            const { data } = supabase.storage.from('avatar').getPublicUrl(name);
            handleChange('hinh_anh', data.publicUrl);
        } catch (e: any) { 
            console.error('[UPLOAD KH] Exception:', e);
            setError("Lỗi upload: " + e.message); 
        } finally { 
            setUploading(false); 
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center animate-in fade-in" style={{ zIndex }}>
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md mx-4 h-[85vh] bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                
                <div className="pt-6 pb-2 text-center shrink-0">
                    <h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-[0.2em]">{initialData ? 'CẬP NHẬT' : 'THÊM MỚI'}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
                    
                    {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div> : (
                        <div className="flex flex-col gap-5 pb-10">
                            {error && (
                                <div className="p-3 bg-red-900/20 text-red-400 text-xs font-bold rounded border border-red-500/50 flex items-center gap-2">
                                    <AlertTriangle size={14}/> {error}
                                </div>
                            )}
                            
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-2 cursor-pointer group" onClick={() => !uploading && fileRef.current?.click()}>
                                <div className="w-28 h-28 rounded-full border-4 border-[#C69C6D] overflow-hidden bg-black relative shadow-[0_0_20px_rgba(198,156,109,0.2)] group-hover:shadow-[0_0_30px_rgba(198,156,109,0.4)] transition-all">
                                    {formData.hinh_anh ? <img src={formData.hinh_anh} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/30"><ImageIcon size={40}/></div>}
                                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div>}
                                </div>
                                <span className="text-[10px] text-[#C69C6D] font-bold mt-2 uppercase flex items-center gap-1 group-hover:underline">
                                    <UploadCloud size={12}/> {formData.hinh_anh ? 'Đổi Ảnh' : 'Tải Ảnh'}
                                </span>
                                <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*"/>
                            </div>

                            {/* Fields Loop */}
                            {FIELD_ORDER.filter(k => k !== 'hinh_anh').map(k => (
                                <div key={k} className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-[#C69C6D] uppercase tracking-[0.15em] ml-1">{COLUMN_LABELS[k]}</label>
                                    
                                    {k === 'phan_loai' ? (
                                        // Logic chọn phân loại hoặc thêm mới
                                        !isAddingCat ? (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <select 
                                                        value={formData[k]||''} 
                                                        onChange={e => handleChange(k, e.target.value)} 
                                                        className="w-full bg-black border border-[#C69C6D]/40 rounded-lg px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#C69C6D] appearance-none"
                                                    >
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                    {/* Custom arrow for select */}
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C69C6D]/50 pointer-events-none">▼</div>
                                                </div>
                                                <button onClick={() => setIsAddingCat(true)} className="px-3 bg-[#C69C6D]/10 hover:bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D]/50 rounded-lg transition-colors"><Plus size={18}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 animate-in slide-in-from-right-2 fade-in">
                                                <input 
                                                    autoFocus 
                                                    value={newCat} 
                                                    onChange={e => setNewCat(e.target.value)} 
                                                    placeholder="Nhập loại mới..." 
                                                    className="w-full bg-black border border-[#C69C6D] rounded-lg px-4 py-3 text-sm text-white font-bold outline-none shadow-[0_0_10px_rgba(198,156,109,0.2)]"
                                                />
                                                <button onClick={() => { if(newCat){setCategories([...categories, newCat]); handleChange('phan_loai', newCat); setIsAddingCat(false); setNewCat('');} }} className="px-3 bg-[#C69C6D] text-black rounded-lg hover:bg-white"><Check size={18}/></button>
                                                <button onClick={() => setIsAddingCat(false)} className="px-3 bg-red-900/50 text-red-400 border border-red-500 rounded-lg hover:bg-red-900"><X size={18}/></button>
                                            </div>
                                        )
                                    ) : (
                                        // Input thường
                                        <input 
                                            type={k === 'email' ? 'email' : 'text'} 
                                            value={formData[k]||''} 
                                            onChange={e => handleChange(k, e.target.value)} 
                                            placeholder={FIELD_PLACEHOLDERS[k]} 
                                            className="w-full bg-black border border-[#C69C6D]/40 rounded-lg px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#C69C6D] placeholder:text-white/20 transition-colors"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer Buttons */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors">HỦY</button>
                    <button onClick={handleSave} disabled={isSaving || uploading} className="flex-[2] py-3 rounded-lg bg-[#C69C6D] text-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-colors">
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} LƯU
                    </button>
                </div>
            </div>
        </div>
    );
}