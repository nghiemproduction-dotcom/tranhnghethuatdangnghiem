'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';
import { 
    Search, Plus, QrCode, 
    MessageCircle, UsersRound, Compass, Clock, UserCircle, 
    Settings, LogOut, Loader2, LayoutTemplate, 
    BellRing, Sparkles, Menu 
} from 'lucide-react';

import { ModalTaoModule } from './ModalTaoModule';
import { ModuleConfig } from './KieuDuLieuModule';

// 🟢 THEME NÂU VINTAGE (ĐỒNG BỘ)
const THEME = {
    bg_main: '#121212',
    bg_sidebar: '#1E1E1E',
    active: '#A0522D', 
    text_active: '#D4C4B7'
};

export default function BangChinh() {
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
  const [activeTab, setActiveTab] = useState('message'); 
  const [currentUser, setCurrentUser] = useState<any>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // --- DATA LOADING ---
  useEffect(() => {
    const getUser = async () => { const { data: { user } } = await supabase.auth.getUser(); setCurrentUser(user); }; getUser();
    const checkQuyen = () => { if (typeof window === 'undefined') return false; return localStorage.getItem('LA_ADMIN_CUNG') === 'true' || localStorage.getItem('USER_ROLE') === 'admin'; }; setIsAdmin(checkQuyen());
    const fetchData = async () => { const { data: configData } = await supabase.from('cau_hinh_giao_dien').select('du_lieu').eq('id', 'layout_main').single(); if (configData?.du_lieu) { setItems(configData.du_lieu.items || {}); setCauHinhHang(configData.du_lieu.cauHinhHang || []); setCauHinhModule(configData.du_lieu.cauHinhModule || {}); setModuleConfigs(configData.du_lieu.moduleConfigs || {}); } else { const newId = `hang_${Date.now()}`; setItems({ [newId]: [] }); setCauHinhHang([{ id: newId, soCot: 3, chieuCao: 400 }]); } }; fetchData();
  }, []);

  // --- HANDLERS (Giữ nguyên logic cũ) ---
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };
  const handleCreateModule = (c: ModuleConfig) => { setModuleConfigs(p => ({ ...p, [c.id]: c })); if (editingModule) { setShowAddModal(false); setEditingModule(undefined); return; } const r = targetRowId || cauHinhHang[0]?.id; if (r) { setItems(p => ({ ...p, [r]: [...(p[r] || []), c.id] })); setCauHinhModule(p => ({ ...p, [c.id]: { doRong: c.viewType === 'kanban' ? 3 : 1 } })); } else { const id = `h_${Date.now()}`; setCauHinhHang([{ id, soCot: 3, chieuCao: 400 }]); setItems({ [id]: [c.id] }); setCauHinhModule({ [c.id]: { doRong: 1 } }); } setShowAddModal(false); setTargetRowId(null); };
  const xuLyThemHang = () => { const id = `h_${Date.now()}`; setCauHinhHang(p => [...p, { id, soCot: 3, chieuCao: 250 }]); setItems(p => ({ ...p, [id]: [] })); };
  const handleOpenAddModal = (rowId: string) => { setTargetRowId(rowId); setEditingModule(undefined); setShowAddModal(true); };
  const handleEditModule = (id: string, currentConfig: ModuleConfig) => { setEditingModule(currentConfig); setShowAddModal(true); };
  const xuLyXoaHang = (idHang: string) => { setCauHinhHang(prev => prev.filter(h => h.id !== idHang)); setItems(prev => { const copy = { ...prev }; delete copy[idHang]; return copy; }); };
  const xuLyDoiSoCotHang = (rowId: string, thayDoi: number) => { setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, soCot: Math.max(1, hang.soCot + thayDoi) } : hang)); };
  const xuLyDoiChieuCaoHang = (rowId: string, chieuCaoMoi: number) => { setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, chieuCao: chieuCaoMoi } : hang)); };
  const xuLyDoiDoRongModule = (moduleId: string, thayDoi: number) => { setCauHinhModule((prev) => ({ ...prev, [moduleId]: { ...prev[moduleId], doRong: Math.max(1, (prev[moduleId]?.doRong || 1) + thayDoi) } })); };
  const xuLyXoaModule = (idModule: string) => { setItems((prev) => { const newItems = { ...prev }; Object.keys(newItems).forEach(key => { newItems[key] = newItems[key].filter(item => item !== idModule); }); return newItems; }); if (idModule.startsWith('dynamic_')) { setModuleConfigs(prev => { const copy = { ...prev }; delete copy[idModule]; return copy; }); } };
  const findContainer = (id: string) => { if (id in items) return id; return Object.keys(items).find((key) => items[key].includes(id)); };
  const handleDragStart = (e: any) => isAdmin && setActiveId(e.active.id);
  const handleDragOver = (e: any) => { if(!isAdmin) return; const {active, over} = e; if(!over) return; const ac = findContainer(active.id); const oc = findContainer(over.id); if(!ac || !oc || ac===oc) return; setItems(p => { const ai = p[ac].indexOf(active.id); const oi = p[oc].indexOf(over.id); let ni; if(over.id in p) ni = p[oc].length+1; else { const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height; ni = oi >= 0 ? oi + (isBelow ? 1 : 0) : p[oc].length + 1; } return { ...p, [ac]: p[ac].filter(i => i !== active.id), [oc]: [...p[oc].slice(0, ni), items[ac][ai], ...p[oc].slice(ni, p[oc].length)] }; }); };
  const handleDragEnd = (e: any) => { if(!isAdmin) return; const {active, over} = e; if(over && active.id !== over.id) { const ac = findContainer(active.id); const oc = findContainer(over.id); if(ac && oc && ac === oc) setItems(p => ({ ...p, [ac]: arrayMove(p[ac], p[ac].indexOf(active.id), p[oc].indexOf(over.id)) })); } setActiveId(null); };

  // MENU ITEMS (Dùng chung)
  const menuItems = [
    { id: 'message', icon: MessageCircle, label: 'Tin nhắn' },
    { id: 'contact', icon: UsersRound, label: 'Danh bạ' },
    { id: 'apps', icon: Compass, label: 'Khám phá' },
    { id: 'diary', icon: Clock, label: 'Nhật ký' },
    { id: 'me', icon: UserCircle, label: 'Cá nhân' }
  ];

  return (
    // h-[100dvh] để fix lỗi chiều cao trên iPhone
    <div className="flex h-[100dvh] w-full bg-[#121212] text-[#D4C4B7] overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* 🟢 1. MENU DESKTOP (SIDEBAR DỌC) */}
      {/* 👉 CHỈ HIỆN KHI MÀN HÌNH >= 1024px (hidden lg:flex) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-[80px] bg-[#1E1E1E] border-r border-white/5 items-center py-6 gap-6 z-50 shrink-0 shadow-2xl">
          
          {/* Avatar Desktop */}
          <div className="relative group cursor-pointer mb-2">
            <div className={`w-12 h-12 rounded-full border-2 border-[${THEME.active}] p-0.5 overflow-hidden transition-transform hover:scale-105`}>
                <img src={currentUser?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover rounded-full"/>
            </div>
          </div>

          {/* Icon List Desktop */}
          <div className="flex flex-col gap-5 w-full items-center">
              {menuItems.slice(0, 4).map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)} 
                    className={`
                        p-3.5 rounded-2xl transition-all duration-300 relative group
                        ${activeTab === item.id ? 'bg-[#A0522D] text-white shadow-lg shadow-orange-900/40' : 'text-gray-500 hover:bg-white/5 hover:text-[#D4C4B7]'}
                    `}
                >
                    <item.icon size={24} strokeWidth={1.5} />
                    {/* Tooltip */}
                    <span className="absolute left-14 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                    </span>
                </button>
              ))}
          </div>

          {/* Bottom Actions Desktop */}
          <div className="mt-auto flex flex-col gap-5 text-gray-500 w-full items-center mb-4">
              <button className="hover:text-[#D4C4B7] hover:bg-white/5 p-3 rounded-xl transition-all"><Settings size={24} strokeWidth={1.5} /></button>
              <div className="h-[1px] w-8 bg-white/10"></div>
              <button onClick={handleLogout} className="hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-all" title="Đăng xuất"><LogOut size={24} strokeWidth={1.5} /></button>
          </div>
      </aside>


      {/* ========================================================= */}
      {/* 🟢 2. KHU VỰC NỘI DUNG CHÍNH (CONTENT) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#121212]">
          
          {/* HEADER MOBILE/TABLET (Chỉ hiện khi < 1024px) */}
          <header className="lg:hidden h-14 bg-[#1E1E1E]/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50 border-b border-white/5">
              <div className="flex items-center gap-3 flex-1">
                  <Search className="text-[#A0522D]" size={20} strokeWidth={1.5} />
                  <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-white placeholder:text-gray-600 text-sm w-full" />
              </div>
              <div className="flex items-center gap-4">
                  <QrCode size={20} className="text-gray-400"/>
                  <Plus size={26} className="text-[#A0522D]" strokeWidth={1.5} onClick={() => isAdmin && xuLyThemHang()} />
              </div>
          </header>

          {/* HEADER DESKTOP (Chỉ hiện khi >= 1024px) */}
          <header className="hidden lg:flex h-16 bg-transparent items-center justify-between px-8 shrink-0 border-b border-white/5">
               <div className="flex items-center gap-3 bg-[#1E1E1E] px-4 py-2 rounded-full border border-white/5 w-[400px]">
                  <Search className="text-gray-500" size={18} />
                  <input type="text" placeholder="Tìm kiếm tin nhắn, công việc..." className="bg-transparent border-none outline-none text-white text-sm w-full" />
               </div>
               <div className="flex gap-4">
                   <button className="p-2 bg-[#1E1E1E] rounded-full text-gray-400 hover:text-white border border-white/5"><BellRing size={20} strokeWidth={1.5}/></button>
                   {isAdmin && <button onClick={xuLyThemHang} className="px-4 py-2 bg-[#A0522D] text-white rounded-full text-sm font-bold shadow-lg hover:bg-[#8B4513] transition-colors">Thêm Khu Vực</button>}
               </div>
          </header>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 md:p-6 lg:p-8 pb-24 lg:pb-10 relative scroll-smooth">
              {activeTab === 'message' ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col gap-3 md:gap-6 w-full mx-auto max-w-[1920px]">
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
                      {/* Nút thêm khu vực cho Mobile/Tablet (khi là Admin) */}
                      {isAdmin && (
                        <div className="lg:hidden flex gap-1 mt-4 px-1 pb-10">
                            <button onClick={xuLyThemHang} className="w-full py-6 border border-dashed border-[#A0522D]/30 rounded-2xl text-[#A0522D] hover:bg-[#A0522D]/10 transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                                <LayoutTemplate size={18} strokeWidth={1.5} /> Thêm Khu Vực Mới
                            </button>
                        </div>
                      )}
                    </div>
                    <DragOverlay adjustScale>{activeId ? <KhoiDon id={activeId} data={[]} doRong={1} isAdmin={true} onThayDoiDoRong={() => {}} onXoaModule={() => {}} /> : null}</DragOverlay>
                  </DndContext>
              ) : activeTab === 'me' ? (
                  <div className="flex flex-col items-center pt-16 text-[#D4C4B7]">
                      <div className="w-24 h-24 rounded-full p-1 border border-[#A0522D] mb-4 bg-[#1E1E1E]">
                          <img src={currentUser?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt="User" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight mb-1">{currentUser?.email?.split('@')[0]}</h2>
                      <button onClick={handleLogout} className="flex items-center justify-center w-full max-w-sm bg-red-900/10 text-red-500 p-4 rounded-xl border border-red-500/10 hover:bg-red-500/20 transition-all mt-10 font-bold text-sm gap-2">
                          <LogOut size={18} /> Đăng xuất
                      </button>
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <Compass size={64} strokeWidth={1} className="mb-4 opacity-20"/>
                      <p>Tính năng đang phát triển</p>
                  </div>
              )}
          </div>


          {/* ========================================================= */}
          {/* 🟢 3. MENU MOBILE + TABLET (THANH NGANG DƯỚI ĐÁY) */}
          {/* 👉 CHỈ HIỆN KHI MÀN HÌNH < 1024px (lg:hidden) */}
          {/* ========================================================= */}
          <footer className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1E1E1E]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
              {menuItems.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className="flex flex-col items-center justify-center w-full h-full relative group gap-1"
                  >
                      {/* Active Indicator */}
                      {activeTab === item.id && (
                          <div className="absolute top-0 w-8 h-1 bg-[#A0522D] rounded-b-lg shadow-[0_0_10px_#A0522D]"></div>
                      )}
                      
                      <item.icon 
                        size={activeTab === item.id ? 26 : 24} 
                        strokeWidth={activeTab === item.id ? 2 : 1.5} 
                        className={`transition-all duration-300 ${activeTab === item.id ? 'text-[#A0522D] -translate-y-1' : 'text-gray-500'}`}
                      />
                      {/* Label nhỏ cho Tablet dễ nhìn (Ẩn trên mobile bé quá nếu muốn) */}
                      <span className={`text-[9px] font-medium transition-colors ${activeTab === item.id ? 'text-[#A0522D]' : 'text-gray-600'}`}>
                          {item.label}
                      </span>
                  </button>
              ))}
          </footer>

      </div>

      <ModalTaoModule isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingModule(undefined); }} onCreate={handleCreateModule} initialData={editingModule} />
      {isAdmin && isSaving && <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[60] bg-[#1E1E1E] border border-[#A0522D]/30 text-[#A0522D] px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-2xl"><Loader2 className="animate-spin" size={14}/> Saving...</div>}
    </div>
  );
}