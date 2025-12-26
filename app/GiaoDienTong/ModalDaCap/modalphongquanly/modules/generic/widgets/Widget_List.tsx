'use client';
import React from 'react';
import { User, FileText } from 'lucide-react';

interface Props {
    data: any[];
    titleField: string;
    subField: string;
    loading: boolean;
}

export default function Widget_List({ data, titleField, subField, loading }: Props) {
    if (loading) return null;

    return (
        <div className="flex-1 flex flex-col gap-2 mt-3 overflow-hidden relative z-10 h-full">
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-600">Chưa có dữ liệu</div>
            ) : (
                data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-[#0a0807]/60 border border-[#8B5E3C]/10 hover:border-[#C69C6D]/40 hover:bg-[#C69C6D]/5 transition-all group/item">
                        <div className="w-8 h-8 rounded-full bg-[#1a120f] border border-[#8B5E3C]/20 flex items-center justify-center shrink-0 text-[#C69C6D] group-hover/item:scale-110 transition-transform">
                            {item.hinh_anh || item.avatar ? (
                                <img src={item.hinh_anh || item.avatar} className="w-full h-full object-cover rounded-full"/>
                            ) : (
                                <User size={14}/>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#E8D4B9] truncate group-hover/item:text-[#C69C6D] transition-colors">
                                {item[titleField] || 'Chưa đặt tên'}
                            </div>
                            <div className="text-[10px] text-[#5D4037] truncate flex items-center gap-1">
                                {item[subField] ? <span>{item[subField]}</span> : <span className="italic opacity-50">--</span>}
                            </div>
                        </div>
                    </div>
                ))
            )}
            {/* Fade effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#161210] to-transparent pointer-events-none"/>
        </div>
    );
}