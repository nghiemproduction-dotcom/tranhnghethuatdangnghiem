'use client';
import React, { useState } from 'react';
import { ImageIcon, Loader2, Upload, ZoomIn, X } from 'lucide-react';

interface Props {
    imgUrl: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
    canEdit: boolean;
    label: string;
}

export default function AvatarSection({ imgUrl, onUpload, uploading, canEdit, label }: Props) {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <div className="w-full shrink-0 flex flex-col gap-4 items-center">
                <div 
                    className="aspect-[3/4] w-full max-w-[240px] bg-[#1a120f] rounded-xl border border-[#8B5E3C]/30 flex items-center justify-center overflow-hidden relative group shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer"
                    onClick={() => imgUrl && setIsZoomed(true)}
                >
                    {imgUrl ? (
                        <>
                            <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Avatar"/>
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="text-white drop-shadow-md" size={32}/>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-[#5D4037]">
                            <ImageIcon size={48} className="opacity-30"/>
                            <span className="text-[10px] uppercase font-bold">Chưa có ảnh</span>
                        </div>
                    )}
                    
                    {canEdit && (
                        <label 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer text-[#C69C6D] transition-all backdrop-blur-[2px] z-10"
                            onClick={(e) => e.stopPropagation()} // Tránh mở zoom khi bấm upload
                        >
                            {uploading ? <Loader2 size={32} className="animate-spin"/> : <Upload size={32}/>}
                            <span className="text-xs font-bold mt-2 uppercase tracking-widest">{uploading ? 'Đang nén & Tải...' : 'Tải Ảnh Mới'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={uploading}/>
                        </label>
                    )}
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-[#C69C6D] uppercase tracking-wider border-b-2 border-[#C69C6D] inline-block pb-1 px-4">{label}</p>
                </div>
            </div>

            {/* ZOOM MODAL */}
            {isZoomed && (
                <div className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsZoomed(false)}>
                    <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
                        <X size={32}/>
                    </button>
                    <img 
                        src={imgUrl} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}