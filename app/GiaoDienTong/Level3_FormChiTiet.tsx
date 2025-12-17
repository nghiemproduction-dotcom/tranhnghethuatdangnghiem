'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle,  Hash,   Loader2, Upload, ImageIcon, Phone } from 'lucide-react';
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

    const canEdit = ['admin', 'quan_ly', 'admin_cung'].includes(userRole);
    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // --- LOGIC NÉN ẢNH (< 50KB) ---
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Resize về max 800px để giảm dung lượng
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Nén chất lượng xuống từ từ cho đến khi < 50KB
                let quality = 0.7;
                const tryCompress = (q: number) => {
                    canvas.toBlob((blob) => {
                        if(!blob) return reject("Lỗi nén ảnh");
                        if(blob.size < 50 * 1024 || q < 0.1) { // < 50KB
                            resolve(blob);
                        } else {
                            tryCompress(q - 0.1); // Giảm tiếp chất lượng
                        }
                    }, 'image/jpeg', q);
                }
                tryCompress(quality);
            };
            img.onerror = reject;
        });
    };

    // --- UPLOAD ẢNH ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImg(true);
            // 1. Nén ảnh
            const compressedBlob = await compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

            // 2. Upload lên Supabase Storage bucket 'images'
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const {   error } = await supabase.storage.from('images').upload(fileName, compressedFile);
            
            if (error) throw error;

            // 3. Lấy URL public
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
            
            // 4. Cập nhật Form
            setFormData((prev: any) => ({ ...prev, [colKey]: publicUrl }));

        } catch (err: any) {
            console.error(err);
            alert("Lỗi upload ảnh: " + err.message);
        } finally {
            setUploadingImg(false);
        }
    };

    // --- VALIDATE DỮ LIỆU ---
    const validateForm = () => {
        for (const col of config.danhSachCot) {
            const val = formData[col.key];

            // 1. Check Bắt buộc
            if (col.batBuoc && !val && val !== 0) {
                throw new Error(`Trường "${col.label || col.key}" là bắt buộc.`);
            }

            // 2. Check Số điện thoại (10 số)
            if (['dien_thoai', 'sdt', 'phone', 'mobile'].includes(col.key)) {
                if (val && !/^\d{10}$/.test(String(val))) {
                    throw new Error(`Số điện thoại phải bao gồm đúng 10 chữ số.`);
                }
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            // Validate trước khi lưu
            validateForm();

            const payload: any = {};
            config.danhSachCot.forEach(col => {
                // Bỏ qua các cột tự động khi thêm mới
                if (!isEditMode && col.tuDong) return;
                // Bỏ qua nếu không có dữ liệu (trừ khi update thì null vẫn gửi)
                if (formData[col.key] !== undefined) {
                    payload[col.key] = formData[col.key];
                }
            });

            if (isEditMode) {
                const { error } = await supabase.from(config.bangDuLieu).update(payload).eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(config.bangDuLieu).insert(payload);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Lỗi lưu dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa dữ liệu này?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from(config.bangDuLieu).delete().eq('id', initialData.id);
            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err: any) {
            alert("Lỗi xóa: " + err.message);
            setLoading(false);
        }
    };

    // --- RENDER INPUT ---
    const renderInput = (col: any) => {
        const val = formData[col.key] || '';
        const isReadOnly = !canEdit || (col.tuDong && isEditMode); // Cột tự động không cho sửa
        const baseClass = "w-full bg-[#111] border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#1a1a1a]";

        // 1. CỘT HÌNH ẢNH (Xử lý riêng ở trên cùng rồi, ở đây return null hoặc input hidden)
        if (['hinh_anh', 'avatar', 'image'].includes(col.key)) return null;

        // 2. CỘT SỐ ĐIỆN THOẠI
        if (['dien_thoai', 'sdt', 'phone'].includes(col.key)) {
            return (
                <div className="relative">
                    <input 
                        type="text" 
                        value={val} 
                        onChange={(e) => setFormData({...formData, [col.key]: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} // Chỉ cho nhập số, max 10
                        disabled={isReadOnly}
                        className={baseClass}
                        placeholder="09..."
                    />
                    <Phone size={14} className="absolute right-3 top-3 text-gray-500"/>
                </div>
            );
        }

        if (['integer', 'bigint', 'numeric', 'number'].includes(col.kieuDuLieu)) {
            return (
                <div className="relative">
                    <input type="number" value={val} onChange={(e) => setFormData({...formData, [col.key]: e.target.value})} disabled={isReadOnly} className={baseClass}/>
                    <Hash size={14} className="absolute right-3 top-3 text-gray-600"/>
                </div>
            );
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

    // Tìm cột hình ảnh để hiển thị trên cùng
    const imgCol = config.danhSachCot.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key));

    return (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-[#111] shrink-0 rounded-t-xl">
                    <h2 className="text-base font-bold text-white uppercase tracking-wide">
                        {isEditMode ? 'Thông Tin Chi Tiết' : 'Thêm Mới Dữ Liệu'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20}/></button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 custom-hover-scroll">
                    
                    {/* 🟢 KHU VỰC ẢNH ĐẠI DIỆN (Trung tâm) */}
                    {imgCol && (
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group w-32 h-32">
                                {formData[imgCol.key] ? (
                                    <img src={formData[imgCol.key]} className="w-32 h-32 rounded-full object-cover border-4 border-[#222] shadow-lg" alt="Avatar"/>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center border-4 border-[#222] shadow-inner">
                                        <ImageIcon size={40} className="text-gray-700"/>
                                    </div>
                                )}
                                
                                {/* Nút Upload (Chỉ hiện nếu có quyền) */}
                                {canEdit && (
                                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
                                        {uploadingImg ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imgCol.key)} disabled={uploadingImg}/>
                                    </label>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">{imgCol.label || 'Hình ảnh'}</span>
                        </div>
                    )}

                    {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-red-200 text-sm"><AlertCircle size={16}/> {error}</div>}

                    {/* FORM INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {config.danhSachCot.map((col) => {
                            // Ẩn cột tự động khi thêm mới
                            if (!isEditMode && col.tuDong) return null;
                            if (col.key === 'id') return null; // Luôn ẩn ID
                            if (['hinh_anh', 'avatar', 'image'].includes(col.key)) return null; // Đã hiện ở trên

                            return (
                                <div key={col.key} className={col.key.includes('mo_ta') ? 'md:col-span-2' : ''}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1 flex justify-between">
                                        <span>{col.label || col.key}</span>
                                        {col.batBuoc && <span className="text-red-500 text-[9px]">*Bắt buộc</span>}
                                    </label>
                                    {renderInput(col)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="h-16 border-t border-white/10 bg-[#111] flex items-center justify-between px-6 shrink-0 rounded-b-xl">
                    <div>
                        {canEdit && isEditMode && (
                            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-900/20 rounded font-bold text-xs uppercase tracking-wider transition-all"><Trash2 size={16}/> Xóa</button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded border border-white/10 text-gray-300 hover:bg-white/5 font-bold text-xs uppercase tracking-wider">Đóng</button>
                        {canEdit && (
                            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50">
                                {loading ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Lưu Lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}