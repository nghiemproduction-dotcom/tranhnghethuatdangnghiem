'use client';
import React from 'react';
import { Save, Edit, Trash2, RotateCcw, LayoutDashboard, Check } from 'lucide-react';
import NutModal, { TacVuModal } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

export interface NutChucNangLevel3Props {
    isCreateMode: boolean;
    isEditing: boolean;
    isArranging: boolean; // 🟢 Mới: Chế độ sắp xếp
    loading: boolean;
    canEditRecord: boolean; 
    canDeleteRecord: boolean; 
    isAdmin: boolean;       
    hasError: boolean;      
    
    onSave: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onDelete: () => void;
    onClose: () => void;
    onFixDB: () => void;
    
    // 🟢 Mới: Hàm xử lý sắp xếp
    onToggleArrange: () => void; 
    onSaveLayout: () => void;
}

export default function NutChucNangLevel3({ 
    isCreateMode, isEditing, isArranging, loading, canEditRecord, canDeleteRecord, isAdmin, hasError,
    onSave, onEdit, onCancel, onDelete, onClose, onFixDB, onToggleArrange, onSaveLayout
}: NutChucNangLevel3Props) {

    const danhSachTacVu: (TacVuModal | null)[] = [
        
        // A. KHI ĐANG SẮP XẾP GIAO DIỆN (Ưu tiên cao nhất)
        ...(isArranging ? [
            {
                id: 'save_layout',
                icon: Check,
                nhan: loading ? 'Đang Lưu...' : 'Lưu Giao Diện',
                mauSac: 'text-[#1a120f] bg-[#C69C6D] border-[#C69C6D] hover:bg-[#F5E6D3] hover:text-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.4)]',
                onClick: onSaveLayout
            },
            {
                id: 'cancel_arrange',
                icon: RotateCcw,
                nhan: 'Hủy Sắp Xếp',
                mauSac: 'text-gray-400 border-gray-600 hover:text-white hover:border-white',
                onClick: onToggleArrange
            }
        ] : []),

        // B. KHI ĐANG NHẬP LIỆU / SỬA (Chỉ hiện khi ko sắp xếp)
        ...(!isArranging && isEditing ? [
            {
                id: 'save',
                icon: Save,
                nhan: loading ? 'Đang Lưu...' : 'Lưu Lại',
                mauSac: 'text-[#1a120f] bg-[#C69C6D] border-[#C69C6D] hover:bg-[#F5E6D3] hover:text-[#C69C6D] shadow-[0_0_15px_rgba(198,156,109,0.4)]',
                onClick: onSave
            },
            {
                id: 'cancel',
                icon: RotateCcw,
                nhan: 'Hủy Bỏ',
                mauSac: 'text-gray-400 border-gray-600 hover:text-white hover:border-white',
                onClick: onCancel
            }
        ] : []),

        // C. KHI ĐANG XEM (VIEW MODE)
        ...(!isArranging && !isEditing ? [
            // Nút Sửa
            (canEditRecord ? {
                id: 'edit',
                icon: Edit,
                nhan: 'Chỉnh Sửa',
                mauSac: 'text-[#C69C6D] border-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]',
                onClick: onEdit
            } : null),

            // Nút Xóa
            (canDeleteRecord ? {
                id: 'delete',
                icon: Trash2,
                nhan: 'Xóa',
                mauSac: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white',
                onClick: onDelete
            } : null),
            
            // 🟢 NÚT CHỈNH GIAO DIỆN (Chỉ Admin thấy)
            (isAdmin ? {
                id: 'arrange',
                icon: LayoutDashboard,
                nhan: 'Sắp Xếp Cột',
                mauSac: 'text-[#8B5E3C] border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-[#1a120f]',
                onClick: onToggleArrange
            } : null)
        ] : [])
    ];

    const validTasks = danhSachTacVu.filter((t): t is TacVuModal => t !== null);

    return <NutModal danhSachTacVu={validTasks} />;
}