'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Save, Loader2, AlertTriangle, Plus, 
    Image as ImageIcon, UploadCloud, Trash2, Edit3, Check
} from 'lucide-react';
import { useUser } from '@/app/ThuVien/UserContext';
import { getTableSchemaAction, createNhanSuAction, updateNhanSuAction, getDistinctValuesAction } from '@/app/actions/admindb';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

// --- CONFIG ---
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
    email: "Email", ngan_hang: "Ngân hàng", so_tai_khoan: "Số tài khoản",
    luong_thang: "Lương tháng (VND)", luong_theo_gio: "Lương theo giờ (VND)",
    thuong_doanh_thu: "Thưởng doanh thu (%)", hinh_anh: "Ảnh đại diện"
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
    ho_ten: "Ví dụ: Nguyễn Văn A", vi_tri: "Chọn hoặc nhập mới...",
    email: "vidu@gmail.com", so_dien_thoai: "09xxxxxxxxx",
    luong_thang: "Nhập số tiền...", so_tai_khoan: "Số tài khoản...",
    thuong_doanh_thu: "0 - 30", ngan_hang: "",
    luong_theo_gio: "Tự động tính (Read-only)", hinh_anh: ""
};

// --- UTILS ---
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
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase();
};

// 🟢 FIX TREO: Hàm nén ảnh SIÊU ĐƠN GIẢN (Chỉ resize 1 lần, không loop)
const simpleCompress = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
        // Nếu ảnh < 200KB thì khỏi nén, trả về luôn cho nhanh
        if (file.size < 200 * 1024) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Resize xuống max 800px chiều rộng
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Nén cứng ở mức 0.7 (JPEG)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        } else {
                            resolve(file); // Lỗi tạo blob -> Dùng file gốc
                        }
                    }, 'image/jpeg', 0.7);
                } else {
                    resolve(file); // Lỗi context -> Dùng file gốc
                }
            };
            img.onerror = () => resolve(file); // Lỗi ảnh -> Dùng file gốc
        };
        reader.onerror = () => resolve(file); // Lỗi đọc -> Dùng file gốc
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
        try {
            const posRes = await getDistinctValuesAction('nhan_su', 'vi_tri');
            if (posRes.success) setExistingPositions((posRes.data || []) as string[]);

            if (initialData) {
                // Clone và convert số thành string để hiển thị trong input
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

        // 🟢 HIỂN THỊ LƯƠNG THEO GIỜ LÀM TRÒN (Chỉ hiển thị, không lưu vào DB)
        if (key === 'luong_thang') {
            const luongRaw = Number(parseCurrency(finalValue));
            if (!isNaN(luongRaw) && luongRaw > 0) {
                // Công thức: (Lương / 24 / 8) -> Làm tròn nghìn
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
        
        if (!formData.so_dien_thoai || formData.so_dien_thoai.length < 10) return "Số điện thoại phải từ 10 số trở lên.";
        if (!formData.luong_thang) return "Lương tháng không được để trống.";
        if (formData.ngan_hang && !formData.so_tai_khoan) return "Nếu chọn Ngân hàng, phải nhập Số tài khoản.";

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
            // Chuẩn hóa vị trí
            if (finalData.vi_tri) {
                finalData.vi_tri_normalized = finalData.vi_tri
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "").toLowerCase();
            }
            // Parse số trước khi gửi
            if (finalData.luong_thang) finalData.luong_thang = Number(parseCurrency(finalData.luong_thang));
            if (finalData.thuong_doanh_thu) finalData.thuong_doanh_thu = Number(finalData.thuong_doanh_thu);
            
            // 🟢 LƯU Ý: Không gửi luong_theo_gio vì DB tự tính (Generated Column)

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

    // 🟢 UPLOAD ẢNH (Fix lỗi treo)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formData.ho_ten) {
            alert("Nhập tên trước để đặt tên file ảnh!");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            // 1. Nén nhanh
            const finalFile = await simpleCompress(file);
            
            // 2. Tạo tên file
            const fileExt = 'jpg';
            const fileName = `${normalizeFileName(formData.ho_ten)}.${fileExt}`;

            // 3. Upload (Upsert = ghi đè)
            const { error: upErr } = await supabase.storage
                .from('images')
                .upload(fileName, finalFile, { upsert: true, cacheControl: '0' });

            if (upErr) throw upErr;

            // 4. Lấy URL + timestamp để refresh ảnh
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            handleChange('hinh_anh', `${data.publicUrl}?t=${Date.now()}`);

        } catch (err: any) {
            console.error(err);
            setError("Lỗi upload ảnh (Quyền hoặc Mạng)");
        } finally {
            setUploading(false); // Luôn tắt loading
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Render Field Helper
    const renderField = (key: string) => {
        const label = COLUMN_LABELS[key];
        const value = formData[key] || '';
        const placeholder = FIELD_PLACEHOLDERS[key] || "";
        
        // Style chung
        const wrapClass = "flex flex-col items-center w-full space-y-1";
        const lblClass = "text-[10px] font-bold text-[#C69C6D] uppercase tracking-wider text-center w-full";
        const inpClass = "w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#C69C6D] outline-none text-center font-medium italic placeholder:text-white/20";

        if (key === 'hinh_anh') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <div className="flex flex-col items-center w-full">
                        <div 
                            className="relative w-28 h-28 rounded-full border-4 border-[#C69C6D]/20 bg-black shadow-xl overflow-hidden group cursor-pointer"
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            title="Nhấn để tải ảnh"
                        >
                            {value ? (
                                <img src={value} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={32} /></div>
                            )}
                            
                            <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {uploading ? (
                                    <Loader2 size={24} className="text-[#C69C6D] animate-spin" />
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="text-[#C69C6D] mb-1" />
                                        <span className="text-[9px] text-white font-bold uppercase">Đổi ảnh</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
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
                                className={`${inpClass} appearance-none`}
                            >
                                <option value="">-- Chọn vị trí --</option>
                                {existingPositions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button onClick={() => setIsAddingPosition(true)} className="px-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-[#C69C6D]"><Plus size={18}/></button>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full animate-in fade-in">
                            <input autoFocus placeholder="Nhập mới..." value={newPositionTemp} onChange={(e) => setNewPositionTemp(e.target.value)} className={inpClass} />
                            <button onClick={() => { if(newPositionTemp){ setExistingPositions([...existingPositions, newPositionTemp]); handleChange(key, newPositionTemp); setIsAddingPosition(false); } }} className="px-3 bg-[#C69C6D] text-black rounded-lg"><Check size={18}/></button>
                            <button onClick={() => setIsAddingPosition(false)} className="px-3 bg-white/10 text-white rounded-lg"><X size={18}/></button>
                        </div>
                    )}
                </div>
            );
        }

        if (key === 'ngan_hang') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <select value={value} onChange={(e) => handleChange(key, e.target.value)} className={`${inpClass} appearance-none`}>
                        <option value="">-- Chọn ngân hàng --</option>
                        {VN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            );
        }

        if (key === 'luong_thang') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <input 
                        type="text"
                        value={formatCurrency(value)} 
                        onChange={(e) => handleChange(key, e.target.value)} 
                        className={inpClass} 
                        placeholder={placeholder} 
                    />
                </div>
            );
        }

        // 🟢 CẬP NHẬT: HIỂN THỊ CHỈ ĐỌC (READ-ONLY) CHO LƯƠNG THEO GIỜ
        if (key === 'luong_theo_gio') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <input 
                        type="text"
                        value={formatCurrency(value)} 
                        readOnly 
                        disabled 
                        className={`${inpClass} !bg-[#2a2a2a] !border-white/5 !text-gray-400 cursor-not-allowed`}
                        placeholder={placeholder} 
                    />
                    <p className="text-[9px] text-white/20 italic">= Lương tháng / 24 / 8 (Làm tròn nghìn)</p>
                </div>
            );
        }

        if (key === 'thuong_doanh_thu') {
            return (
                <div key={key} className={wrapClass}>
                    <label className={lblClass}>{label}</label>
                    <div className="relative w-full">
                        <input type="text" value={value} onChange={(e) => handleChange(key, e.target.value)} className={inpClass} placeholder={placeholder} />
                        <span className="absolute right-4 top-3 text-white/30 italic">%</span>
                    </div>
                </div>
            );
        }

        return (
            <div key={key} className={wrapClass}>
                <label className={lblClass}>{label}</label>
                <input type="text" value={value} onChange={(e) => handleChange(key, e.target.value)} className={inpClass} placeholder={placeholder} />
            </div>
        );
    };

    if (!isOpen || !canAccess) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end items-start animate-in fade-in duration-200" style={{ zIndex }}>
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative w-full md:w-[500px] h-full bg-[#0a0a0a] border-l border-[#C69C6D]/20 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header dời xuống pt-24 */}
                <div className="px-6 pt-24 pb-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
                    <h2 className="text-lg font-bold text-[#C69C6D] uppercase tracking-widest flex items-center gap-2">
                        {initialData ? <Edit3 size={18}/> : <Plus size={18}/>}
                        {initialData ? 'Cập Nhật Hồ Sơ' : 'Thêm Nhân Sự'}
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loadingSchema ? (
                        <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-[#C69C6D]" /></div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {error && <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}
                            {FIELD_ORDER.map(field => renderField(field))}
                        </div>
                    )}
                </div>

                {/* Footer dời lên pb-24 */}
                <div className="px-6 pt-4 pb-24 border-t border-white/10 bg-[#111] flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 font-bold uppercase text-xs hover:bg-white/5">Hủy</button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || uploading}
                        className="flex-[2] py-3 rounded-xl bg-[#C69C6D] hover:bg-[#b08b5e] text-black font-bold uppercase text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Lưu Hồ Sơ
                    </button>
                </div>
            </div>
        </div>
    );
}