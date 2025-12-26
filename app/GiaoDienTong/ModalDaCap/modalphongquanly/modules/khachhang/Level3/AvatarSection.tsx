'use client';
import React, { useState } from 'react';
import { ImageIcon, Loader2, Upload, ZoomIn, X } from 'lucide-react';

interface Props {
    imgUrl: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
    canEdit: boolean;
    label: string;    // Tên hiển thị
    subLabel?: string; // 🟢 Mới: Vị trí/Chức vụ
}

export default function AvatarSection({ imgUrl, onUpload, uploading, canEdit, label, subLabel }: Props) {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-3 items-center">
                {/* Khung ảnh vuông lớn */}
                <div 
                    className="w-[160px] h-[160px] bg-[#1a120f] rounded-xl border-2 border-[#8B5E3C]/30 flex items-center justify-center overflow-hidden relative group shadow-2xl cursor-pointer"
                    onClick={() => imgUrl && setIsZoomed(true)}
                >
                    {imgUrl ? (
                        <>
                            <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Avatar"/>
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="text-white drop-shadow-md" size={24}/>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[#5D4037]">
                            <ImageIcon size={32} className="opacity-30"/>
                            <span className="text-[9px] uppercase font-bold text-center px-2">Chưa có ảnh</span>
                        </div>
                    )}
                    
                    {canEdit && (
                        <label 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[#C69C6D] transition-all backdrop-blur-[2px] z-10"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {uploading ? <Loader2 size={24} className="animate-spin"/> : <Upload size={24}/>}
                            <span className="text-[9px] font-bold mt-2 uppercase tracking-widest">{uploading ? 'Đang tải...' : 'Đổi Ảnh'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={uploading}/>
                        </label>
                    )}
                </div>
                
                {/* 🟢 HIỂN THỊ TÊN & VỊ TRÍ */}
                <div className="text-center">
                    <h2 className="text-lg font-bold text-[#F5E6D3] uppercase tracking-wide leading-tight max-w-[200px]">
                        {label || 'CHƯA ĐẶT TÊN'}
                    </h2>
                    {subLabel && (
                        <p className="text-[10px] font-bold text-[#C69C6D] uppercase tracking-widest mt-1 opacity-80">
                            {subLabel}
                        </p>
                    )}
                </div>
            </div>

            {/* ZOOM MODAL */}
            {isZoomed && (
                <div className="fixed inset-0 z-[2500] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsZoomed(false)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 bg-white/10 rounded-full">
                        <X size={24}/>
                    </button>
                    <img src={imgUrl} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </>
    );
}