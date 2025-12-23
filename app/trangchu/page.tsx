'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, ArrowDown } from 'lucide-react';

// Import MenuDuoi
import MenuDuoi from '@/app/GiaoDienTong/MenuDuoi/MenuDuoi';

export default function TrangChuPage() {
    const router = useRouter();
    const [nguoiDung, setNguoiDung] = useState<any>(null);

    useEffect(() => {
        // 1. Lấy thông tin người dùng đã lưu khi đăng nhập
        const storedUser = localStorage.getItem('USER_INFO');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setNguoiDung(parsedUser);
            } catch (e) {
                console.error("Lỗi đọc dữ liệu người dùng", e);
            }
        } else {
            // Nếu chưa đăng nhập mà cố vào trang này -> đá về trang login
            router.push('/');
        }
    }, [router]);

    if (!nguoiDung) return null; // Hoặc hiện loading spinner

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-[#0a0807] text-[#F5F5F5] overflow-hidden flex flex-col font-sans">
            
            {/* --- PHẦN NỀN TRANG TRÍ --- */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                 <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[100px]" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[80px]" />
            </div>

            {/* --- PHẦN NỘI DUNG CHÍNH (Cuộn được) --- */}
            {/* pb-[100px] để nội dung không bị MenuDuoi che mất */}
            <div className="relative z-10 flex-1 w-full overflow-y-auto custom-scrollbar p-6 pb-[100px] flex flex-col items-center justify-center text-center">
                
                {/* Avatar & Lời chào */}
                <div className="mb-8 animate-fade-in-up">
                    <div className="w-24 h-24 mx-auto rounded-full border-2 border-yellow-500/30 p-1 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        {nguoiDung.avatar_url ? (
                            <img src={nguoiDung.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-yellow-500">
                                <User size={40} />
                            </div>
                        )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                        Xin chào, <span className="font-bold text-yellow-500">{nguoiDung.ho_ten}</span>
                    </h1>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                        <MapPin size={14} className="text-yellow-500" />
                        <span className="uppercase tracking-wider font-bold text-xs">{nguoiDung.vi_tri || 'Thành viên'}</span>
                    </div>
                </div>

                {/* Hướng dẫn sử dụng */}
                <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm animate-fade-in-up delay-100">
                    <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wide border-b border-white/10 pb-2">
                        Hướng dẫn nhanh
                    </h3>
                    
                    <ul className="text-left space-y-4 text-sm text-gray-400">
                        <li className="flex gap-3">
                            <span className="flex-none w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs">1</span>
                            <span>
                                Bấm vào nút <strong className="text-white">Phòng Ban</strong> ở thanh menu bên dưới để truy cập vào khu vực làm việc của bạn.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-none w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">2</span>
                            <span>
                                Hệ thống sẽ tự động mở đúng phòng ban phù hợp với chức vụ <strong className="text-white">{nguoiDung.vi_tri}</strong> của bạn.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-none w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">3</span>
                            <span>
                                Bấm <strong className="text-white">Cá Nhân</strong> để xem và chỉnh sửa hồ sơ tài khoản.
                            </span>
                        </li>
                    </ul>

                    {/* Mũi tên chỉ xuống */}
                    <div className="mt-6 flex justify-center animate-bounce text-yellow-500/50">
                        <ArrowDown size={24} />
                    </div>
                </div>

                {/* Khu vực Video/Quảng cáo (Placeholder) */}
                <div className="mt-8 w-full max-w-2xl h-40 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-600 text-xs uppercase tracking-widest">
                    [Khu vực dành cho Video Giới thiệu & Thông báo]
                </div>

            </div>

            {/* --- MENU DƯỚI (QUAN TRỌNG NHẤT) --- */}
            <div className="absolute bottom-0 left-0 right-0 z-[3000]">
                <MenuDuoi currentUser={nguoiDung} />
            </div>

            <style jsx global>{`
                @keyframes fade-in-up { 
                    0% { opacity: 0; transform: translateY(20px); } 
                    100% { opacity: 1; transform: translateY(0); } 
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .delay-100 { animation-delay: 0.1s; }
            `}</style>
        </div>
    );
}