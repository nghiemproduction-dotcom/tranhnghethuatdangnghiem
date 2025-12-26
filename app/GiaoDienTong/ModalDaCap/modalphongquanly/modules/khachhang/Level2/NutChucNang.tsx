'use client';
import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, X, Settings, LayoutGrid, List } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import NutDongBo from './NutDongBo'; 
import { useNutTimKiem } from './NutTimKiem';

// 🟢 1. IMPORT HÀM TỪ DULIEU.TS, BỎ HE_THONG_PHAN_QUYEN
import { kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

interface TacVuButton { id: string; icon: any; nhan: string; onClick: () => void; mauSac?: string; }
interface Props { config: ModuleConfig; canAdd: boolean; canConfig: boolean; viewMode: 'table' | 'card'; onToggleView: () => void; onAdd: () => void; onRefresh: () => void; onClose: () => void; onSearchData: (keyword: string) => void; currentSearch: string; onSaveConfig: (newConfig: ModuleConfig) => void; }

export default function NutChucNang({ 
    config, canAdd, canConfig, viewMode, onToggleView, onAdd, onRefresh, onClose, onSearchData, currentSearch, onSaveConfig
}: Props) {

    const nutTimKiem = useNutTimKiem({ onSearch: onSearchData, currentSearch });
    
    // 🟢 2. STATE ĐỂ BIẾT CÓ PHẢI ADMIN KHÔNG
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Lấy quyền từ LocalStorage (Cách nhanh nhất, không cần truyền props)
        const role = localStorage.getItem('USER_ROLE') || 'khach';
        const checkAdmin = kiemTraQuyen({ role: role }, ['admin', 'boss']);
        setIsAdmin(checkAdmin);
    }, []);

    const danhSachTacVu: (TacVuButton | null)[] = [
        canAdd ? { id: 'add', icon: Plus, nhan: 'Thêm Mới', mauSac: 'text-green-500 border-green-500 hover:bg-green-500 hover:text-white', onClick: onAdd } : null,
        { id: 'viewMode', icon: viewMode === 'card' ? List : LayoutGrid, nhan: viewMode === 'card' ? 'Xem Bảng' : 'Xem Thẻ', onClick: onToggleView, mauSac: 'text-[#C69C6D] border-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]' },
        nutTimKiem.button ? { id: nutTimKiem.button.id, icon: nutTimKiem.button.icon, nhan: nutTimKiem.button.nhan, onClick: nutTimKiem.button.onClick, mauSac: nutTimKiem.button.mauSac } : null,
        { id: 'refresh', icon: RefreshCw, nhan: 'Làm Mới', onClick: onRefresh },
        
        // 🟢 3. CHỈ HIỆN NÚT PHÂN QUYỀN NẾU LÀ ADMIN (Dùng biến isAdmin từ LocalStorage)
        (isAdmin && canConfig) ? { id: 'security_config', icon: Settings, nhan: 'Cấu hình cột', onClick: () => alert('Chức năng phân quyền cột đang được bảo trì') } : null,
        
        { id: 'close', icon: X, nhan: 'Đóng', mauSac: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white', onClick: onClose }
    ];

    const validTasks = danhSachTacVu.filter((item): item is TacVuButton => item !== null);

    return (
        <div className="fixed bottom-24 right-4 flex flex-col items-end gap-4 z-[2500] pointer-events-none">
            
            <div className="pointer-events-auto relative group flex items-center justify-end z-50">
                {/* Nút đồng bộ đã tự xử lý ẩn hiện bên trong nó rồi */}
                <NutDongBo config={config} onSuccess={onRefresh} />
            </div>

            {validTasks.map((tacVu) => {
                return (
                    <div key={tacVu.id} className="pointer-events-auto relative group/secure flex items-center justify-end z-40">
                        <span className="absolute right-full mr-3 px-2 py-1 bg-[#1a120f] text-[#C69C6D] text-[10px] font-bold uppercase rounded border border-[#8B5E3C]/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {tacVu.nhan}
                        </span>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); tacVu.onClick(); }} 
                            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border hover:scale-110 active:scale-95 
                                ${tacVu.mauSac || 'bg-[#1a120f] border-[#8B5E3C] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]'}
                            `}
                        >
                            {React.createElement(tacVu.icon, { size: 20 })}
                        </button>
                    </div>
                );
            })}
            
            <div className="pointer-events-auto">{nutTimKiem.modal}</div>
        </div>
    );
}