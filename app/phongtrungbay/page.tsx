'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { Image as ImageIcon, ZoomIn, Calendar, User, Loader2, Award } from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
// 🟢 IMPORT FROM THE CORRECT FILE
import { getFinishedArtworksAction } from '@/app/actions/QuyenHanQuanLy'; 

export default function PhongTrungBay() {
    const { user } = useUser();
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const res = await getFinishedArtworksAction();
            if (res.success) setArtworks(res.data || []);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <KhungTrangChuan 
            nguoiDung={user} 
            loiChao="THƯ VIỆN TÁC PHẨM THỰC TẾ" 
            contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]"
        >
            {/* Header */}
            <div className="flex-none z-30 w-full h-[60px] bg-[#080808] border-b border-[#C69C6D]/30 flex items-center px-4 justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-[#C69C6D] p-2 rounded-lg text-black"><Award size={20}/></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">PHÒNG TRƯNG BÀY</h1>
                </div>
                <div className="text-xs text-gray-500 font-mono hidden md:block">
                    Tự động cập nhật từ Xưởng sản xuất
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
                
                {loading ? (
                    <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {artworks.length === 0 && (
                            <p className="text-white/30 text-center col-span-3 pt-20">Chưa có tác phẩm nào hoàn thiện.</p>
                        )}
                        
                        {artworks.map((art) => (
                            <div key={art.id} className="break-inside-avoid bg-[#111] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C69C6D]/50 transition-all hover:-translate-y-1 shadow-2xl">
                                {/* Image Area */}
                                <div className="relative group cursor-pointer" onClick={() => setSelectedImage(art.anh_thanh_pham)}>
                                    <img 
                                        src={art.anh_thanh_pham} 
                                        alt={art.ten_tac_pham}
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="text-[#C69C6D]" size={32}/>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-mono border border-white/10">
                                        {art.ma_don}
                                    </div>
                                </div>

                                {/* Detailed Info */}
                                <div className="p-4 bg-gradient-to-b from-[#111] to-black">
                                    <h3 className="text-[#C69C6D] font-serif font-bold text-lg leading-tight mb-2">
                                        {art.ten_tac_pham}
                                    </h3>
                                    
                                    <div className="flex justify-between items-end border-t border-white/10 pt-3">
                                        <div>
                                            <p className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                                                <User size={10}/> Nghệ nhân
                                            </p>
                                            <p className="text-white text-xs font-bold">{art.ten_nghe_nhan}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 justify-end mb-1">
                                                <Calendar size={10}/> Hoàn thành
                                            </p>
                                            <p className="text-white text-xs font-mono">
                                                {new Date(art.thoi_gian_ket_thuc).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Full Image View */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <img 
                        src={selectedImage} 
                        className="max-w-full max-h-[90vh] rounded-lg shadow-[0_0_50px_rgba(198,156,109,0.3)] object-contain"
                    />
                    <button className="absolute top-4 right-4 text-white/50 hover:text-white">
                        Đóng [ESC]
                    </button>
                </div>
            )}
        </KhungTrangChuan>
    );
}