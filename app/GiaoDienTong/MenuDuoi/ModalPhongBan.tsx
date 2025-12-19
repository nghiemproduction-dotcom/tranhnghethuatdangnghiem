'use client';

import React from 'react';
import { ShieldCheck, Briefcase, Hammer, Clock, Users, TrendingUp, Lock, ChevronRight, Palette } from 'lucide-react';
import Link from 'next/link';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
}

export default function ModalPhongBan({ isOpen, onClose, currentUser }: Props) {
    if (!isOpen) return null;

    const myRole = currentUser?.role || 'khach';
    // Admin Cung hoặc Admin hệ thống luôn được vào mọi nơi
    const isSystemAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true' || myRole.includes('admin') || myRole.includes('boss');

    const iconClass = "w-[clamp(24px,6vw,36px)] h-[clamp(24px,6vw,36px)]";

    const DEPARTMENTS = [
        { 
            id: 'admin', name: 'Phòng Admin', 
            icon: <ShieldCheck className={iconClass} />, 
            color: 'text-red-500',
            desc: 'Quản trị hệ thống & Cấu hình', 
            allowedRoles: ['admin', 'adminsystem'], 
            href: '/phongadmin' 
        },
        { 
            id: 'quan_ly', name: 'Phòng Quản Lý', 
            icon: <Briefcase className={iconClass} />, 
            color: 'text-yellow-500',
            desc: 'Điều hành & Báo cáo tổng hợp', 
            allowedRoles: ['admin', 'adminsystem', 'quanly', 'manager'], 
            href: '/phongquanly' 
        },
        { 
            id: 'thiet_ke', name: 'Phòng Thiết Kế', 
            icon: <Palette className={iconClass} />, 
            color: 'text-pink-500',
            desc: 'Sáng tạo Mẫu & Sản phẩm mới', 
            allowedRoles: ['admin', 'adminsystem', 'quanly', 'thietke', 'designer', 'hoa_si'], 
            href: '/phongthietke' 
        },
        { 
            id: 'tho', name: 'Phòng Thợ', 
            icon: <Hammer className={iconClass} />, 
            color: 'text-blue-500',
            desc: 'Sản xuất & Thi công dự án', 
            allowedRoles: ['admin', 'adminsystem', 'quanly', 'manager', 'tho', 'thosanxuat', 'sanxuat'], 
            href: '/phongtho' 
        },
        { 
            id: 'sales', name: 'Phòng Sales', 
            icon: <TrendingUp className={iconClass} />, 
            color: 'text-green-500',
            desc: 'Kinh doanh & Doanh số', 
            allowedRoles: ['admin', 'adminsystem', 'quanly', 'manager', 'sales', 'kinhdoanh'], 
            href: '/phongsales' 
        },
        { 
            id: 'ctv', name: 'Phòng CTV', 
            icon: <Users className={iconClass} />, 
            color: 'text-orange-500',
            desc: 'Cộng tác viên mở rộng', 
            allowedRoles: ['admin', 'adminsystem', 'quanly', 'congtacvien', 'ctv'], 
            href: '/phongctv' 
        },
    ];

    const checkAccess = (allowedRoles: string[]) => {
        if (isSystemAdmin) return true;
        return allowedRoles.some(r => myRole.includes(r));
    };

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[980] flex flex-col bg-[#110d0c]/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 border-b border-[#8B5E3C]/30 shadow-2xl">
             
             <style jsx>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #1a120f; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; }
                .text-resp-title { font-size: clamp(18px, 5vw, 24px); }
                .text-resp-name { font-size: clamp(14px, 4vw, 18px); }
                .text-resp-desc { font-size: clamp(10px, 3vw, 13px); }
            `}</style>

            <div className="h-[clamp(60px,15vw,70px)] flex items-center justify-center border-b border-[#8B5E3C]/20 shrink-0 bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent">
                <h2 className="text-resp-title font-bold text-[#C69C6D] uppercase tracking-[0.2em] drop-shadow-md">Cổng Chuyển Tiếp</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-[4vw] pb-6 custom-scroll">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[3vw] max-w-4xl mx-auto">
                    {DEPARTMENTS.map((dept) => {
                        const canAccess = checkAccess(dept.allowedRoles);
                        return (
                            <div key={dept.id} className={`relative group border rounded-xl p-[0.5vh] transition-all duration-300 ${canAccess ? 'border-[#8B5E3C]/30 hover:border-[#C69C6D] bg-[#1a120f]/80' : 'border-white/5 bg-black/40 opacity-50 grayscale'}`}>
                                {canAccess && (
                                    <Link href={dept.href} onClick={onClose} className="absolute inset-0 z-10"></Link>
                                )}
                                <div className="flex items-center gap-[3vw] p-[2vw] rounded-lg h-full">
                                    <div className={`p-[2vw] rounded-xl bg-[#110d0c] border border-white/5 ${dept.color} shadow-inner`}>
                                        {dept.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-resp-name uppercase tracking-wide ${canAccess ? 'text-[#F5E6D3] group-hover:text-[#C69C6D]' : 'text-gray-500'}`}>
                                            {dept.name}
                                        </h3>
                                        <p className="text-resp-desc text-gray-500 mt-1">{dept.desc}</p>
                                    </div>
                                    <div className="pr-2">
                                        {canAccess ? <ChevronRight className="w-5 h-5 text-[#8B5E3C] group-hover:text-[#C69C6D]" /> : <Lock className="w-5 h-5 text-gray-600" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}