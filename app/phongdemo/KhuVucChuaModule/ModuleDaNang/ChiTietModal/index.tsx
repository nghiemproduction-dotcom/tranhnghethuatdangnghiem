'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { X, Save, Calendar, Hash, Type, Image as ImageIcon, ChevronRight, Zap, AlertCircle, Upload, Loader2, Edit3, Trash2 } from 'lucide-react';
import { CustomAction } from '../../KieuDuLieuModule';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any; 
    isCreating: boolean;
    canEdit: boolean; 
    onSave: (data: any) => Promise<void>;
    customActions?: CustomAction[];
    onCustomAction: (action: CustomAction, ids: string[]) => void;
}

export default function ChiTietModal({ isOpen, onClose, data, isCreating, canEdit, onSave, customActions, onCustomAction }: Props) {
    const [formData, setFormData] = useState<any>({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { 
        if (data) {
            setFormData(JSON.parse(JSON.stringify(data)));
            setIsEditMode(isCreating);
        }
    }, [data, isCreating]);

    if (!isOpen || !data) return null;

    const ignoredFields = ['created_at', 'updated_at', 'id']; 
    const allFields = Object.keys(formData).filter(k => !ignoredFields.includes(k));
    
    // 🟢 TÌM CỘT ẢNH (Hỗ trợ cả hinh_anh, avatar_url cho chắc ăn)
    const imageField = allFields.find(k => k === 'hinh_anh' || k === 'avatar_url' || k === 'avatar' || k === 'image');
    const otherFields = allFields.filter(k => k !== imageField);

    const footerActions = customActions?.filter(a => a.location === 'detail_footer') || [];

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 800;
                let width = img.width; let height = img.height;
                if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
                else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("Lỗi nén")); }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleUploadImage = async (event: any, fieldKey: string) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const compressedBlob = await compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, compressedFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
            setFormData((prev: any) => ({ ...prev, [fieldKey]: publicUrl }));
        } catch (error: any) { alert('Lỗi: ' + error.message); } 
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(formData);
        setSaving(false);
        if (!isCreating) setIsEditMode(false);
    };

    const getFieldType = (key: string, value: any) => {
        if (typeof value === 'number') return { icon: <Hash size={14} className="text-yellow-500"/>, type: 'number' };
        if (key.includes('ngay') || key.includes('date') || key.includes('time')) return { icon: <Calendar size={14} className="text-green-500"/>, type: 'datetime-local' };
        return { icon: <Type size={14} className="text-blue-500"/>, type: 'text' };
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-2xl h-auto max-h-[90vh] bg-[#121212] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                
                <div className="p-4 bg-[#181818] border-b border-white/5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-full text-blue-500"><AlertCircle size={20}/></div>
                        <div>
                            <h4 className="text-white font-bold uppercase text-base tracking-wider">{isCreating ? 'THÊM MỚI' : 'CHI TIẾT'}</h4>
                            {!isCreating && <p className="text-[10px] text-gray-500 font-mono">ID: {formData.id}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 hover-scrollbar bg-[#0E0E0E]">
                    {/* 🟢 KHU VỰC AVATAR (HIỆN RÕ RÀNG HƠN) */}
                    {imageField && (
                        <div className="flex flex-col items-center mb-8 p-4 border border-white/5 rounded-xl bg-[#161616]">
                            <div className="relative group mb-4">
                                <div className="w-32 h-32 rounded-full border-2 border-white/10 overflow-hidden bg-[#181818] flex items-center justify-center shadow-2xl">
                                    {formData[imageField] ? (
                                        <img src={formData[imageField]} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={40} className="text-gray-600"/>
                                    )}
                                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-white"/></div>}
                                </div>
                            </div>

                            {/* Nút Upload chỉ hiện khi Edit Mode */}
                            {isEditMode && (
                                <div className="flex flex-col items-center gap-2 w-full max-w-xs animate-in slide-in-from-top-2">
                                    <div className="flex gap-2 w-full justify-center">
                                        <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all">
                                            <Upload size={14}/> Tải Ảnh Mới
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, imageField)} disabled={uploading}/>
                                        </label>
                                        {formData[imageField] && (
                                            <button onClick={() => setFormData({...formData, [imageField]: null})} className="px-3 py-2 bg-red-900/30 hover:bg-red-600 text-red-200 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1">
                                                <Trash2 size={14}/> Xóa
                                            </button>
                                        )}
                                    </div>
                                    {/* Ô nhập link thủ công */}
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#0A0A0A] border border-white/10 text-[10px] text-gray-400 rounded px-2 py-1.5 outline-none focus:border-blue-500 text-center placeholder:text-gray-600"
                                        placeholder="Hoặc dán đường link ảnh tại đây..."
                                        value={formData[imageField] || ''}
                                        onChange={(e) => setFormData({...formData, [imageField]: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {otherFields.map((key) => {
                            const value = formData[key];
                            const { icon, type } = getFieldType(key, value);
                            const isLongText = typeof value === 'string' && value.length > 60;
                            return (
                                <div key={key} className={`${isLongText ? 'md:col-span-2' : ''}`}>
                                    <label className="text-[10px] uppercase text-gray-500 font-bold mb-1.5 flex items-center gap-1.5">{icon} {key.replace(/_/g, ' ')}</label>
                                    {isEditMode ? (
                                        isLongText ? (
                                            <textarea className="w-full bg-[#1A1A1A] border border-white/10 rounded p-3 text-sm text-white focus:border-blue-500 outline-none resize-none h-24" value={value || ''} onChange={(e) => setFormData({...formData, [key]: e.target.value})} />
                                        ) : (
                                            <input type={type} className="w-full bg-[#1A1A1A] border border-white/10 rounded p-2.5 text-sm text-white focus:border-blue-500 outline-none" value={value || ''} onChange={(e) => setFormData({...formData, [key]: e.target.value})} />
                                        )
                                    ) : (
                                        <div className="w-full min-h-[38px] p-2.5 text-sm text-gray-300 border-b border-white/5 font-medium break-words">
                                            {value === null || value === '' ? <span className="text-gray-700 italic">Empty</span> : String(value)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-[#181818] border-t border-white/5 flex justify-between items-center shrink-0">
                    <div className="flex gap-2">
                        {canEdit && !isCreating && footerActions.map(act => (
                            <button key={act.id} onClick={() => onCustomAction(act, [formData.id])} className={`px-3 py-2 border rounded-md text-xs font-bold transition-all flex items-center gap-1 bg-${act.color}-900/10 border-${act.color}-500/30 text-${act.color}-500 hover:bg-${act.color}-600 hover:text-white`}><Zap size={12}/> {act.label}</button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {!isEditMode && canEdit && !isCreating && (
                            <button onClick={() => setIsEditMode(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all"><Edit3 size={14}/> Chỉnh sửa</button>
                        )}
                        {isEditMode && (
                            <>
                                <button onClick={() => { if(isCreating) onClose(); else { setIsEditMode(false); setFormData(data); } }} className="px-5 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">Hủy bỏ</button>
                                <button onClick={handleSave} disabled={saving || uploading} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-2 animate-pulse hover:animate-none">{saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Lưu</button>
                            </>
                        )}
                        {!canEdit && <button onClick={onClose} className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full text-xs font-bold">Đóng</button>}
                    </div>
                </div>
            </div>
        </div>
    );
}