'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';
import { 
    Search, Plus, QrCode, 
    MessageCircle, UsersRound, Compass, Clock, UserCircle, // Icon nghệ thuật hơn
    Settings, LogOut, Loader2, LayoutTemplate, 
    BellRing, Sparkles 
} from 'lucide-react';

import { ModalTaoModule } from './ModalTaoModule';
import { ModuleConfig } from './KieuDuLieuModule';

// 🟢 BẢNG MÀU DARK MODE HIỆN ĐẠI
const THEME = {
    bg_main: '#121212',       // Nền chính tối sâu
    bg_sidebar: '#1E1E1E',    // Nền sidebar sáng hơn chút
    border: 'rgba(255,255,255,0.08)', // Viền siêu mỏng
    active: '#0068FF',        // Xanh Zalo
    text_main: '#E4E6EB',
    text_sub: '#B0B3B8'
};

export default function BangChinh() {
  // --- STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbData, setDbData] = useState<{ [key: string]: any[] }>({ nhan_su: [], khach_hang: [], viec_mau: [] });
  const [items, setItems] = useState<{ [key: string]: string[] }>({});
  const [cauHinhHang, setCauHinhHang] = useState<any[]>([]);
  const [cauHinhModule, setCauHinhModule] = useState<{ [key: string]: { doRong: number } }>({});
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleConfig>>({});
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleConfig | undefined>(undefined);
  const [targetRowId, setTargetRowId] = useState<string | null>(null);
  
  // Tab mặc định
  const [activeTab, setActiveTab] = useState('message'); 
  const [currentUser, setCurrentUser] = useState<any>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // --- LOAD DATA ---
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };
    getUser();

    const checkQuyen = () => {
        if (typeof window === 'undefined') return false;
        const isHardAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        const role = localStorage.getItem('USER_ROLE');
        return isHardAdmin || role === 'admin'; 
    };
    setIsAdmin(checkQuyen());

    const fetchData = async () => {
        const { data: configData } = await supabase.from('cau_hinh_giao_dien').select('du_lieu').eq('id', 'layout_main').single();
        if (configData?.du_lieu) {
            const config = configData.du_lieu;
            setItems(config.items || {});
            setCauHinhHang(config.cauHinhHang || []);
            setCauHinhModule(config.cauHinhModule || {});
            setModuleConfigs(config.moduleConfigs || {});
        } else {
            const newId = `hang_${Date.now()}`;
            setItems({ [newId]: [] });
            setCauHinhHang([{ id: newId, soCot: 3, chieuCao: 400 }]);
        }
    };
    fetchData();
  }, []);

  // --- AUTO SAVE ---
  useEffect(() => { 
      if (!isAdmin || cauHinhHang.length === 0) return; 
      const timer = setTimeout(async () => { 
          setIsSaving(true); 
          await supabase.from('cau_hinh_giao_dien').upsert({ id: 'layout_main', du_lieu: { items, cauHinhHang, cauHinhModule, moduleConfigs } }); 
          setTimeout(() => setIsSaving(false), 500); 
      }, 1500); 
      return () => clearTimeout(timer); 
  }, [items, cauHinhHang, cauHinhModule, moduleConfigs, isAdmin]);

  // --- HANDLERS ---
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };
  const handleCreateModule = (config: ModuleConfig) => { setModuleConfigs(prev => ({ ...prev, [config.id]: config })); if (editingModule) { setShowAddModal(false); setEditingModule(undefined); return; } const destRow = targetRowId || cauHinhHang[0]?.id; if (destRow) { setItems(prev => ({ ...prev, [destRow]: [...(prev[destRow] || []), config.id] })); let defaultWidth = 1; if (config.viewType === 'kanban' || config.viewType.startsWith('button')) defaultWidth = 3; setCauHinhModule(prev => ({ ...prev, [config.id]: { doRong: defaultWidth } })); } else { const newRowId = `hang_${Date.now()}`; setCauHinhHang([{ id: newRowId, soCot: 3, chieuCao: 400 }]); setItems({ [newRowId]: [config.id] }); setCauHinhModule({ [config.id]: { doRong: 1 } }); } setShowAddModal(false); setTargetRowId(null); };
  const handleOpenAddModal = (rowId: string) => { setTargetRowId(rowId); setEditingModule(undefined); setShowAddModal(true); };
  const handleEditModule = (id: string, currentConfig: ModuleConfig) => { setEditingModule(currentConfig); setShowAddModal(true); };
  const xuLyThemHang = () => { const idMoi = `hang_${Date.now()}`; setCauHinhHang(prev => [...prev, { id: idMoi, soCot: 3, chieuCao: 250 }]); setItems(prev => ({ ...prev, [idMoi]: [] })); };
  const xuLyXoaHang = (idHang: string) => { setCauHinhHang(prev => prev.filter(h => h.id !== idHang)); setItems(prev => { const copy = { ...prev }; delete copy[idHang]; return copy; }); };
  const xuLyDoiSoCotHang = (rowId: string, thayDoi: number) => { setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, soCot: Math.max(1, hang.soCot + thayDoi) } : hang)); };
  const xuLyDoiChieuCaoHang = (rowId: string, chieuCaoMoi: number) => { setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, chieuCao: chieuCaoMoi } : hang)); };
  const xuLyDoiDoRongModule = (moduleId: string, thayDoi: number) => { setCauHinhModule((prev) => ({ ...prev, [moduleId]: { ...prev[moduleId], doRong: Math.max(1, (prev[moduleId]?.doRong || 1) + thayDoi) } })); };
  const xuLyXoaModule = (idModule: string) => { setItems((prev) => { const newItems = { ...prev }; Object.keys(newItems).forEach(key => { newItems[key] = newItems[key].filter(item => item !== idModule); }); return newItems; }); if (idModule.startsWith('dynamic_')) { setModuleConfigs(prev => { const copy = { ...prev }; delete copy[idModule]; return copy; }); } };
  const findContainer = (id: string) => { if (id in items) return id; return Object.keys(items).find((key) => items[key].includes(id)); };
  const handleDragStart = (event: DragStartEvent) => { if (isAdmin) setActiveId(event.active.id as string); };
  const handleDragOver = (event: DragOverEvent) => { if (!isAdmin) return; const { active, over } = event; const { id } = active; const overId = over?.id; if (!overId) return; const activeContainer = findContainer(id as string); const overContainer = findContainer(overId as string); if (!activeContainer || !overContainer || activeContainer === overContainer) return; setItems((prev) => { const activeItems = prev[activeContainer]; const overItems = prev[overContainer]; const activeIndex = activeItems.indexOf(id as string); const overIndex = overItems.indexOf(overId as string); let newIndex; if (overId in prev) { newIndex = overItems.length + 1; } else { const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height; const modifier = isBelowOverItem ? 1 : 0; newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1; } return { ...prev, [activeContainer]: [...prev[activeContainer].filter((item) => item !== id)], [overContainer]: [...prev[overContainer].slice(0, newIndex), items[activeContainer][activeIndex], ...prev[overContainer].slice(newIndex, prev[overContainer].length)] }; }); };
  const handleDragEnd = (event: DragEndEvent) => { if (!isAdmin) return; const { active, over } = event; const { id } = active; const overId = over?.id; if (overId) { const activeContainer = findContainer(id as string); const overContainer = findContainer(overId as string); if (activeContainer && overContainer && activeContainer === overContainer) { const activeIndex = items[activeContainer].indexOf(id as string); const overIndex = items[overContainer].indexOf(overId as string); if (activeIndex !== overIndex) { setItems((items) => ({ ...items, [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex) })); } } } setActiveId(null); };

  return (
    <div className="flex h-screen w-full bg-[#121212] text-[#E4E6EB] overflow-hidden font-sans">
      
      {/* ============================== */}
      {/* 🟢 1. DESKTOP SIDEBAR (Tối giản & Nghệ thuật) */}
      {/* ============================== */}
      <aside className="hidden md:flex flex-col w-[72px] bg-[#1E1E1E] border-r border-white/5 items-center py-6 gap-6 z-50 shrink-0">
          
          {/* Avatar (Có viền Active) */}
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full border-2 border-[#0068FF] overflow-hidden shadow-lg shadow-blue-500/20">
                <img src={currentUser?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E1E1E]"></div>
          </div>

          {/* Icons Menu (Nét mảnh - Minimalist) */}
          <div className="flex flex-col gap-4 w-full items-center">
              {[
                { id: 'message', icon: MessageCircle },
                { id: 'contact', icon: UsersRound },
                { id: 'apps', icon: Compass }, // Thay Grid bằng Compass cho nghệ thuật
                { id: 'diary', icon: Clock }
              ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)} 
                    className={`
                        p-3 rounded-xl transition-all duration-300 relative group
                        ${activeTab === item.id ? 'bg-[#0068FF] text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <item.icon size={22} strokeWidth={1.5} />
                    {/* Tooltip nhỏ bên cạnh */}
                    <span className="absolute left-full ml-3 px-2 py-1 bg-black/80 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        {item.id}
                    </span>
                </button>
              ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-4 text-gray-400 w-full items-center mb-2">
              <button className="hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all"><Sparkles size={22} strokeWidth={1.5} /></button>
              <button className="hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all"><Settings size={22} strokeWidth={1.5} /></button>
              <div className="h-[1px] w-8 bg-white/10"></div>
              <button onClick={handleLogout} className="hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-all" title="Đăng xuất"><LogOut size={22} strokeWidth={1.5} /></button>
          </div>
      </aside>

      {/* ============================== */}
      {/* 🟢 2. MAIN CONTENT AREA */}
      {/* ============================== */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#121212]">
          
          {/* 🟢 MOBILE HEADER (Glassmorphism & Tối giản) */}
          <header className="md:hidden h-14 bg-[#1E1E1E]/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50 border-b border-white/5">
              <div className="flex items-center gap-3 flex-1">
                  <Search className="text-gray-400" size={20} strokeWidth={1.5} />
                  <input type="text" placeholder="Tìm kiếm tin nhắn..." className="bg-transparent border-none outline-none text-white placeholder:text-gray-600 text-sm w-full" />
              </div>
              <div className="flex items-center gap-5 text-gray-300">
                  <QrCode size={20} strokeWidth={1.5} />
                  <Plus size={26} strokeWidth={1.5} onClick={() => isAdmin && xuLyThemHang()} />
              </div>
          </header>

          {/* 🟢 SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 md:p-8 pb-24 md:pb-10 relative scroll-smooth">
              {activeTab === 'message' ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col gap-3 md:gap-6 w-full mx-auto max-w-[1600px]">
                      {cauHinhHang.map((hang) => (
                        <HangLuoi
                          key={hang.id} id={hang.id} soCot={hang.soCot} chieuCao={hang.chieuCao}
                          items={items[hang.id]} duLieuModule={cauHinhModule} 
                          duLieuThat={{...dbData, ...Object.keys(moduleConfigs).reduce((acc, k) => { acc[k] = [moduleConfigs[k]]; return acc; }, {} as any)}}
                          isAdmin={isAdmin}
                          onDoiSoCotHang={xuLyDoiSoCotHang} onDoiDoRongModule={xuLyDoiDoRongModule}
                          onThayDoiChieuCao={xuLyDoiChieuCaoHang} onXoaHang={xuLyXoaHang}
                          onXoaModule={xuLyXoaModule}
                          onSuaModule={handleEditModule}
                          onThemModule={() => handleOpenAddModal(hang.id)} 
                        />
                      ))}
                      {isAdmin && (
                        <div className="flex gap-1 mt-4 px-1 pb-10">
                            <button onClick={xuLyThemHang} className="w-full py-6 border border-dashed border-white/10 rounded-2xl text-gray-600 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                                <LayoutTemplate size={18} strokeWidth={1.5} /> Thêm Khu Vực Mới
                            </button>
                        </div>
                      )}
                    </div>
                    <DragOverlay adjustScale>{activeId ? <KhoiDon id={activeId} data={[]} doRong={1} isAdmin={true} onThayDoiDoRong={() => {}} onXoaModule={() => {}} /> : null}</DragOverlay>
                  </DndContext>
              ) : activeTab === 'me' ? (
                  // TAB CÁ NHÂN (Minimalist Dark)
                  <div className="flex flex-col items-center pt-16 text-white animate-in slide-in-from-bottom-5 fade-in duration-500">
                      <div className="w-24 h-24 rounded-full p-1 border border-white/10 mb-4 bg-[#1E1E1E]">
                          <img src={currentUser?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight mb-1">{currentUser?.email?.split('@')[0] || "Người dùng"}</h2>
                      <p className="text-gray-500 text-sm mb-10 font-mono opacity-60">{currentUser?.email}</p>
                      
                      <div className="w-full max-w-sm flex flex-col gap-3">
                          <button className="flex items-center justify-between w-full bg-[#1E1E1E] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                              <span className="flex items-center gap-3 text-sm font-medium"><UserCircle size={20} className="text-blue-500"/> Hồ sơ cá nhân</span>
                              <span className="text-gray-600 text-xs">Chỉnh sửa</span>
                          </button>
                          <button className="flex items-center justify-between w-full bg-[#1E1E1E] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                              <span className="flex items-center gap-3 text-sm font-medium"><BellRing size={20} className="text-yellow-500"/> Cài đặt thông báo</span>
                          </button>
                          <button onClick={handleLogout} className="flex items-center justify-center w-full bg-red-900/10 text-red-500 p-4 rounded-xl border border-red-500/10 hover:bg-red-500/20 transition-all mt-4 font-bold text-sm gap-2">
                              <LogOut size={18} /> Đăng xuất
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <Compass size={64} strokeWidth={1} className="mb-4 opacity-20"/>
                      <p className="text-sm font-light tracking-wide">Tính năng đang phát triển</p>
                  </div>
              )}
          </div>

          {/* 🟢 MOBILE FOOTER (Minimalist, No Labels) */}
          <footer className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1E1E1E]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center z-50 pb-safe">
              {[
                  { id: 'message', icon: MessageCircle },
                  { id: 'contact', icon: UsersRound },
                  { id: 'apps', icon: Compass },
                  { id: 'diary', icon: Clock },
                  { id: 'me', icon: UserCircle },
              ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className="flex items-center justify-center w-full h-full relative group"
                  >
                      {/* Active Indicator (Glow) */}
                      {activeTab === item.id && (
                          <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full"></div>
                      )}
                      
                      <item.icon 
                        size={24} 
                        strokeWidth={activeTab === item.id ? 2 : 1.5} 
                        className={`transition-all duration-300 ${activeTab === item.id ? 'text-[#0068FF] scale-110' : 'text-gray-500'}`}
                      />
                  </button>
              ))}
          </footer>
      </div>

      <ModalTaoModule isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingModule(undefined); }} onCreate={handleCreateModule} initialData={editingModule} />
      
      {isAdmin && isSaving && (
          <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[60] bg-[#1E1E1E] border border-white/10 text-gray-300 px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-2xl">
              <Loader2 className="animate-spin text-blue-500" size={14}/> Saving changes...
          </div>
      )}
    </div>
  );
}