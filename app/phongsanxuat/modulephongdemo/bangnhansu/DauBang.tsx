'use client';
import React, { useState } from 'react';
import { Users, RefreshCw, X, Loader2, UserCog } from 'lucide-react';
import { syncAllUsers } from '@/app/phongdemo/modulephongdemo/bangnhansu/TaoUser'; // Gọi Server Action

interface Props {
    onClose: () => void;
    onRefresh: () => void;
}

export default function DauBang({ onClose, onRefresh }: Props) {
    const [dangDongBo, setDangDongBo] = useState(false);

    const xuLyDongBo = async () => {
        if(!confirm("Hệ thống sẽ tạo tài khoản đăng nhập cho tất cả nhân sự chưa có (dựa trên Email). Mật khẩu mặc định là Số điện thoại. Tiếp tục?")) return;

        setDangDongBo(true);
        try {
            const res = await syncAllUsers();
            let msg = `✅ Hoàn tất!\n- Đã tạo mới: ${res.count} tài khoản.`;
            if (res.errors.length > 0) msg += `\n⚠️ Lỗi: ${res.errors.length} trường hợp.`;
            if (res.count === 0 && res.errors.length === 0) msg = "Tất cả nhân sự đều đã có tài khoản!";
            alert(msg);
        } catch (e) {
            console.error(e);
            alert("Lỗi kết nối đến Server!");
        } finally {
            setDangDongBo(false);
        }
    };

    return (
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1C1C1E]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Users size={20} /></div>
                <div>
                    <h2 className="text-xl font-bold text-white">Quản Lý Nhân Sự</h2>
                    <p className="text-xs text-gray-400">Dữ liệu thời gian thực từ hệ thống</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={xuLyDongBo}
                    disabled={dangDongBo}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/10 text-green-400 hover:bg-green-600/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    title="Tạo tài khoản đăng nhập"
                >
                    {dangDongBo ? <Loader2 size={16} className="animate-spin"/> : <UserCog size={16} />}
                    {dangDongBo ? 'Đang xử lý...' : 'Cấp tài khoản'}
                </button>

                <button onClick={onRefresh} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Làm mới">
                    <RefreshCw size={20} />
                </button>
                
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors ml-2">
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}