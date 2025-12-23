'use client';
import React, { useState } from 'react';
import { UserCog, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

// 🟢 1. IMPORT CÁI KHÓA BẢO MẬT
import Secured from '@/app/components/Secured'; 

interface Props {
    config: ModuleConfig;
    onSuccess: () => void;
}

// 🟢 2. CHUYỂN VỀ DẠNG COMPONENT ĐỂ HIỂN THỊ GIAO DIỆN TRỰC TIẾP
export default function NutDongBo({ config, onSuccess }: Props) {
    const [isSyncing, setIsSyncing] = useState(false);

    // Logic xử lý đồng bộ
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

    // Chỉ hiện nút này nếu đang ở module nhân sự (Logic nghiệp vụ cơ bản)
    // Còn logic Admin/Khách sẽ do thằng Secured lo
    if (config.bangDuLieu !== 'nhan_su') return null;

    // 🟢 3. BỌC CÁI KHÓA VÀO NÚT
    return (
        <Secured 
            id="btn_dong_bo_user" // ID định danh để lưu vào database
            title="Nút Đồng Bộ User" // Tên hiển thị khi Admin cấu hình
            config={config}
            onSaveConfig={() => {}} // Hàm save này Secured tự xử lý qua Context rồi, để trống cũng được hoặc truyền từ cha
            
            lockPosition="absolute -top-1 -right-1" // Chỉnh vị trí khóa cho đẹp
        >
            <div className="relative group mb-3"> {/* Thêm mb-3 để tách dòng với các nút khác */}
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
        </Secured>
    );
}