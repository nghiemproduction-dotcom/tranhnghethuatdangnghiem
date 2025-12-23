'use client';
import React from 'react';
import { Save, X, Edit, Trash2, RotateCcw, Database } from 'lucide-react';
import NutModal, { TacVuModal } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

interface Props {
    isCreateMode: boolean;
    isEditing: boolean;
    loading: boolean;
    canEditRecord: boolean; // Có quyền sửa bản ghi này không?
    isAdmin: boolean;       // Có phải Admin không?
    hasError: boolean;      // Có lỗi không? (để hiện nút Fix DB)
    
    // Các hành động
    onSave: () => void;
    onEdit: () => void;
    onCancel: () => void;
    onDelete: () => void;
    onClose: () => void;
    onFixDB: () => void;    // Hành động sửa lỗi SQL
}

export default function NutChucNangLevel3({ 
    isCreateMode, isEditing, loading, canEditRecord, isAdmin, hasError,
    onSave, onEdit, onCancel, onDelete, onClose, onFixDB
}: Props) {

    const danhSachTacVu: TacVuModal[] = [
        // 1. Nhóm nút khi ĐANG CHỈNH SỬA / THÊM MỚI
        ...(isEditing ? [
            {
                id: 'save',
                icon: Save,
                nhan: loading ? 'Đang Lưu...' : 'Lưu Dữ Liệu',
                mauSac: 'text-[#1a120f] bg-[#C69C6D] border-[#C69C6D] hover:bg-[#F5E6D3] hover:text-[#C69C6D]', // Màu vàng nổi bật
                onClick: onSave
            },
            {
                id: 'cancel',
                icon: RotateCcw,
                nhan: 'Hủy Bỏ',
                onClick: onCancel
            }
        ] : []),

        // 2. Nhóm nút khi ĐANG XEM (View Mode)
        ...(!isEditing && canEditRecord ? [
            {
                id: 'edit',
                icon: Edit,
                nhan: 'Chỉnh Sửa',
                mauSac: 'text-[#C69C6D] border-[#C69C6D] hover:bg-[#C69C6D] hover:text-[#1a120f]',
                onClick: onEdit
            }
        ] : []),

        // 3. Nút Xóa (Chỉ hiện khi đang xem và không phải mode thêm mới)
        ...(!isEditing && !isCreateMode && (isAdmin || canEditRecord) ? [
            {
                id: 'delete',
                icon: Trash2,
                nhan: 'Xóa Hồ Sơ',
                mauSac: 'text-red-500 border-red-500 hover:bg-red-500 hover:text-white',
                onClick: onDelete
            }
        ] : []),

        // 4. Nút Sửa Lỗi Database (Chỉ Admin thấy khi có lỗi)
        ...(isAdmin && hasError ? [
            {
                id: 'fix_db',
                icon: Database,
                nhan: 'Sửa Lỗi DB',
                mauSac: 'text-red-400 border-red-400 animate-pulse hover:bg-red-500 hover:text-white',
                onClick: onFixDB
            }
        ] : []),

        // 5. Nút Đóng (Luôn hiện)
        {
            id: 'close',
            icon: X,
            nhan: 'Đóng',
            mauSac: 'text-gray-500 border-gray-500 hover:bg-gray-500 hover:text-white',
            onClick: onClose
        }
    ];

    return <NutModal danhSachTacVu={danhSachTacVu} />;
}