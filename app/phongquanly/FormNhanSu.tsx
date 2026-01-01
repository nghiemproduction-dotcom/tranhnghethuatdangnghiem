'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Save, Loader2, AlertTriangle, Plus, 
    Image as ImageIcon, UploadCloud, Check
} from 'lucide-react';
import { useUser } from '@/app/ThuVien/UserContext';
import { createNhanSuAction, updateNhanSuAction, getDistinctValuesAction } from '@/app/actions/admindb';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

// --- CẤU HÌNH ---
const VN_BANKS = [
    "Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank", "MBBank", 
    "ACB", "VPBank", "TPBank", "Sacombank", "HDBank", "VIB", "MSB", "SHB", 
    "SeABank", "OCB", "Eximbank", "LienVietPostBank", "Nam A Bank", "Viet Capital Bank"
];

const FIELD_ORDER = [
    'ho_ten', 'vi_tri', 'email', 'so_dien_thoai', 
    'luong_thang', 'luong_theo_gio', 'thuong_doanh_thu', 
    'ngan_hang', 'so_tai_khoan', 'hinh_anh'
];

const COLUMN_LABELS: Record<string, string> = {
    ho_ten: "Họ và Tên", vi_tri: "Vị trí / Chức vụ", so_dien_thoai: "Số điện thoại",
    email: "Email liên hệ", ngan_hang: "Ngân hàng thụ hưởng", so_tai_khoan: "Số tài khoản",
    luong_thang: "Lương cứng (VNĐ)", luong_theo_gio: "Lương theo giờ (Quy đổi)",
    thuong_doanh_thu: "Thưởng doanh số (%)", hinh_anh: "Ảnh đại diện (Avatar)"
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
    ho_ten: "Nhập họ tên đầy đủ...", vi_tri: "Chọn chức vụ...",
    email: "email@example.com", so_dien_thoai: "09xxxxxxxxx",
    luong_thang: "0", so_tai_khoan: "Nhập số tài khoản...",
    thuong_doanh_thu: "0 - 30", ngan_hang: "",
    luong_theo_gio: "Hệ thống tự tính", hinh_anh: ""
};

// --- TIỆN ÍCH ---
const formatCurrency = (value: string | number) => {
    if (!value && value !== 0) return '';
    return Number(value).toLocaleString('vi-VN');
};

const parseCurrency = (value: string) => {
    if (!value) return '';
    return value.toString().replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, '');
};

const toTitleCase = (str: string) => str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());

const normalizeFileName = (str: string) => {
    return str
        .toLowerCase()
        .replace(/đ/g, 'd')  // Thay thế đ tiếng Việt
        .replace(/Đ/g, 'd')  // Thay thế Đ tiếng Việt
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")  // Xóa dấu
        .replace(/[^a-z0-9]/g, "_")  // Chỉ giữ chữ cái, số và _
        .replace(/_+/g, "_");  // Gộp nhiều _ thành 1
};

// 🟢 HÀM NÉN ẢNH (SIMPLE + AGGRESSIVE)
const simpleCompress = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
        console.log(`[COMPRESS] 📁 Bắt đầu nén: ${(file.size / 1024).toFixed(2)} KB`);
        
        const reader = new FileReader();
        
        reader.onerror = () => {
            console.error('[COMPRESS] ❌ FileReader error');
            resolve(file);
        };
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onerror = () => {
                console.error('[COMPRESS] ❌ Image load failed');
                resolve(file);
            };
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    let w = img.width;
                    let h = img.height;

                    if (w > MAX_WIDTH) {
                        h = (h * MAX_WIDTH) / w;
                        w = MAX_WIDTH;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        console.error('[COMPRESS] ❌ Canvas context failed');
                        resolve(file);
                        return;
                    }
                    
                    ctx.drawImage(img, 0, 0, w, h);

                    // Nén với quality 50% (aggressive)
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                console.log('[COMPRESS] ⚠️  Blob is null, use original');
                                resolve(file);
                                return;
                            }
                            
                            const compressedSize = blob.size / 1024;
                            console.log(`[COMPRESS] ✅ Hoàn thành: ${(file.size / 1024).toFixed(2)} KB → ${compressedSize.toFixed(2)} KB`);
                            
                            const newFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                            resolve(newFile);
                        },
                        'image/jpeg',
                        0.5  // Quality 50% - aggressive
                    );
                } catch (e) {
                    console.error('[COMPRESS] ❌ Canvas error:', e);
                    resolve(file);
                }
            };
            
            img.src = e.target?.result as string;
        };
        
        reader.readAsDataURL(file);
    });
};

interface FormNhanSuProps {
    isOpen: boolean; onClose: () => void; onSuccess: () => void;
    initialData?: any; zIndex?: number;
}

export default function FormNhanSu({ isOpen, onClose, onSuccess, initialData, zIndex = 200 }: FormNhanSuProps) {
    const { user } = useUser();
    const [formData, setFormData] = useState<any>({});
    const [existingPositions, setExistingPositions] = useState<string[]>([]);
    const [isAddingPosition, setIsAddingPosition] = useState(false);
    const [newPositionTemp, setNewPositionTemp] = useState('');
    
    const [loadingSchema, setLoadingSchema] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canAccess = user && (user.role === 'admin' || user.role === 'quanly' || user.vi_tri_normalized === 'admin' || user.vi_tri_normalized === 'quanly');

    useEffect(() => {
        if (isOpen && canAccess) loadInitialData();
    }, [isOpen, initialData]);

    const loadInitialData = async () => {
        setLoadingSchema(true);
        setUploading(false); // Reset upload state khi mở form
        setError(null); // Reset error
        try {
            const posRes = await getDistinctValuesAction('nhan_su', 'vi_tri');
            if (posRes.success) setExistingPositions((posRes.data || []) as string[]);

            if (initialData) {
                const safeData = { ...initialData };
                if (safeData.luong_thang) safeData.luong_thang = safeData.luong_thang.toString();
                if (safeData.luong_theo_gio) safeData.luong_theo_gio = safeData.luong_theo_gio.toString();
                if (safeData.thuong_doanh_thu) safeData.thuong_doanh_thu = safeData.thuong_doanh_thu.toString();
                setFormData(safeData);
            } else {
                setFormData({});
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSchema(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        let finalValue = value;
        let newFormData = { ...formData };

        if (key === 'ho_ten') finalValue = toTitleCase(value);
        else if (['so_dien_thoai', 'luong_thang', 'thuong_doanh_thu'].includes(key)) {
            finalValue = value.replace(/[^0-9]/g, '');
            if (key === 'thuong_doanh_thu' && Number(finalValue) > 30) finalValue = '30';
        }

        newFormData[key] = finalValue;

        if (key === 'luong_thang') {
            const luongRaw = Number(parseCurrency(finalValue));
            if (!isNaN(luongRaw) && luongRaw > 0) {
                const rawHourly = (luongRaw / 24) / 8;
                const luongGioTronNghin = Math.round(rawHourly / 1000) * 1000;
                newFormData['luong_theo_gio'] = luongGioTronNghin.toString();
            } else {
                newFormData['luong_theo_gio'] = '0';
            }
        }
        setFormData(newFormData);
    };

    const handleAddPosition = () => {
        if (newPositionTemp.trim()) {
            setExistingPositions([...existingPositions, newPositionTemp.trim()]);
            handleChange('vi_tri', newPositionTemp.trim());
            setIsAddingPosition(false);
            setNewPositionTemp('');
        }
    };

    const validateForm = () => {
        if (!formData.ho_ten?.trim()) return "Họ tên không được để trống.";
        if (!formData.vi_tri) return "Vui lòng chọn hoặc nhập Vị trí.";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) return "Email không hợp lệ hoặc để trống.";
        
        if (formData.ngan_hang && !formData.so_tai_khoan) return "Chọn Ngân hàng thì phải nhập Số tài khoản.";

        return null; 
    };

    const handleSave = async () => {
        const valError = validateForm();
        if (valError) {
            setError(valError);
            return;
        }

        setIsSaving(true); setError(null);
        try {
            let finalData = { ...formData };
            if (finalData.vi_tri) {
                finalData.vi_tri_normalized = finalData.vi_tri
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "").toLowerCase();
            }
            if (finalData.luong_thang) finalData.luong_thang = Number(parseCurrency(finalData.luong_thang));
            if (finalData.thuong_doanh_thu) finalData.thuong_doanh_thu = Number(finalData.thuong_doanh_thu);
            
            let res;
            if (initialData?.id) res = await updateNhanSuAction(initialData.id, finalData);
            else res = await createNhanSuAction(finalData);

            if (res.success) {
                onSuccess(); onClose();
            } else throw new Error(res.error);
        } catch (err: any) {
            setError("Lỗi lưu: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 🟢 UPLOAD ẢNH (FIXED VERSION - Detailed debugging)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[UPLOAD] ⭐ FILE INPUT TRIGGERED - Bắt đầu xử lý file');
        setError(null);
        const file = e.target.files?.[0];
        if (!file) {
            console.log('[UPLOAD] ❌ Không có file được chọn');
            return;
        }

        console.log(`[UPLOAD START] 📁 File gốc: ${file.name} (${(file.size / 1024).toFixed(2)} KB), Type: ${file.type}`);

        if (!formData.ho_ten) {
            console.warn('[UPLOAD] Chưa nhập họ tên');
            setError("Nhập họ tên trước khi tải ảnh!");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            // 1. Nén ảnh
            console.log('[UPLOAD STEP 1] Bắt đầu nén ảnh...');
            const finalFile = await simpleCompress(file);
            console.log(`[UPLOAD STEP 1] ✅ File đã nén: ${(finalFile.size / 1024).toFixed(2)} KB, Type: ${finalFile.type}`);
            
            // 2. Chuẩn bị tên file
            const fileExt = 'jpg';
            const sanitizedName = normalizeFileName(formData.ho_ten);
            const fileName = `${sanitizedName}_${Date.now()}.${fileExt}`;
            console.log(`[UPLOAD STEP 2] Tên file chuẩn bị: ${fileName}`);

            // 3. Kiểm tra Supabase client
            console.log(`[UPLOAD STEP 3] Kiểm tra Supabase client...`);
            if (!supabase) throw new Error('Supabase client không được khởi tạo');
            if (!supabase.storage) throw new Error('Storage API không khả dụng');
            console.log(`[UPLOAD STEP 3] ✅ Supabase client sẵn sàng`);

            // 4. Upload vào bucket 'avatar'
            console.log(`[UPLOAD STEP 4] Bắt đầu upload đến bucket 'avatar'...`);
            const { data: uploadData, error: upErr } = await supabase.storage
                .from('avatar')
                .upload(fileName, finalFile, { 
                    upsert: true, 
                    cacheControl: '3600',
                    contentType: 'image/jpeg'
                });

            if (upErr) {
                console.error(`[UPLOAD STEP 4] ❌ Lỗi upload:`, upErr);
                throw new Error(`Upload thất bại: ${upErr.message}`);
            }

            console.log(`[UPLOAD STEP 4] ✅ Upload thành công:`, uploadData);

            // 5. Lấy URL công khai
            console.log(`[UPLOAD STEP 5] Lấy URL công khai...`);
            const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(fileName);
            const publicUrl = urlData?.publicUrl;
            
            if (!publicUrl) {
                throw new Error('Không thể lấy URL công khai');
            }

            console.log(`[UPLOAD STEP 5] ✅ URL: ${publicUrl}`);
            
            // 6. Cập nhật form data
            console.log(`[UPLOAD STEP 6] Cập nhật form...`);
            handleChange('hinh_anh', publicUrl);
            console.log(`[UPLOAD] ✅ THÀNH CÔNG! Ảnh đã được tải lên.`);
            setError(null);

        } catch (err: any) {
            const errorMsg = err?.message || err?.error_description || String(err);
            console.error(`[UPLOAD] ❌ EXCEPTION:`, errorMsg);
            console.error('[UPLOAD] Full error object:', err);
            setError(`Lỗi: ${errorMsg}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderField = (key: string) => {
        const label = COLUMN_LABELS[key];
        const value = formData[key] || '';
        const placeholder = FIELD_PLACEHOLDERS[key] || "";
        
        // --- STYLE GAMING ---
        const wrapClass = "flex flex-col items-start w-full space-y-2 group";
        const lblClass = "text-[10px] font-black text-[#C69C6D] uppercase tracking-[0.15em] glow-text ml-1 group-hover:text-white transition-colors";
        const inpClass = "w-full bg-black border border-[#C69C6D]/40 rounded-lg px-4 py-3 text-sm text-white focus:border-[#C69C6D] focus:shadow-[0_0_15px_rgba(198,156,109,0.3)] outline-none font-bold placeholder:text-white/20 transition-all clip-game-btn";

        if (key === 'hinh_anh') {
            return (
                <div key={key} className="flex flex-col items-center w-full space-y-3 mb-4">
                    <div className="relative w-32 h-32 rounded-full border-4 border-[#C69C6D] shadow-[0_0_30px_rgba(198,156,109,0.4)] overflow-hidden group cursor-pointer bg-black"
                         onClick={() => !uploading && fileInputRef.current?.click()}>
                        {value ? (
                            <img src={value} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#C69C6D]/30"><ImageIcon size={48} /></div>
                        )}
                        <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {uploading ? <Loader2 size={24} className="animate-spin text-[#C69C6D]" /> : <UploadCloud size={24} className="text-[#C69C6D]" />}
                        </div>
                    </div>
                    {/* 🟢 ĐÃ SỬA LỖI Ở ĐÂY: Thay '<' bằng 'Tối đa' */}
                    <span className="text-[10px] text-[#C69C6D] font-bold uppercase tracking-wider">Ảnh đại diện (Tối đa 40KB)</span>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
            );
        }

        if (key === 'vi_tri') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    {!isAddingPosition ? (
                        <div className="flex gap-2 w-full">
                            <select 
                                value={value} 
                                onChange={(e) => handleChange(key, e.target.value)} 
                                className={`${inpClass} appearance-none cursor-pointer`}
                                style={{ backgroundColor: 'black', color: 'white' }}
                            >
                                <option value="" className="bg-black text-gray-500">-- Chọn vị trí --</option>
                                {existingPositions.map(p => <option key={p} value={p} className="bg-black text-white py-2">{p}</option>)}
                            </select>
                            <button onClick={() => setIsAddingPosition(true)} className="px-3 bg-[#C69C6D]/20 hover:bg-[#C69C6D] hover:text-black border border-[#C69C6D] rounded-lg text-[#C69C6D] transition-colors"><Plus size={18}/></button>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full animate-in fade-in">
                            <input autoFocus placeholder="Nhập tên vị trí mới..." value={newPositionTemp} onChange={(e) => setNewPositionTemp(e.target.value)} className={inpClass} />
                            <button onClick={handleAddPosition} className="px-3 bg-[#C69C6D] text-black rounded-lg hover:brightness-110"><Check size={18}/></button>
                            <button onClick={() => setIsAddingPosition(false)} className="px-3 bg-red-900/50 text-red-400 border border-red-500 rounded-lg hover:bg-red-600 hover:text-white"><X size={18}/></button>
                        </div>
                    )}
                </div>
            );
        }

        if (key === 'ngan_hang') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <select 
                        value={value} 
                        onChange={(e) => handleChange(key, e.target.value)} 
                        className={`${inpClass} appearance-none cursor-pointer`}
                        style={{ backgroundColor: 'black', color: 'white' }}
                    >
                        <option value="" className="bg-black text-gray-500">-- Chọn ngân hàng --</option>
                        {VN_BANKS.map(b => <option key={b} value={b} className="bg-black text-white">{b}</option>)}
                    </select>
                </div>
            );
        }

        if (key === 'luong_theo_gio') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <input type="text" value={formatCurrency(value)} readOnly disabled className={`${inpClass} !bg-[#1a1a1a] !text-gray-500 cursor-not-allowed`} />
                </div>
            );
        }

        return (
            <div key={key} className={wrapClass}>
                <label className={lblClass}>{label}</label>
                <input 
                    type="text" 
                    value={key === 'luong_thang' ? formatCurrency(value) : value} 
                    onChange={(e) => handleChange(key, e.target.value)} 
                    className={inpClass} 
                    placeholder={placeholder} 
                />
            </div>
        );
    };

    if (!isOpen || !canAccess) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center animate-in fade-in duration-200" style={{ zIndex }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md mx-4 h-[85vh] bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-[0_0_50px_rgba(198,156,109,0.15)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* HEADER */}
                <div className="pt-6 pb-2 px-6 text-center shrink-0">
                    <h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-[0.2em] glow-text">
                        {initialData ? 'CHỈNH SỬA THÔNG TIN' : 'THÊM NHÂN SỰ MỚI'}
                    </h2>
                </div>

                {/* FORM BODY */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                    {loadingSchema ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32}/>
                            <p className="text-white/30 text-[10px] uppercase tracking-widest animate-pulse">LOADING...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 pb-10">
                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-bold rounded flex items-center gap-2 animate-pulse">
                                    <AlertTriangle size={16}/> {error}
                                </div>
                            )}
                            {FIELD_ORDER.map(field => renderField(field))}
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 font-bold uppercase text-xs hover:bg-white/10 hover:text-white transition-all clip-game-btn">
                        HỦY BỎ
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || uploading}
                        className="flex-[2] py-3 rounded-lg bg-[#C69C6D] hover:bg-white hover:text-black text-black font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 clip-game-btn"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} 
                        LƯU DỮ LIỆU
                    </button>
                </div>
            </div>
        </div>
    );
}