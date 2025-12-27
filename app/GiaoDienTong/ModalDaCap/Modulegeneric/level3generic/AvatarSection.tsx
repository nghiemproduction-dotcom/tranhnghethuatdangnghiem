'use client';
import React, { useState } from 'react';
import { ImageIcon, Loader2, Upload, ZoomIn, X } from 'lucide-react';

interface Props {
    imgUrl: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
    canEdit: boolean;
    label: string;    // Tên hiển thị
    subLabel?: string; 
}

export default function AvatarSection({ imgUrl, onUpload, uploading, canEdit, label, subLabel }: Props) {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            {/* 🟢 FIX LAYOUT:
                - w-full: Chiếm hết chiều ngang
                - py-4: Padding vừa phải
                - flex-row: Xếp ngang để tiết kiệm chiều cao (Avatar bên trái, Tên bên phải) hoặc để dọc nhưng gọn
                Ở đây tôi giữ layout dọc nhưng tinh chỉnh cho gọn gàng và dính cứng.
            */}
            <div className="w-full flex flex-col items-center justify-center gap-3 py-3 transition-all">
                
                {/* 🟢 FIX AVATAR SIZE: Tăng từ w-16 lên w-24 (96px) cho rõ ràng */}
                <div 
                    className="w-24 h-24 bg-[#1a120f] rounded-full border-2 border-[#8B5E3C]/50 flex items-center justify-center overflow-hidden relative group shadow-lg cursor-pointer"
                    onClick={() => imgUrl && setIsZoomed(true)}
                >
                    {imgUrl ? (
                        <>
                            <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Avatar"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="text-white/80" size={24}/>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-[#5D4037]">
                            <ImageIcon size={32} className="opacity-50"/>
                        </div>
                    )}
                    
                    {/* Nút Upload */}
                    {canEdit && (
                        <label 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[#C69C6D] transition-all z-10 backdrop-blur-[1px]"
                            onClick={(e) => e.stopPropagation()} 
                            title="Đổi ảnh đại diện"
                        >
                            {uploading ? <Loader2 size={24} className="animate-spin"/> : <Upload size={24}/>}
                            <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={uploading}/>
                        </label>
                    )}
                </div>
                
                {/* 🟢 HIỂN THỊ TÊN CHÍNH XÁC - Font to hơn một chút so với bản cũ */}
                <div className="text-center px-4 w-full">
                    <h2 className="text-sm font-bold text-[#E8D4B9] uppercase tracking-wider truncate mx-auto max-w-[300px] leading-tight">
                        {label || 'CHƯA CÓ TÊN'}
                    </h2>
                </div>
            </div>

            {/* ZOOM MODAL */}
            {isZoomed && (
                <div className="fixed inset-0 z-[3500] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsZoomed(false)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 bg-white/10 rounded-full border border-white/10">
                        <X size={24}/>
                    </button>
                    <img src={imgUrl} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-[#8B5E3C]/20" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </>
    );
}