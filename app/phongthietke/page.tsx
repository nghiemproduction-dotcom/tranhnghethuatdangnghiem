'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { Palette, Image as ImageIcon, Search, Filter, UploadCloud, FileCode, CheckCircle2, Loader2 } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import { getDesignDataAction, updateDesignFileAction } from '@/app/actions/QuyenHanThietKe';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

export default function PhongThietKe() {
    const { user } = useUser();
    const [designs, setDesigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // Filter theo BST
    
    // Upload State
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await getDesignDataAction(1, 100, searchTerm, activeTab);
        if (res.success) setDesigns(res.data || []);
        setLoading(false);
    };

    // Xử lý Upload file gốc (.AI, .PSD)
    const handleUploadClick = (id: string) => {
        setUploadingId(id);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingId) return;

        try {
            const fileName = `design_${uploadingId}_${Date.now()}.${file.name.split('.').pop()}`;
            const { error: upErr } = await supabase.storage.from('documents').upload(fileName, file);
            if (upErr) throw upErr;
            
            const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
            
            // Cập nhật DB
            await updateDesignFileAction(uploadingId, data.publicUrl, "File gốc mới cập nhật");
            
            alert("✅ Upload file thiết kế thành công!");
            fetchData();
        } catch (err: any) {
            alert("Lỗi upload: " + err.message);
        } finally {
            setUploadingId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <KhungTrangChuan nguoiDung={user} loiChao="KHÔNG GIAN SÁNG TẠO" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* Header */}
            <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 flex items-center px-4 justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-[#C69C6D] p-2 rounded-lg text-black"><Palette size={20}/></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">PHÒNG THIẾT KẾ</h1>
                </div>
                <div className="relative group w-48 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-white focus:border-[#C69C6D] outline-none transition-all" 
                           placeholder="Tìm mẫu..." 
                           value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}/>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                
                {loading ? <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {designs.map(item => (
                            <div key={item.id} className="group bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C69C6D]/50 transition-all shadow-xl hover:shadow-[#C69C6D]/10 hover:-translate-y-1">
                                {/* Hình ảnh */}
                                <div className="aspect-[4/3] bg-black relative overflow-hidden">
                                    {item.hinh_anh ? (
                                        <img src={item.hinh_anh} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={48}/></div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-[#C69C6D] font-bold border border-white/10">
                                        {item.bo_suu_tap || 'BST Mới'}
                                    </div>
                                </div>

                                {/* Thông tin & Action */}
                                <div className="p-4">
                                    <h3 className="text-white font-serif font-bold text-lg truncate mb-1">{item.ten_vat_tu}</h3>
                                    <p className="text-gray-500 text-xs font-mono mb-4">{item.ma_sku}</p>

                                    {/* Trạng thái File */}
                                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                            <FileCode size={10}/> File Thiết Kế Gốc
                                        </p>
                                        {item.metadata?.file_thiet_ke ? (
                                            <div className="flex items-center justify-between text-[#C69C6D]">
                                                <a href={item.metadata.file_thiet_ke.url} target="_blank" className="text-xs font-bold underline truncate hover:text-white max-w-[150px]">
                                                    Tải xuống
                                                </a>
                                                <CheckCircle2 size={14}/>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-600 italic">Chưa có file gốc</p>
                                        )}
                                    </div>

                                    {/* Nút Upload */}
                                    <button 
                                        onClick={() => handleUploadClick(item.id)}
                                        disabled={uploadingId === item.id}
                                        className="w-full py-2 bg-[#C69C6D]/10 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black border border-[#C69C6D]/30 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                                    >
                                        {uploadingId === item.id ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14}/>}
                                        {item.metadata?.file_thiet_ke ? 'Cập nhật File' : 'Upload File Gốc'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Input ẩn để upload */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".ai,.psd,.cdr,.pdf,.zip,.rar" />
            </div>
        </KhungTrangChuan>
    );
}