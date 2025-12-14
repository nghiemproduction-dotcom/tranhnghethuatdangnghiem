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
    Loader2, LayoutTemplate, 
    Menu, Search, Bell, MessageCircle, Home, LayoutGrid, Users 
} from 'lucide-react';

import { ModalTaoModule } from './ModalTaoModule';
import { ModuleConfig } from './KieuDuLieuModule';
import MobileBottomNav from './MobileBottomNav'; 
import Sidebar from './Sidebar'; // 🟢 Import Sidebar mới

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
  const [activeTab, setActiveTab] = useState('home'); 

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
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
            setItems({ hang_1: ['nhan_su'] });
            setCauHinhHang([{ id: 'hang_1', soCot: 3, chieuCao: 400 }]);
            setCauHinhModule({ 'nhan_su': { doRong: 2 } });
        }
    };
    fetchData();
  }, []);

  useEffect(() => { 
      if (!isAdmin || cauHinhHang.length === 0) return; 
      const timer = setTimeout(async () => { 
          setIsSaving(true); 
          await supabase.from('cau_hinh_giao_dien').upsert({ id: 'layout_main', du_lieu: { items, cauHinhHang, cauHinhModule, moduleConfigs } }); 
          setTimeout(() => setIsSaving(false), 500); 
      }, 1500); 
      return () => clearTimeout(timer); 
  }, [items, cauHinhHang, cauHinhModule, moduleConfigs, isAdmin]);

  const handleCreateModule = (config: ModuleConfig) => { 
      setModuleConfigs(prev => ({ ...prev, [config.id]: config })); 
      if (editingModule) { setShowAddModal(false); setEditingModule(undefined); return; } 
      const destRow = targetRowId || cauHinhHang[0]?.id; 
      if (destRow) { 
          setItems(prev => ({ ...prev, [destRow]: [...(prev[destRow] || []), config.id] })); 
          let defaultWidth = 1; 
          if (config.viewType === 'kanban' || config.viewType.startsWith('button')) defaultWidth = 3; 
          setCauHinhModule(prev => ({ ...prev, [config.id]: { doRong: defaultWidth } })); 
      } else { 
          const newRowId = `hang_${Date.now()}`; 
          setCauHinhHang([{ id: newRowId, soCot: 3, chieuCao: 400 }]); 
          setItems({ [newRowId]: [config.id] }); 
          setCauHinhModule({ [config.id]: { doRong: 1 } }); 
      } 
      setShowAddModal(false); setTargetRowId(null); 
  };
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
    // 🟢 LAYOUT CHÍNH: Flex Row cho Desktop (Sidebar + Main)
    <div className="flex h-screen w-full bg-[#12100E] text-[#D4C4B7] overflow-hidden relative font-sans">
      
      {/* 1. SIDEBAR (Chỉ hiện trên Tablet & Desktop) */}
      <Sidebar />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (Chiếm hết phần còn lại) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* A. MOBILE HEADER (2 TẦNG - Chỉ hiện trên Mobile) */}
          <div className="md:hidden shrink-0 z-50 bg-[#1A1A1A] border-b border-white/10 shadow-md">
              <div className="flex items-center justify-between px-4 h-14">
                  <h1 className="font-black text-xl tracking-tighter text-white">ArtSpace<span className="text-blue-500">.</span></h1>
                  <div className="flex items-center gap-3">
                      <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"><Search size={18}/></button>
                      <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all relative">
                          <MessageCircle size={18}/>
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></span>
                      </button>
                  </div>
              </div>
              <div className="flex items-center justify-around h-12 px-2">
                  <button onClick={() => setActiveTab('home')} className={`flex-1 h-full flex items-center justify-center border-b-2 transition-all ${activeTab === 'home' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:bg-white/5'}`}><Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} /></button>
                  <button onClick={() => setActiveTab('modules')} className={`flex-1 h-full flex items-center justify-center border-b-2 transition-all ${activeTab === 'modules' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:bg-white/5'}`}><LayoutGrid size={24} strokeWidth={activeTab === 'modules' ? 2.5 : 2} /></button>
                  <button onClick={() => setActiveTab('users')} className={`flex-1 h-full flex items-center justify-center border-b-2 transition-all ${activeTab === 'users' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:bg-white/5'}`}><Users size={24} strokeWidth={activeTab === 'users' ? 2.5 : 2} /></button>
                  <button onClick={() => setActiveTab('notifications')} className={`flex-1 h-full flex items-center justify-center border-b-2 transition-all ${activeTab === 'notifications' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:bg-white/5'}`}><Bell size={24} strokeWidth={activeTab === 'notifications' ? 2.5 : 2} /></button>
                  <button onClick={() => setActiveTab('menu')} className={`flex-1 h-full flex items-center justify-center border-b-2 transition-all ${activeTab === 'menu' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:bg-white/5'}`}><Menu size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} /></button>
              </div>
          </div>

          {/* B. DESKTOP HEADER (1 TẦNG - Chỉ hiện trên Tablet/Desktop) */}
          <div className="hidden md:flex shrink-0 h-16 bg-[#1A1A1A] border-b border-white/10 items-center justify-between px-6 z-30">
              <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">Dashboard Tổng Quan</h2>
                  <div className="h-6 w-[1px] bg-white/10"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Chào mừng quay lại,</span>
                      <span className="font-bold text-white">Tommy</span>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                      <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-[#12100E] border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white w-64 focus:w-80 focus:border-blue-500 transition-all outline-none"/>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[#12100E] border border-white/10 flex items-center justify-center hover:text-white transition-colors relative">
                      <Bell size={18}/>
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer hover:ring-2 ring-blue-500/50 transition-all">TM</div>
              </div>
          </div>

          {/* C. SCROLLABLE CONTENT (Phần Lưới - Dùng chung) */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 md:p-6 pb-24 md:pb-10 relative scroll-smooth bg-[#12100E]">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="flex flex-col gap-2 w-full mx-auto max-w-[1600px]">
                  {cauHinhHang.map((hang) => (
                    <HangLuoi
                      key={hang.id} id={hang.id} soCot={hang.soCot} chieuCao={hang.chieuCao}
                      items={items[hang.id]} duLieuModule={cauHinhModule} 
                      duLieuThat={{
                          ...dbData,
                          ...Object.keys(moduleConfigs).reduce((acc, key) => {
                              acc[key] = [moduleConfigs[key]]; 
                              return acc;
                          }, {} as any)
                      }}
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
                        <button onClick={xuLyThemHang} className="w-full py-4 md:py-6 border-2 border-dashed border-[#D4C4B7]/10 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl text-[#D4C4B7]/30 hover:text-[#D4C4B7] transition-all flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-widest font-bold group">
                            <span className="p-2 bg-white/5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors"><LayoutTemplate size={18} /></span>
                            THÊM KHU VỰC LÀM VIỆC MỚI
                        </button>
                    </div>
                  )}
                </div>

                <DragOverlay adjustScale={true}>
                  {activeId ? <KhoiDon id={activeId} data={dbData[activeId] || []} doRong={cauHinhModule[activeId]?.doRong || 1} isAdmin={true} onThayDoiDoRong={() => {}} onXoaModule={() => {}} /> : null}
                </DragOverlay>
              </DndContext>
          </div>
      </div>

      {/* D. MOBILE BOTTOM NAV (Chỉ hiện trên Mobile) */}
      <MobileBottomNav onAddModule={() => setShowAddModal(true)} />

      {/* Admin Badge (Chỉ Desktop) */}
      {isAdmin && (
          <div className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-full text-xs font-bold text-gray-400 shadow-2xl backdrop-blur-md">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Admin Mode</span>
              {isSaving && <span className="text-yellow-500 flex items-center gap-1 ml-2"><Loader2 className="animate-spin" size={12} /> Saving...</span>}
          </div>
      )}

      {/* Modal */}
      <ModalTaoModule 
          isOpen={showAddModal} 
          onClose={() => { setShowAddModal(false); setEditingModule(undefined); }}
          onCreate={handleCreateModule}
          initialData={editingModule} 
      />
    </div>
  );
}