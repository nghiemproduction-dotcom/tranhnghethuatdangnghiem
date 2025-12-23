'use client';
import React from 'react';
import { Lock } from 'lucide-react';
import { useSecurity } from '@/app/HeThongPhanQuyen'; 
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

interface Props {
    id: string; 
    title?: string; 
    config: ModuleConfig; 
    onSaveConfig: (cfg: ModuleConfig) => void; 
    children: React.ReactNode; 
    lockPosition?: string; 
    itemOwnerId?: string;
    // 🟢 FIX 3: Thêm className để chỉnh layout
    className?: string; 
}

export default function Secured({ 
    id, title = 'Chức năng', config, onSaveConfig, children, 
    lockPosition = 'absolute -top-2 -right-2', itemOwnerId,
    className = 'w-full h-full' // Mặc định full để không vỡ Grid
}: Props) {
    const { isAdmin, check, openConfig } = useSecurity();
    const hasPermission = check(id, config, itemOwnerId);

    if (!hasPermission && !isAdmin) return null;

    if (isAdmin) {
        return (
            // 🟢 FIX 4: Áp dụng className vào div bao ngoài
            <div className={`relative group/secure ${className}`}>
                <div className={!hasPermission ? "opacity-50 grayscale h-full" : "h-full"}>
                    {children}
                </div>

                <div 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openConfig(id, title, config, onSaveConfig);
                    }}
                    className={`
                        ${lockPosition} z-[9999] cursor-pointer
                        w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center
                        shadow-[0_0_8px_rgba(220,38,38,0.8)] border-2 border-white
                        transition-transform hover:scale-125 hover:bg-red-700
                    `}
                    title="Bấm để phân quyền"
                >
                    <Lock size={12} strokeWidth={3} />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}