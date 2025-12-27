'use client';
import React, { createContext, useContext } from 'react';
import { CotHienThi, ModuleConfig } from '../../../DashboardBuilder/KieuDuLieuModule';

// Định nghĩa tất cả những gì các component con có thể xài ké
interface Level3ContextType {
    config: ModuleConfig;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    isArranging: boolean;
    dynamicOptions: Record<string, string[]>;
    
    // Các hàm xử lý logic
    onAddNewOption: (key: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImg: boolean;
    
    // Logic quyền hạn
    canEditColumn: (col: CotHienThi) => boolean;
    userRole: string;
    isOwner: boolean;
    
    // Logic cập nhật giao diện
    onUpdateColumnOrder: (cols: CotHienThi[]) => void;
}

const Level3Context = createContext<Level3ContextType | undefined>(undefined);

// Hook để các con gọi dữ liệu nhanh: const { formData } = useLevel3Context();
export const useLevel3Context = () => {
    const context = useContext(Level3Context);
    if (!context) {
        throw new Error('useLevel3Context phải được dùng bên trong Level3Provider');
    }
    return context;
};

export const Level3Provider = ({ children, value }: { children: React.ReactNode, value: Level3ContextType }) => {
    return <Level3Context.Provider value={value}>{children}</Level3Context.Provider>;
};