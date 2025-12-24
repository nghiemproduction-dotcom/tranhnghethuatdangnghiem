'use client';
import React from 'react';
import { Lock, Crown, User, Briefcase, Wrench, Shield, Users, Palette, Clock } from 'lucide-react';
import { useSecurity, toSlug } from '@/app/HeThongPhanQuyen'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

interface Props {
    id: string; 
    title?: string; 
    children: React.ReactNode; 
    lockPosition?: string; 
    itemOwnerId?: string;
    className?: string;
    fallbackRoles?: string[]; 
}

export default function Secured({ 
    id, title = 'Chức năng', children, 
    lockPosition = 'absolute -top-2 -right-2', itemOwnerId,
    className = 'w-full h-full',
    fallbackRoles = [] 
}: Props) {
    const { isAdmin, check, openConfig, dbPermissions } = useSecurity();
    
    // Check quyền (Ưu tiên DB -> Fallback)
    const hasPermission = check(id, itemOwnerId, fallbackRoles);

    // Lấy quyền hiển thị cho Tooltip
    // Nếu DB không có (undefined/rỗng) -> Hiển thị Fallback cho đúng thực tế
    const currentAllowed = (dbPermissions[id] && dbPermissions[id].length > 0) 
                           ? dbPermissions[id] 
                           : fallbackRoles;

    const getRoleIcon = (roleRaw: string) => {
        const r = toSlug(roleRaw);
        if (r.includes('admin')) return { icon: Crown, color: 'text-yellow-400', label: 'Admin' };
        if (r.includes('quanly')) return { icon: Shield, color: 'text-blue-400', label: 'Quản lý' };
        if (r.includes('sales')) return { icon: Briefcase, color: 'text-green-400', label: 'Sales' };
        if (r.includes('tho')) return { icon: Wrench, color: 'text-orange-400', label: 'Kỹ thuật' };
        if (r.includes('owner')) return { icon: User, color: 'text-purple-400', label: 'Chính chủ' };
        if (r.includes('all')) return { icon: Users, color: 'text-white', label: 'Tất cả' };
        return { icon: User, color: 'text-gray-300', label: roleRaw };
    };

    if (!hasPermission && !isAdmin) return null;

    if (isAdmin) {
        return (
            <div className={`relative group/secure ${className}`}>
                <div className={!hasPermission ? "opacity-40 grayscale pointer-events-none transition-all" : "h-full transition-all"}>
                    {children}
                </div>

                <div className={`${lockPosition} z-[2000] flex items-center justify-center group/lock`}>
                    <div 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            // 🟢 CẬP NHẬT: Truyền fallbackRoles vào đây để modal biết đường hiển thị
                            openConfig(id, title, fallbackRoles); 
                        }}
                        className={`cursor-pointer w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.8)] border-2 border-white transition-transform hover:scale-125 hover:bg-red-700`}
                    >
                        <Lock size={12} strokeWidth={3} />
                    </div>

                    <div className="absolute bottom-full mb-2 right-0 bg-[#0a0807] border border-[#8B5E3C] rounded-lg shadow-xl p-2 w-max min-w-[120px] opacity-0 invisible group-hover/lock:opacity-100 group-hover/lock:visible transition-all duration-200 z-[3000] flex flex-col gap-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center border-b border-gray-800 pb-1 mb-1">Được phép truy cập:</p>
                        {(!currentAllowed || currentAllowed.length === 0) ? (
                            <div className="flex items-center gap-2 text-xs text-green-500"><Users size={12} /><span>Mặc định (All)</span></div>
                        ) : (
                            currentAllowed.map((role, idx) => {
                                const { icon: IconRole, color, label } = getRoleIcon(role);
                                return (<div key={idx} className={`flex items-center gap-2 text-xs ${color}`}><IconRole size={12} /><span className="capitalize">{label}</span></div>);
                            })
                        )}
                        <div className="mt-1 pt-1 border-t border-gray-800 text-[9px] text-gray-600 italic text-center">Bấm khóa để sửa</div>
                    </div>
                </div>
            </div>
        );
    }
    return <>{children}</>;
}