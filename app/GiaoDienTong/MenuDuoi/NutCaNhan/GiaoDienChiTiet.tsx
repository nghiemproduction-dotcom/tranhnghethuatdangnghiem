'use client';
import React from 'react';
import { User, LogOut, Mail, Hash, KeyRound, Smartphone } from 'lucide-react';
import { xuLyDangXuat } from './ChucNang';

interface Props {
    nguoiDung: any;
}

export default function GiaoDienChiTiet({ nguoiDung }: Props) {
    // Chuẩn hóa dữ liệu
    const hoTen = nguoiDung?.ho_ten || 'Khách vãng lai';
    const viTri = nguoiDung?.vi_tri || 'Chưa xác định';
    const email = nguoiDung?.email || 'Chưa cập nhật';
    const role = nguoiDung?.role || 'khach';
    const avatar = nguoiDung?.avatar_url;
    const userId = nguoiDung?.id || 'N/A';

    return (
        <div className="max-w-md mx-auto w-full space-y-6 pt-4 pb-6">
            
            {/* 1. CARD AVATAR & INFO CHÍNH */}
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-[#8B5E3C] to-[#C69C6D] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
                
                <div className="relative bg-[#1a120f] border border-[#8B5E3C]/40 rounded-2xl p-6 flex flex-col items-center shadow-2xl overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#C69C6D_5px,#C69C6D_6px)]"></div>
                    
                    {/* Avatar */}
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-[#C69C6D] p-1 mb-4 relative z-10 shadow-[0_0_30px_rgba(198,156,109,0.2)] bg-[#110d0c]">
                        {avatar ? (
                            <img src={avatar} alt="Avt" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-[#2a1e1b] flex items-center justify-center text-[#C69C6D]">
                                <User className="w-14 h-14" strokeWidth={1.5} />
                            </div>
                        )}
                        {/* Role Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#C69C6D] text-[#1a120f] text-[10px] font-black px-2 py-1 rounded-md border border-[#1a120f] uppercase shadow-lg tracking-wider">
                            {role}
                        </div>
                    </div>

                    {/* Name & Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-[#F5E6D3] uppercase tracking-wide relative z-10 text-center">{hoTen}</h3>
                    <p className="text-xs text-[#8B5E3C] font-bold uppercase tracking-[0.2em] mt-1 relative z-10 opacity-80">{viTri}</p>
                </div>
            </div>

            {/* 2. CARD CHI TIẾT */}
            <div className="space-y-3">
                <div className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-4 flex items-start gap-4 hover:border-[#C69C6D]/50 transition-colors">
                    <div className="p-2 bg-[#C69C6D]/10 rounded-full text-[#C69C6D] shrink-0 mt-1">
                        <Hash size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Mã Định Danh (ID)</p>
                        <p className="text-sm text-gray-300 font-mono break-all leading-tight select-all">{userId}</p>
                    </div>
                </div>

                <div className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-4 flex items-start gap-4 hover:border-[#C69C6D]/50 transition-colors">
                    <div className="p-2 bg-[#C69C6D]/10 rounded-full text-[#C69C6D] shrink-0 mt-1">
                        <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Email Xác Thực</p>
                        <p className="text-sm text-gray-300 font-sans break-words leading-tight">{email}</p>
                    </div>
                </div>
            </div>

            {/* 3. QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center gap-2 bg-[#1a120f] border border-[#8B5E3C]/20 hover:bg-[#C69C6D]/10 hover:border-[#C69C6D] p-4 rounded-xl transition-all group">
                    <KeyRound size={20} className="text-[#8B5E3C] group-hover:text-[#C69C6D]"/>
                    <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-[#F5E6D3]">Đổi Mật Khẩu</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 bg-[#1a120f] border border-[#8B5E3C]/20 hover:bg-[#C69C6D]/10 hover:border-[#C69C6D] p-4 rounded-xl transition-all group">
                    <Smartphone size={20} className="text-[#8B5E3C] group-hover:text-[#C69C6D]"/>
                    <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-[#F5E6D3]">Thiết Bị</span>
                </button>
            </div>

            {/* 4. LOGOUT BUTTON */}
            <button 
                onClick={xuLyDangXuat} 
                className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-white text-sm font-bold uppercase tracking-[0.15em] px-6 py-4 border border-red-900/50 bg-red-950/20 hover:bg-red-600 rounded-xl transition-all shadow-lg active:scale-95 group mt-4"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Đăng Xuất Hệ Thống
            </button>

            <div className="text-center">
                <p className="text-[9px] text-[#5D4037] font-mono">Phiên bản hệ thống: 2.5.0 (Beta)</p>
            </div>
        </div>
    );
}