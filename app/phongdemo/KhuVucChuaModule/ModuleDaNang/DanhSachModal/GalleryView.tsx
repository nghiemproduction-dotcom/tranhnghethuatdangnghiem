'use client';
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
    data: any[];
    titleCol: string;
    imgCol: string;
    onSelectItem: (item: any) => void;
}

export function GalleryView({ data, titleCol, imgCol, onSelectItem }: Props) {
    return (
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.map((item, idx) => {
                const imgUrl = item[imgCol];
                // Kiểm tra sơ bộ xem có phải link ảnh không
                const hasImage = imgUrl && typeof imgUrl === 'string' && imgUrl.length > 10;

                return (
                    <div key={idx} onClick={() => onSelectItem(item)} className="group relative aspect-[3/4] bg-[#161616] rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer">
                        {hasImage ? (
                            <img 
                                src={imgUrl} 
                                alt={item[titleCol]} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-white/5 gap-2">
                                <ImageIcon size={32} className="opacity-50"/>
                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">No Image</span>
                            </div>
                        )}
                        
                        {/* Overlay Gradient tối để chữ dễ đọc */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                            <h4 className="text-white font-bold text-sm truncate drop-shadow-md">{item[titleCol]}</h4>
                            {/* Nếu có giá tiền (thường là viec_mau), hiện luôn */}
                            {item['don_gia'] && <p className="text-[10px] text-green-400 font-mono mt-0.5">{Number(item['don_gia']).toLocaleString()} đ</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}