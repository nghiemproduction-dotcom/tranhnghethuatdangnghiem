'use client';
import React from 'react';
import { ImageIcon, Edit, Phone, Trophy } from 'lucide-react';

interface Props {
    data: any[];
    columns: any[];
    imgCol: any;
    titleCol: any;
    canEdit: boolean;
    onRowClick: (item: any) => void;
    selectedIds?: string[];
    onSelect?: (id: string) => void;
}

export default function CardView({ data, columns, imgCol, titleCol, canEdit, onRowClick, selectedIds = [], onSelect }: Props) {
    return (
        // 🟢 CẬP NHẬT: Padding lớn để nội dung không bị Header/Menu che mất
        // pt-[140px] = 85px (Menu Trên) + 55px (Header Tìm Kiếm)
        // pb-[180px] = 100px (Menu Dưới) + 80px (Thanh Tác Vụ)
        <div className="h-full overflow-y-auto custom-scroll p-4 pt-[140px] pb-[180px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {data.map((row, idx) => {
                    const imgUrl = imgCol ? row[imgCol.key] : null;
                    const name = row['ho_ten'] || row['ten'] || row[titleCol.key] || 'Chưa có tên';
                    const position = row['vi_tri'] || row['chuc_vu'] || 'Chưa có vị trí';
                    const phone = row['so_dien_thoai'] || row['phone'] || row['sdt'];
                    const isSelected = selectedIds.includes(row.id);
                    
                    const totalCustomers = row.total_khach;

                    return (
                        <div 
                            key={idx} 
                            onClick={() => onRowClick(row)} 
                            className={`
                                bg-[#1a120f]/80 backdrop-blur-sm rounded-xl cursor-pointer group flex flex-col overflow-hidden relative shadow-md h-fit transition-all duration-300
                                ${isSelected ? 'border-2 border-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.4)]' : 'border border-[#8B5E3C]/20 hover:border-[#C69C6D] hover:shadow-[0_0_15px_rgba(198,156,109,0.2)]'}
                            `}
                        >
                             {/* Checkbox chọn thẻ */}
                             <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded border-gray-600 bg-black/50 text-[#C69C6D] focus:ring-[#C69C6D] accent-[#C69C6D] cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => onSelect && onSelect(row.id)}
                                />
                            </div>

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
                                    <button className="absolute top-2 right-2 p-1.5 bg-[#C69C6D] rounded-full text-[#1a120f] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white z-10">
                                        <Edit size={12}/>
                                    </button>
                                )}
                            </div>
                            
                            {/* Card Info */}
                            <div className="p-4 flex flex-col gap-2">
                                <h3 className="font-bold text-[#F5E6D3] text-sm truncate uppercase group-hover:text-[#C69C6D] transition-colors">{String(name)}</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-[#1a120f] bg-[#C69C6D] px-2 py-0.5 rounded font-bold uppercase tracking-wider truncate max-w-full">{String(position)}</span>
                                    
                                    {/* Hiển thị cúp vàng nếu có khách */}
                                    {totalCustomers !== undefined && totalCustomers > 0 && (
                                        <div className="flex items-center gap-1 bg-[#F5E6D3]/10 border border-[#C69C6D]/30 px-1.5 py-0.5 rounded">
                                            <Trophy size={10} className="text-[#C69C6D]" />
                                            <span className="text-[10px] font-bold text-[#F5E6D3]">{totalCustomers} khách</span>
                                        </div>
                                    )}
                                </div>

                                {phone && (
                                    <div className="flex items-center justify-between border-t border-[#8B5E3C]/10 pt-2 mt-1">
                                        <span className="text-xs text-[#A1887F] font-mono tracking-wide">{phone}</span>
                                        <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()} className="p-1.5 bg-[#1a4d2e] text-green-100 rounded hover:bg-[#276f45] transition-colors" title="Gọi ngay"><Phone size={12}/></a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}