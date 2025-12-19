'use client';
import React from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';

interface Props {
    userRole: string;
    targetTitle: string;
    allowedRoles: string[]; // Nhận thêm danh sách role
    onRedirect: () => void;
}

export default function AccessDenied({ userRole, targetTitle, allowedRoles, onRedirect }: Props) {
    // Format tên role cho đẹp
    const formatRole = (r: string) => r.charAt(0).toUpperCase() + r.slice(1);
    const roleName = (!userRole || userRole === 'khach') ? 'Khách vãng lai' : userRole;

    return (
        <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
            
            {/* Icon Khóa nhẹ nhàng */}
            <div className="w-16 h-16 mb-6 rounded-full bg-[#1a120f] border border-[#8B5E3C]/20 flex items-center justify-center">
                <LockKeyhole className="text-[#8B5E3C] w-8 h-8 opacity-80" strokeWidth={1.5} />
            </div>

            {/* Thông báo chính */}
            <h2 className="text-lg md:text-xl font-bold text-[#F5E6D3] mb-3 uppercase tracking-wider">
                Giới Hạn Truy Cập
            </h2>
            
            <div className="text-[#A1887F] text-sm md:text-base max-w-md leading-relaxed space-y-4">
                <p>
                    Xin chào <span className="text-white font-bold">"{roleName}"</span>,<br/>
                    Khu vực <span className="text-[#C69C6D] font-bold">"{targetTitle}"</span> chỉ dành riêng cho các vị trí sau:
                </p>

                {/* Danh sách vị trí được phép */}
                <div className="flex flex-wrap justify-center gap-2 py-2">
                    {allowedRoles.map((role, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-[#1a120f] border border-[#8B5E3C]/30 text-[10px] text-[#C69C6D] uppercase font-mono">
                            {formatRole(role)}
                        </span>
                    ))}
                </div>

                <p className="opacity-80">
                    Vui lòng xác nhận để hệ thống đưa bạn về đúng khu vực làm việc của mình.
                </p>
            </div>

            {/* Nút Xác nhận đơn giản */}
            <button 
                onClick={onRedirect}
                className="mt-8 px-8 py-3 bg-transparent border border-[#C69C6D]/50 hover:bg-[#C69C6D] hover:text-[#1a120f] text-[#C69C6D] font-bold text-xs uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center gap-2"
            >
                <span>Đã hiểu & Quay về</span>
                <ArrowRight size={14} />
            </button>
        </div>
    );
}