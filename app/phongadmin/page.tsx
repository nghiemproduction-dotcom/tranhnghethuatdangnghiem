'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { 
  Database, Settings, Activity, Users, Briefcase, 
  AlertTriangle, Loader2, ShoppingBag 
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';

// IMPORT PAGE VÀ COMPONENT
import DataCenter from './DataCenter';
import PhongQuanLy from '@/app/phongquanly/page';
import PhongPartTime from '@/app/phongparttime/page';

// --- CẤU HÌNH HỆ THỐNG ---
const SYSTEM_STRUCTURE = {
    admin: {
        label: 'Phòng Admin',
        functions: [
            { id: 'datacenter', label: 'Data Center', icon: Database },
            { id: 'settings', label: 'Cấu Hình Hệ Thống', icon: Settings },
        ]
    },
    quanly: {
        label: 'Phòng Quản Lý',
        functions: [
            { id: 'orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingBag },
            { id: 'hr', label: 'Quản Lý Nhân Sự', icon: Users }
        ]
    },
    parttime: {
        label: 'Phòng Part-time',
        functions: [
            { id: 'workplace', label: 'Bàn Làm Việc', icon: Briefcase }
        ]
    },
    sanxuat: { label: 'Phòng Sản Xuất', functions: [] },
    sales: { label: 'Phòng Sales', functions: [] },
};

type RoomKey = keyof typeof SYSTEM_STRUCTURE;

export default function PhongAdminPage() {
  const { user: contextUser, loading: contextLoading } = useUser();
  const [authLoading, setAuthLoading] = useState(true);
  
  // STATE QUẢN LÝ UI
  const [activeRoom, setActiveRoom] = useState<RoomKey>('admin');
  const [activeFunction, setActiveFunction] = useState<string>('datacenter');

  // Auth logic
  useEffect(() => {
    if (contextLoading) return;
    if (contextUser) { setAuthLoading(false); return; }
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') : null;
    if (userInfo) {
      try { JSON.parse(userInfo); setAuthLoading(false); } 
      catch (e) { setAuthLoading(false); }
    } else { setAuthLoading(false); }
  }, [contextUser, contextLoading]);

  // Tab change handler
  const handleRoomChange = (roomKey: RoomKey) => {
      setActiveRoom(roomKey);
      const firstFunc = SYSTEM_STRUCTURE[roomKey].functions[0];
      setActiveFunction(firstFunc ? firstFunc.id : '');
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div>;
  const displayUser = contextUser || JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') || '{}' : '{}');

  return (
    <KhungTrangChuan 
        nguoiDung={displayUser} 
        loiChao="Administrator Console" 
        contentClassName="flex flex-col h-screen pt-[85px] pb-0 px-0 overflow-hidden bg-[#050505]"
    >
      
      {/* 1. HEADER CONTROLS (Unified) */}
      <div className="flex-none z-40 w-full flex flex-col bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all">
          
          {/* CẤP 1: THANH TAB PHÒNG */}
          <div className="w-full flex items-center justify-center gap-2 py-3 border-b border-white/5 overflow-x-auto scrollbar-hide px-4">
             {Object.entries(SYSTEM_STRUCTURE).map(([key, room]) => {
              const isActive = key === activeRoom;
              const isAvailable = room.functions.length > 0 || key === 'admin'; 
              
              if (!isAvailable && key !== 'admin') return null;

              return (
                <button
                  key={key}
                  onClick={() => handleRoomChange(key as RoomKey)}
                  className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all py-2 px-6 rounded-full relative
                    ${isActive 
                        ? 'bg-[#C69C6D] text-black shadow-[0_0_20px_rgba(198,156,109,0.4)] scale-105' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {room.label}
                </button>
              );
            })}
          </div>

          {/* CẤP 2: THANH CHỨC NĂNG */}
          <div className="w-full flex items-center justify-center gap-3 py-3 overflow-x-auto scrollbar-hide px-4 min-h-[50px]">
            {SYSTEM_STRUCTURE[activeRoom].functions.map((func) => {
                const Icon = func.icon;
                const isActive = func.id === activeFunction;
                return (
                    <button 
                        key={func.id}
                        onClick={() => setActiveFunction(func.id)}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all border
                            ${isActive 
                                ? 'text-[#C69C6D] bg-[#C69C6D]/10 border-[#C69C6D]/30 shadow-[0_0_10px_rgba(198,156,109,0.15)]' 
                                : 'text-white/40 hover:text-white hover:bg-white/5 border-transparent'
                            }
                        `}
                    >
                        <Icon size={14} />
                        {func.label}
                    </button>
                )
            })}
            {SYSTEM_STRUCTURE[activeRoom].functions.length === 0 && (
                <span className="text-white/30 text-xs italic px-4 flex items-center gap-2 opacity-50">
                    <AlertTriangle size={12}/> Đang phát triển...
                </span>
            )}
         </div>
      </div>

      {/* 2. KHUNG CHỨA NỘI DUNG */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#050505]">
            <div className="absolute inset-0 p-4">
                <div className="w-full h-full bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-[0.99] duration-300">
                    
                    {/* --- A. PHÒNG ADMIN --- */}
                    {activeRoom === 'admin' && (
                        <>
                            {activeFunction === 'datacenter' && <DataCenter />}
                            {activeFunction === 'settings' && (
                                <div className="w-full h-full flex items-center justify-center flex-col text-white/30">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/5">
                                        <Settings size={48} className="opacity-50 text-[#C69C6D]"/>
                                    </div>
                                    <h3 className="text-xl font-serif text-white/40 mb-2">Cấu Hình Hệ Thống</h3>
                                    <p className="text-sm text-white/30">Chức năng đang được cập nhật</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- B. PHÒNG QUẢN LÝ --- */}
                    {activeRoom === 'quanly' && (
                        <PhongQuanLy 
                            isChildComponent={true} 
                            externalActiveTab={activeFunction} 
                        />
                    )}

                    {/* --- C. PHÒNG PART-TIME --- */}
                    {activeRoom === 'parttime' && activeFunction === 'workplace' && (
                        <PhongPartTime isChildComponent={true} />
                    )}

                    {/* DEFAULT: CHƯA PHÁT TRIỂN */}
                    {!['datacenter', 'settings', 'orders', 'hr', 'workplace'].includes(activeFunction) && (
                        <div className="w-full h-full flex items-center justify-center flex-col text-white/30">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 border-dashed">
                                <Settings size={32} className="opacity-50"/>
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-1">Chức năng đang phát triển</h3>
                            <p className="text-xs font-mono opacity-60">Module: {activeRoom.toUpperCase()} / {activeFunction.toUpperCase()}</p>
                        </div>
                    )}

                </div>
            </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; border: 1px solid #0a0a0a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C69C6D; }
        .custom-scrollbar::-webkit-scrollbar-corner { background: #0a0a0a; }
      `}</style>
    </KhungTrangChuan>
  );
}