'use client';
import React from 'react';
import { Home, LayoutGrid, Bell, User, Settings, LogOut, MessageSquare } from 'lucide-react';

export default function Sidebar() {
    // hidden md:flex nghĩa là: Ẩn ở Mobile, Hiện Flex ở Tablet trở lên
    return (
        <div className="hidden md:flex flex-col h-full bg-[#1A1A1A] border-r border-white/10 w-[80px] lg:w-[240px] transition-all duration-300 shrink-0 z-40">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-900/20">
                    A<span className="lg:hidden">S</span>
                </div>
                <span className="hidden lg:block ml-3 font-bold text-xl tracking-tighter text-white">ArtSpace</span>
            </div>

            {/* Menu */}
            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
                <NavItem icon={<Home size={22}/>} label="Trang chủ" active />
                <NavItem icon={<LayoutGrid size={22}/>} label="Modules" />
                <NavItem icon={<MessageSquare size={22}/>} label="Tin nhắn" badge={3} />
                <NavItem icon={<Bell size={22}/>} label="Thông báo" />
                <NavItem icon={<User size={22}/>} label="Nhân sự" />
                <div className="my-auto"></div>
                <NavItem icon={<Settings size={22}/>} label="Cài đặt" />
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-all">
                    <LogOut size={22} />
                    <span className="hidden lg:block text-sm font-bold">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}

const NavItem = ({ icon, label, active, badge }: any) => (
    <button className={`
        flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all group relative
        ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
    `}>
        {icon}
        <span className="hidden lg:block text-sm font-bold">{label}</span>
        {badge && (
            <span className="absolute top-2 right-2 lg:top-3 lg:right-3 w-2.5 h-2.5 lg:w-5 lg:h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-[#1A1A1A]">
                <span className="hidden lg:inline">{badge}</span>
            </span>
        )}
    </button>
);