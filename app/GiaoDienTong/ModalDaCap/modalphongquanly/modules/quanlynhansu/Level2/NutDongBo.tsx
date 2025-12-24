'use client';
import React, { useState, useEffect } from 'react';
import { UserCog, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

// 🟢 1. IMPORT HÀM KIỂM TRA QUYỀN TỪ DULIEU.TS
import { kiemTraQuyen } from '@/app/GiaoDienTong/MenuDuoi/DuLieu';

interface Props {
    config: ModuleConfig;
    onSuccess: () => void;
}

export default function NutDongBo({ config, onSuccess }: Props) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // 🟢 2. KIỂM TRA QUYỀN NGAY KHI COMPONENT ĐƯỢC VẼ RA
    useEffect(() => {
        // Lấy role từ LocalStorage (Nơi lưu phiên đăng nhập)
        const roleHienTai = localStorage.getItem('USER_ROLE') || localStorage.getItem('user_role') || 'khach';
        
        // Tạo một đối tượng người dùng giả lập để hàm kiemTraQuyen hiểu
        const giaLapNguoiDung = { role: roleHienTai };

        // Kiểm tra xem có phải Admin không
        const coQuyen = kiemTraQuyen(giaLapNguoiDung, ['admin', 'boss']);
        setIsAdmin(coQuyen);
    }, []);

    // Logic xử lý đồng bộ (Giữ nguyên)
    const handleStrictSync = async () => {
        const confirmMsg = 
            "⚠️ CẢNH BÁO ĐỒNG BỘ USER ⚠️\n\n" +
            "1. Cập nhật Login cho nhân sự hiện có.\n" +
            "2. XÓA VĨNH VIỄN user không có trong bảng Nhân Sự.\n\n" +
            "Bạn có chắc chắn muốn tiếp tục?";

        if (!confirm(confirmMsg)) return;
        
        setIsSyncing(true);
        try {
            const { data, error } = await supabase.rpc('admin_sync_strict_one_to_one');
            if (error) throw error;

            const result = data as { deleted: number, updated: number };
            alert(`✅ ĐÃ XONG!\n- Cập nhật: ${result.updated}\n- Đã xóa: ${result.deleted}`);
            onSuccess(); 
        } catch (err: any) {
            console.error("Sync Error:", err);
            alert("Lỗi: " + (err.message || "Lỗi kết nối"));
        } finally {
            setIsSyncing(false);
        }
    };

    // Chỉ hiện ở module nhân sự
    if (config.bangDuLieu !== 'nhan_su') return null;

    // 🟢 3. NẾU KHÔNG PHẢI ADMIN -> ẨN LUÔN (RETURN NULL)
    if (!isAdmin) return null;

    return (
        <div className="relative group mb-3"> 
            <button 
                onClick={handleStrictSync}
                disabled={isSyncing}
                className={`
                    w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border
                    ${isSyncing 
                        ? 'bg-[#1a120f] border-[#C69C6D] cursor-wait' 
                        : 'bg-[#1a120f] border-red-500 text-red-500 hover:bg-red-600 hover:text-white hover:scale-110'
                    }
                `}
            >
                {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <UserCog size={22} />}
            </button>
            
            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1a120f] text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40">
                Đồng bộ User
            </span>
        </div>
    );
}