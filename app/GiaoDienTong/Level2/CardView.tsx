'use client';
import React from 'react';
import { ImageIcon, Edit } from 'lucide-react';

interface Props {
    data: any[];
    columns: any[];
    imgCol: any;
    titleCol: any;
    canEdit: boolean;
    onRowClick: (item: any) => void;
}

export default function CardView({ data, columns, imgCol, titleCol, canEdit, onRowClick }: Props) {
    return (
        <div className="h-full overflow-auto custom-scroll p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {data.map((row, idx) => {
                    const imgUrl = imgCol ? row[imgCol.key] : null;
                    return (
                        <div key={idx} onClick={() => onRowClick(row)} className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl hover:border-[#C69C6D] cursor-pointer group flex flex-col overflow-hidden relative shadow-md h-fit transition-all duration-300 hover:shadow-[0_0_15px_rgba(198,156,109,0.2)]">
                            {/* Card Image */}
                            <div className="w-full aspect-[16/9] bg-[#111] relative flex items-center justify-center overflow-hidden border-b border-[#8B5E3C]/10">
                                {imgUrl ? (
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e: any) => e.target.style.display='none'}/>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-[#5D4037]">
                                        <ImageIcon size={32}/>
                                        <span className="text-[10px] uppercase font-bold">No Image</span>
                                    </div>
                                )}
                                {canEdit && (
                                    <button className="absolute top-2 right-2 p-1.5 bg-[#C69C6D] rounded-full text-[#1a120f] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white">
                                        <Edit size={12}/>
                                    </button>
                                )}
                            </div>
                            
                            {/* Card Info */}
                            <div className="p-4 flex flex-col gap-1.5">
                                <h3 className="font-bold text-[#F5E6D3] text-sm truncate group-hover:text-[#C69C6D] transition-colors">
                                    {String(row[titleCol.key] || 'No Title')}
                                </h3>
                                {columns[1] && (
                                    <p className="text-xs text-[#A1887F] truncate border-b border-[#8B5E3C]/10 pb-2">
                                        {String(row[columns[1].key] || '-')}
                                    </p>
                                )}
                                <div className="pt-1 flex flex-wrap gap-2">
                                    {columns.slice(2, 5).map(c => (
                                        <div key={c.key} className="text-[10px] text-[#8B5E3C] bg-[#2a1e1b] border border-[#8B5E3C]/20 px-2 py-0.5 rounded truncate max-w-full">
                                            {String(row[c.key] || '-')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}