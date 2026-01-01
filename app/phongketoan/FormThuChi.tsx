'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { createThuChiAction, updateThuChiAction } from '@/app/actions/QuyenHanKeToan';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

export default function FormThuChi({ isOpen, onClose, onSuccess, initialData }: any) {
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) setFormData(initialData ? { ...initialData } : { loai_giao_dich: 'thu', so_tien: 0 });
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!formData.so_tien || formData.so_tien <= 0) return alert("Số tiền phải lớn hơn 0");
        setIsSaving(true);
        try {
            const action = initialData?.id ? updateThuChiAction(initialData.id, formData) : createThuChiAction(formData);
            const res = await action;
            if (res.success) { onSuccess(); onClose(); } else alert(res.error);
        } catch (e: any) { alert(e.message); } finally { setIsSaving(false); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploading(true);
        try {
            const compressed = await compressImage(file, 0.6, 800);
            const name = `bill_${Date.now()}.jpg`;
            const { error } = await supabase.storage.from('documents').upload(name, compressed);
            if (error) throw error;
            const { data } = supabase.storage.from('documents').getPublicUrl(name);
            setFormData({...formData, hinh_anh_chung_tu: data.publicUrl});
        } catch (e: any) { alert(e.message); } finally { setUploading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[200]">
            <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl flex flex-col shadow-2xl">
                <div className="p-4 text-center border-b border-white/10"><h2 className="text-[#C69C6D] font-black uppercase tracking-widest">{initialData ? 'SỬA GIAO DỊCH' : 'GHI NHẬN THU CHI'}</h2></div>
                <div className="p-6 space-y-4">
                    <div className="flex bg-black rounded-lg p-1 border border-white/10">
                        <button onClick={() => setFormData({...formData, loai_giao_dich: 'thu'})} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${formData.loai_giao_dich === 'thu' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-white'}`}>Thu Tiền</button>
                        <button onClick={() => setFormData({...formData, loai_giao_dich: 'chi'})} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${formData.loai_giao_dich === 'chi' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>Chi Tiền</button>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-[#C69C6D] uppercase">SỐ TIỀN (VNĐ)</label>
                        <input type="number" value={formData.so_tien} onChange={e => setFormData({...formData, so_tien: e.target.value})} className="w-full bg-black border border-[#C69C6D]/40 rounded-lg p-3 text-white text-lg font-mono font-bold focus:border-[#C69C6D]"/>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-[#C69C6D] uppercase">NỘI DUNG / LÝ DO</label>
                        <textarea rows={3} value={formData.mo_ta||''} onChange={e => setFormData({...formData, mo_ta: e.target.value})} className="w-full bg-black border border-[#C69C6D]/40 rounded-lg p-3 text-white text-sm" placeholder="VD: Thu tiền đơn hàng #123..."/>
                    </div>

                    <div onClick={() => !uploading && fileRef.current?.click()} className="flex flex-col items-center cursor-pointer border-2 border-dashed border-white/20 hover:border-[#C69C6D] rounded-lg p-4 transition-colors">
                        {formData.hinh_anh_chung_tu ? <img src={formData.hinh_anh_chung_tu} className="h-24 object-cover rounded"/> : <div className="text-center"><UploadCloud className="mx-auto text-gray-500 mb-1"/><span className="text-[10px] text-gray-400">Tải ảnh hóa đơn/chứng từ</span></div>}
                        {uploading && <Loader2 className="animate-spin text-[#C69C6D] mt-2"/>}
                        <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*"/>
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-lg">Hủy</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 bg-[#C69C6D] text-black font-bold uppercase text-xs rounded-lg flex justify-center items-center gap-2">{isSaving ? <Loader2 className="animate-spin"/> : <Save size={16}/>} Lưu</button>
                </div>
            </div>
        </div>
    );
}