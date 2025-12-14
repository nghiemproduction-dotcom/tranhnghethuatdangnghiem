'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';
import { Loader2, LayoutTemplate } from 'lucide-react'; // Bỏ bớt icon thừa

import { ModalTaoModule } from './ModalTaoModule';
import { ModuleConfig } from './KieuDuLieuModule';

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
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // --- LOAD DATA ---
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

  // --- HANDLERS (LOGIC GIỮ NGUYÊN) ---
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
    // 🟢 SỬA LẠI LAYOUT: Bỏ h-screen, bỏ overflow-hidden để nó nằm gọn trong parent
    <div className="w-full h-full bg-transparent text-[#E4E6EB] font-sans">
      
      {/* 🟢 KHÔNG CÒN SIDEBAR (<aside>) NỮA */}
      {/* 🟢 KHÔNG CÒN HEADER MOBILE & FOOTER MOBILE NỮA */}

      {/* 🟢 CHỈ CÒN DUY NHẤT LƯỚI GRID MODULE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        
        {/* Container chứa các hàng lưới */}
        <div className="flex flex-col gap-4 w-full">
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

            {/* Nút thêm Khu vực mới (Chỉ Admin thấy) */}
            {isAdmin && (
            <div className="mt-4 pb-10">
                <button onClick={xuLyThemHang} className="w-full py-6 border border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                    <LayoutTemplate size={18} strokeWidth={1.5} /> Thêm Khu Vực Mới
                </button>
            </div>
            )}
        </div>

        {/* Overlay khi kéo thả module */}
        <DragOverlay adjustScale>{activeId ? <KhoiDon id={activeId} data={[]} doRong={1} isAdmin={true} onThayDoiDoRong={() => {}} onXoaModule={() => {}} /> : null}</DragOverlay>
      </DndContext>

      {/* Modal tạo module */}
      <ModalTaoModule isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingModule(undefined); }} onCreate={handleCreateModule} initialData={editingModule} />
      
      {/* Loading Indicator */}
      {isAdmin && isSaving && (
          <div className="fixed bottom-24 right-6 z-[99999] bg-[#1E1E1E] border border-white/10 text-gray-300 px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-2xl animate-pulse">
              <Loader2 className="animate-spin text-blue-500" size={14}/> Đang lưu...
          </div>
      )}
    </div>
  );
}