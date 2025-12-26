'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { X, Save, Trash2, Loader2, Image as ImageIcon, Briefcase, Link2, ExternalLink } from 'lucide-react';

interface Props {
    id: number; // Nếu id = -1 là tạo mới
    onClose: () => void;
    onSuccess: () => void;
}

export default function NhanSuDetail({ id, onClose, onSuccess }: Props) {
    const isEdit = id !== -1;
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(false);
    
    // State cho bảng quan hệ (Công việc đã tạo)
    const [jobs, setJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadDetail();
            loadRelatedJobs();
        }
    }, [id]);

    const loadDetail = async () => {
        const { data } = await supabase.from('nhan_su').select('*').eq('id', id).single();
        if (data) setForm(data);
    };

    // 🟢 LOAD DỮ LIỆU TỪ BẢNG LIÊN KẾT (thu_vien_viec_mau)
    const loadRelatedJobs = async () => {
        setLoadingJobs(true);
        // GIẢ ĐỊNH: Trong bảng thu_vien_viec_mau có cột 'nguoi_tao' lưu tên hoặc ID nhân sự
        // Bạn cần thay 'nguoi_tao' bằng tên cột thực tế nếu khác (VD: nhan_su_id)
        const { data } = await supabase
            .from('thu_vien_viec_mau')
            .select('*')
            //.eq('nguoi_tao_id', id) // Nếu liên kết bằng ID (Chuẩn nhất)
            .eq('nguoi_tao', form.ho_ten || '') // Nếu liên kết lỏng bằng Tên (Fallback) - Sửa logic này theo DB thật của bạn
            .limit(20); 
        
        if (data) setJobs(data);
        setLoadingJobs(false);
    };

    const handleSave = async () => {
        setLoading(true);
        const payload = { ...form };
        delete payload.id; delete payload.tao_luc; // Xóa field hệ thống

        let error;
        if (isEdit) {
            const res = await supabase.from('nhan_su').update(payload).eq('id', id);
            error = res.error;
        } else {
            const res = await supabase.from('nhan_su').insert(payload);
            error = res.error;
        }

        setLoading(false);
        if (!error) onSuccess();
        else alert("Lỗi: " + error.message);
    };

    return (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in slide-in-from-right-10 duration-300">
            <div className="w-full max-w-4xl h-[85vh] bg-[#110d0c] border border-[#C69C6D]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <div className="h-14 bg-[#161210] border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 shrink-0">
                    <h3 className="font-bold text-[#F5E6D3] uppercase tracking-widest">
                        {isEdit ? `Chi Tiết: ${form.ho_ten || 'Nhân Sự'}` : 'Thêm Nhân Sự Mới'}
                    </h3>
                    <button onClick={onClose}><X className="text-[#8B5E3C] hover:text-white"/></button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto custom-scroll p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* CỘT TRÁI: FORM CHÍNH */}
                        <div className="flex-1 space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-24 h-24 bg-[#1a120f] border border-[#8B5E3C]/30 rounded-xl flex items-center justify-center shrink-0">
                                    {form.avatar ? <img src={form.avatar} className="w-full h-full object-cover rounded-xl"/> : <ImageIcon className="text-[#5D4037]"/>}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-[10px] text-[#8B5E3C] uppercase font-bold">Họ và Tên</label>
                                        <input className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#F5E6D3] outline-none focus:border-[#C69C6D]" 
                                            value={form.ho_ten || ''} onChange={e => setForm({...form, ho_ten: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[#8B5E3C] uppercase font-bold">Vị Trí / Chức Vụ</label>
                                        <input className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#F5E6D3] outline-none focus:border-[#C69C6D]" 
                                            value={form.vi_tri || ''} onChange={e => setForm({...form, vi_tri: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-[#8B5E3C] uppercase font-bold">Số Điện Thoại</label>
                                    <input className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#F5E6D3] outline-none focus:border-[#C69C6D]" 
                                        value={form.so_dien_thoai || ''} onChange={e => setForm({...form, so_dien_thoai: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-[#8B5E3C] uppercase font-bold">Email</label>
                                    <input className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#F5E6D3] outline-none focus:border-[#C69C6D]" 
                                        value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: LIÊN KẾT (RELATED JOBS) */}
                        {isEdit && (
                            <div className="w-full lg:w-[350px] bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl flex flex-col overflow-hidden shrink-0">
                                <div className="p-3 bg-[#221a18] border-b border-[#8B5E3C]/10 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#C69C6D] uppercase flex items-center gap-2">
                                        <Briefcase size={14}/> Việc Mẫu Đã Tạo
                                    </span>
                                    <span className="bg-[#C69C6D]/20 text-[#C69C6D] text-[10px] px-1.5 rounded font-bold">{jobs.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-2 max-h-[400px]">
                                    {loadingJobs ? (
                                        <div className="text-center py-4"><Loader2 className="animate-spin inline text-[#8B5E3C]"/></div>
                                    ) : jobs.length === 0 ? (
                                        <p className="text-center text-[10px] text-[#5D4037] py-4 italic">Chưa tạo việc mẫu nào</p>
                                    ) : (
                                        jobs.map(job => (
                                            <div key={job.id} className="p-3 rounded bg-[#0a0807] border border-[#8B5E3C]/10 hover:border-[#C69C6D]/50 transition-colors group">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs text-[#F5E6D3] font-bold line-clamp-1">{job.ten_viec || 'Không tên'}</span>
                                                    <ExternalLink size={12} className="text-[#5D4037] group-hover:text-[#C69C6D]"/>
                                                </div>
                                                <p className="text-[10px] text-[#8B5E3C] mt-1 truncate">{job.loai_viec || 'Loại: Khác'}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="h-16 bg-[#161210] border-t border-[#8B5E3C]/20 flex items-center justify-end px-6 gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2 rounded text-[#8B5E3C] hover:text-[#F5E6D3] font-bold text-xs uppercase">Đóng</button>
                    <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-[#C69C6D] text-[#1a120f] font-bold text-xs uppercase rounded shadow-lg hover:bg-[#b08b5e] flex items-center gap-2">
                        {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Lưu Lại
                    </button>
                </div>
            </div>
        </div>
    );
}