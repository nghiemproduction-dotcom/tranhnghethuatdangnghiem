'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import Module Giao diện
import HieuUngNen from '@/app/GiaoDienTong/HieuUngNen/HieuUngNen';
// 🟢 IMPORT LỚP PHỦ LAN MÀU
import LopPhuLanMau from '@/app/GiaoDienTong/HieuUngNen/LopPhuLanMau';
import MenuTren from '@/app/GiaoDienTong/MenuTren/MenuTren';
import MenuDuoi from '@/app/GiaoDienTong/MenuDuoi/MenuDuoi';

// 🟢 IMPORT NHẠC NỀN
import NhacNen from '@/app/Music/NhacNen';

export default function TrangChuPage() {
    const router = useRouter();
    const [nguoiDung, setNguoiDung] = useState<any>(null);
    const [loiChao, setLoiChao] = useState('Chào bạn');

    useEffect(() => {
        // 1. Check Login
        const storedUser = localStorage.getItem('USER_INFO');
        if (storedUser) {
            try {
                setNguoiDung(JSON.parse(storedUser));
            } catch (e) { console.error(e); }
        } else {
            router.push('/');
        }

        // 2. Lời chào thời gian
        const h = new Date().getHours();
        if (h >= 5 && h < 11) setLoiChao('Chào buổi sáng');
        else if (h >= 11 && h < 14) setLoiChao('Chào buổi trưa');
        else if (h >= 14 && h < 18) setLoiChao('Chào buổi chiều');
        else setLoiChao('Chào buổi tối');

    }, [router]);

    if (!nguoiDung) return null;

    return (
        <div className="fixed inset-0 w-full h-[100dvh] bg-[#050505] text-[#F5F5F5] font-sans overflow-hidden">
            
            {/* 1. ÂM THANH & LOGIC */}
            <NhacNen />

            {/* 2. LỚP HÌNH NỀN & HIỆU ỨNG (Z-Index thấp nhất) */}
            <HieuUngNen />

            {/* 🟢 3. LỚP PHỦ LAN MÀU (Z-Index 8000) */}
            {/* Phủ sát mép trên và dưới, tạo nền tối cho Menu trong suốt */}
            <LopPhuLanMau />

            {/* 🟢 4. MENU TRÊN (Z-Index: 9999 - CAO NHẤT) */}
            <div className="fixed top-0 left-0 right-0 z-[9999]">
                <MenuTren nguoiDung={nguoiDung} loiChao={loiChao} />
            </div>

            {/* 🟢 5. MENU DƯỚI (Z-Index: 9999 - CAO NHẤT) */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999]">
                <MenuDuoi currentUser={nguoiDung} />
            </div>

            {/* CSS Ẩn thanh cuộn cho đẹp */}
            <style jsx global>{`
                .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
                .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
                
                @keyframes slide-down { 0% { transform: translateY(-20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }

                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
}