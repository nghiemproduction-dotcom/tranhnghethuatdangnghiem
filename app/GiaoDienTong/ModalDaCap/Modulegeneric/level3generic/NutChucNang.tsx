'use client';
import React from 'react';
import { Save, Edit, Trash2, RotateCcw, LayoutDashboard, Check, ArrowLeft, LogOut } from 'lucide-react'; 
import NutModal, { TacVuModal } from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

export interface NutChucNangLevel3Props {
    isCreateMode: boolean;
    isEditing: boolean;
    isArranging: boolean;
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
    
    onToggleArrange: () => void; 
    onSaveLayout: () => void;
    onLogout?: () => void; 
}

export default function NutChucNangLevel3({ 
    isCreateMode, isEditing, isArranging, loading, canEditRecord, canDeleteRecord, isAdmin, hasError,
    onSave, onEdit, onCancel, onDelete, onClose, onFixDB, onToggleArrange, onSaveLayout, onLogout
}: NutChucNangLevel3Props) {

    // 🟢 Lưu ý chung về Style mới:
    // - Đã thêm background (bg-...) cho TẤT CẢ các nút để đảm bảo độ "đục".
    // - Các nút phụ (Hủy, Quay lại) giờ dùng bg-[#2A201C] (nâu đen đậm) thay vì transparent.

    const danhSachTacVu: (TacVuModal | null)[] = [
        
        // A. KHI ĐANG SẮP XẾP GIAO DIỆN
        ...(isArranging ? [
            {
                id: 'save_layout',
                icon: Check,
                nhan: loading ? 'Đang Lưu...' : 'Lưu',
                // Nút chính: Vàng đất
                mauSac: 'bg-[#C69C6D] text-[#1a120f] border-[#C69C6D] hover:bg-[#F5E6D3]',
                onClick: onSaveLayout
            },
            {
                id: 'cancel_arrange',
                icon: RotateCcw,
                nhan: 'Hủy',
                // Nút phụ: Nền đen nâu (Đục), chữ xám
                mauSac: 'bg-[#2A201C] text-gray-400 border-[#3E3228] hover:bg-gray-700 hover:text-white',
                onClick: onToggleArrange
            }
        ] : []),

        // B. KHI ĐANG NHẬP LIỆU / SỬA
        ...(!isArranging && isEditing ? [
            {
                id: 'save',
                icon: Save,
                nhan: loading ? 'Lưu...' : 'Lưu',
                // Nút chính: Vàng đất
                mauSac: 'bg-[#C69C6D] text-[#1a120f] border-[#C69C6D] hover:bg-[#F5E6D3]',
                onClick: onSave
            },
            {
                id: 'cancel',
                icon: RotateCcw,
                nhan: 'Hủy',
                // Nút phụ: Nền đen nâu (Đục)
                mauSac: 'bg-[#2A201C] text-gray-400 border-[#3E3228] hover:bg-gray-700 hover:text-white',
                onClick: onCancel
            }
        ] : []),

        // C. KHI ĐANG XEM (VIEW MODE)
        ...(!isArranging && !isEditing ? [
            // 1. Nút Đăng Xuất
            (onLogout ? {
                id: 'logout',
                icon: LogOut,
                nhan: 'Thoát',
                // Nút đỏ: Nền đỏ (Đục)
                mauSac: 'bg-[#4a1a1a] text-red-500 border-red-900/50 hover:bg-red-600 hover:text-white', 
                onClick: onLogout
            } : null),

            // 2. Nút Sửa
            (canEditRecord ? {
                id: 'edit',
                icon: Edit,
                nhan: 'Sửa',
                // Nút chức năng: Nền tối, icon vàng
                mauSac: 'bg-[#1a120f] text-[#C69C6D] border-[#8B5E3C] hover:bg-[#C69C6D] hover:text-[#1a120f]',
                onClick: onEdit
            } : null),

            // 3. Nút Xóa
            (canDeleteRecord ? {
                id: 'delete',
                icon: Trash2,
                nhan: 'Xóa',
                // Nút xóa: Nền tối, icon đỏ
                mauSac: 'bg-[#1a120f] text-red-500 border-red-900/50 hover:bg-red-600 hover:text-white',
                onClick: onDelete
            } : null),
            
            // 4. Nút Sắp Xếp (Admin)
            (isAdmin ? {
                id: 'arrange',
                icon: LayoutDashboard,
                nhan: 'Sắp Xếp',
                mauSac: 'bg-[#1a120f] text-[#8B5E3C] border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-[#1a120f]',
                onClick: onToggleArrange
            } : null),

            // 5. Nút Quay Lại
            {
                id: 'back',
                icon: ArrowLeft,
                nhan: 'Về',
                // Nút phụ: Nền đen nâu (Đục)
                mauSac: 'bg-[#2A201C] text-gray-400 border-[#3E3228] hover:bg-gray-700 hover:text-white',
                onClick: onClose 
            }
        ] : [])
    ];

    const validTasks = danhSachTacVu.filter((t): t is TacVuModal => t !== null);

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none pb-[env(safe-area-inset-bottom)]"> 
            <div className="w-full h-full relative">
                {/* Điều chỉnh vị trí container chứa nút - Tránh gradient MenuDuoi */}
                <div className="absolute bottom-0 right-0 pointer-events-auto transform -translate-y-28 md:-translate-y-16 pr-4">
                    <NutModal danhSachTacVu={validTasks} />
                </div>
            </div>
        </div>
    );
}