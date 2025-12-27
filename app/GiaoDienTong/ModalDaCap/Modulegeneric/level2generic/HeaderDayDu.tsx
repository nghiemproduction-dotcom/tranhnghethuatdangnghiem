import React from 'react';
import { Layers, Filter } from 'lucide-react';
import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import ThanhTab, { TabItem } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhTab';

interface Props {
    moduleName: string;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabOptions: string[];
}

export default function HeaderDayDu({ moduleName, onClose, activeTab, onTabChange, tabOptions }: Props) {
    const tabList: TabItem[] = [
        { id: 'ALL', label: 'TẤT CẢ', icon: Layers },
        ...tabOptions.map(opt => ({ 
            id: opt, 
            label: opt ? String(opt).replace(/_/g, ' ').toUpperCase() : 'KHÁC', 
            icon: Filter 
        }))
    ];

    return (
        <div className="shrink-0 z-50 bg-[#0a0807] border-b border-[#8B5E3C]/30 shadow-lg flex flex-col">
            <ThanhDieuHuong danhSachCap={[
                { id: 'back', ten: 'Quay Lại', onClick: onClose }, 
                { id: 'current', ten: moduleName.toUpperCase() }
            ]} />
            <div className="flex items-center justify-between pr-2 bg-[#0a0807] py-1">
                <div className="flex-1 overflow-hidden">
                    <ThanhTab danhSachTab={tabList} tabHienTai={activeTab} onChuyenTab={onTabChange} />
                </div>
            </div>
        </div>
    );
}