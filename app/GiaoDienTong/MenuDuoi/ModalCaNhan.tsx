'use client';

import React from 'react';
import { User, LogOut, Shield, Mail, Hash } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
}

export default function ModalCaNhan({ isOpen, onClose, currentUser }: Props) {
    if (!isOpen) return null;

    const handleLogout = async () => {
        if (!confirm('Bạn có muốn đăng xuất khỏi hệ thống?')) return;
        localStorage.removeItem('USER_INFO');
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.removeItem('GLOBAL_FULLSCREEN_PREF'); 
        sessionStorage.clear();
        await supabase.auth.signOut();
        window.location.href = '/'; 
    };

    const hoTen = currentUser?.ho_ten || 'Khách vãng lai';
    const viTri = currentUser?.vi_tri || 'Chưa xác định';
    const email = currentUser?.email || 'Chưa cập nhật';
    const role = currentUser?.role || 'khach';
    const avatar = currentUser?.avatar_url;
    const userId = currentUser?.id?.substring(0, 8).toUpperCase() || 'N/A';

    // 🟢 Dynamic sizing classes
    const iconSizeClass = "w-[clamp(16px,4vw,20px)] h-[clamp(16px,4vw,20px)]";

    return (
        // Wrapper: bottom-[clamp(60px,15vw,80px)] để khớp với chiều cao MenuDuoi
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[980] flex flex-col bg-[#110d0c]/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 border-b border-[#8B5E3C]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
             
             <style jsx>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: #1a120f; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; }
                
                /* Responsive Text Classes */
                .text-resp-title { font-size: clamp(18px, 6vw, 28px); }
                .text-resp-base { font-size: clamp(14px, 4.5vw, 18px); }
                .text-resp-sm { font-size: clamp(12px, 3.5vw, 15px); }
                .text-resp-xs { font-size: clamp(10px, 3vw, 13px); }
            `}</style>

            {/* Header Modal - Chiều cao cũng co giãn nhẹ */}
            <div className="h-[clamp(60px,15vw,70px)] flex items-center justify-center border-b border-[#8B5E3C]/20 shrink-0 bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent">
                <h2 className="text-resp-title font-bold text-[#C69C6D] uppercase tracking-[0.2em] drop-shadow-md">Hồ Sơ Nhân Sự</h2>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 overflow-y-auto p-[4vw] flex flex-col items-center custom-scroll pb-6">
                
                {/* ID CARD: Width co giãn theo viewport */}
                <div className="w-full max-w-[min(400px,90vw)] relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#8B5E3C] to-[#C69C6D] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    
                    <div className="relative bg-[#1a120f] border border-[#8B5E3C]/40 rounded-2xl p-[clamp(1.5rem,5vw,2.5rem)] flex flex-col items-center shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#C69C6D_2px,#C69C6D_3px)]"></div>
                        
                        {/* Avatar Responsive */}
                        <div className="w-[clamp(80px,25vw,140px)] h-[clamp(80px,25vw,140px)] rounded-full border-2 border-[#C69C6D] p-1 mb-[2vh] relative z-10 shadow-[0_0_20px_rgba(198,156,109,0.3)] bg-[#110d0c]">
                            {avatar ? (
                                <img src={avatar} alt="Avt" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#2a1e1b] flex items-center justify-center text-[#C69C6D]">
                                    <User className="w-[50%] h-[50%]" strokeWidth={1.5} />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-[#C69C6D] text-[#1a120f] text-resp-xs font-black px-[2vw] py-[0.5vh] rounded-md border border-[#1a120f] uppercase shadow-lg">
                                {role}
                            </div>
                        </div>

                        <h3 className="text-resp-title font-bold text-[#F5E6D3] uppercase tracking-wide relative z-10 text-center leading-tight">{hoTen}</h3>
                        <p className="text-resp-sm text-[#8B5E3C] font-bold uppercase tracking-widest mt-1 mb-[3vh] relative z-10">{viTri}</p>

                        <div className="w-full space-y-[1.5vh] relative z-10">
                            <div className="flex items-center gap-[3vw] bg-[#110d0c]/50 p-[2vw] rounded-lg border border-white/5">
                                <div className="p-[1.5vw] bg-[#C69C6D]/10 rounded-full text-[#C69C6D]"><Hash className={iconSizeClass}/></div>
                                <div className="overflow-hidden">
                                    <p className="text-resp-xs text-gray-500 uppercase">Mã Định Danh</p>
                                    <p className="text-resp-base text-gray-300 font-mono truncate">{userId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-[3vw] bg-[#110d0c]/50 p-[2vw] rounded-lg border border-white/5">
                                <div className="p-[1.5vw] bg-[#C69C6D]/10 rounded-full text-[#C69C6D]"><Mail className={iconSizeClass}/></div>
                                <div className="overflow-hidden">
                                    <p className="text-resp-xs text-gray-500 uppercase">Email Xác Thực</p>
                                    <p className="text-resp-base text-gray-300 truncate">{email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nút chức năng */}
                <div className="w-full max-w-[min(400px,90vw)] mt-[3vh] space-y-3">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-200 text-resp-sm font-bold uppercase tracking-widest px-8 py-[2vh] border border-red-900/50 bg-red-900/10 hover:bg-red-900/30 rounded-xl transition-all shadow-lg active:scale-95 group"
                    >
                        <LogOut className={iconSizeClass} /> Đăng Xuất Hệ Thống
                    </button>
                </div>
            </div>
        </div>
    );
}