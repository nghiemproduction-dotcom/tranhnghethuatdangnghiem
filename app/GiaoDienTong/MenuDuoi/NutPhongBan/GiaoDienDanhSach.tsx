'use client';
import React from 'react'; 
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
// 🟢 Lấy hàm kiểm tra quyền "nguyên thủy" từ file dữ liệu
import { kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

interface Props {
    data: any[]; 
    nguoiDung: any;
    onDongModal: () => void;
    onMoModal?: (id: string) => void;
}

export default function GiaoDienDanhSach({ data, nguoiDung, onDongModal, onMoModal }: Props) {
    if (!data || data.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto pb-10 px-4">
            {data.map((phong) => {
                const Icon = phong.icon;
                
                // 1. KIỂM TRA QUYỀN TRỰC TIẾP (Không qua Database/Secured)
                const coQuyen = kiemTraQuyen(nguoiDung, phong.quyenTruyCap);

                const glowColor = phong.mauSac.includes('red') ? '#ef4444' :
                                  phong.mauSac.includes('blue') ? '#3b82f6' :
                                  phong.mauSac.includes('green') ? '#22c55e' :
                                  phong.mauSac.includes('pink') ? '#ec4899' : '#C69C6D';

                return (
                    <div 
                        key={phong.id} 
                        className={`
                            relative group overflow-hidden rounded-2xl border transition-all duration-500 w-full h-full
                            ${coQuyen 
                                ? 'bg-[#120e0d] border-white/5 hover:border-[#C69C6D]/40 hover:bg-[#1a1512] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] cursor-pointer' 
                                : 'bg-[#0a0807] border-transparent opacity-60 grayscale cursor-not-allowed' // 🟢 MÃ LÀM MỜ Ở ĐÂY
                            }
                        `}
                    >
                        {/* 2. CHẶN LINK: Nếu có quyền mới sinh ra Link/Click */}
                        {coQuyen && (
                            <>
                                {onMoModal ? (
                                    <div onClick={(e) => { e.stopPropagation(); onMoModal(phong.id); }} className="absolute inset-0 z-20 w-full h-full bg-transparent" />
                                ) : (
                                    <Link href={phong.duongDan} onClick={onDongModal} className="absolute inset-0 z-10" />
                                )}
                            </>
                        )}
                        
                        {/* Hiệu ứng ánh sáng (Chỉ hiện khi có quyền) */}
                        {coQuyen && (
                            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: glowColor }} />
                        )}
                        
                        <div className="flex items-center gap-5 p-5 relative z-10 h-full">
                            {/* Icon Phòng */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${coQuyen ? 'group-hover:scale-110' : ''} transition-transform duration-500`}>
                                <Icon className={`w-7 h-7 ${phong.mauSac} drop-shadow-md`} />
                            </div>

                            {/* Tên & Mô tả */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className={`font-black text-[15px] sm:text-[16px] uppercase tracking-wider truncate transition-colors duration-300 ${coQuyen ? 'text-[#E8DCC8] group-hover:text-white' : 'text-gray-600'}`}>
                                    {phong.ten}
                                </h3>
                                {/* 🟢 MÃ ĐỔI CHỮ: Nếu không có quyền -> Hiện "Khu vực hạn chế" */}
                                <p className="text-[11px] sm:text-[12px] text-gray-500 mt-1 truncate font-medium group-hover:text-[#C69C6D] transition-colors">
                                    {coQuyen ? phong.moTa : 'Khu vực hạn chế'}
                                </p>
                            </div>

                            {/* Nút mũi tên hoặc Ổ khóa */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${coQuyen ? 'bg-white/5 group-hover:bg-[#C69C6D] group-hover:text-black group-hover:border-[#C69C6D]' : 'bg-transparent'} transition-all duration-300`}>
                                {coQuyen ? (
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-[#1a120f] transition-colors" />
                                ) : (
                                    // 🟢 MÃ HIỆN Ổ KHÓA
                                    <Lock size={14} className="text-gray-700" />
                                )}
                            </div>
                        </div>

                        {/* Line màu dưới đáy */}
                        {coQuyen && (
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-out opacity-70" style={{ backgroundColor: glowColor }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}