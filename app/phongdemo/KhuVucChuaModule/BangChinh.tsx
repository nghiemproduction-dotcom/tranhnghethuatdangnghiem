'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';
import { PlusCircle, Save, Loader2, Database, LayoutTemplate } from 'lucide-react';

import { ModalTaoModule } from './ModalTaoModule';
import { ModuleConfig } from './KieuDuLieuModule';

export default function BangChinh() {
  const [isAdmin, setIsAdmin] = useState(false); // Đây là "Admin Hệ Thống"
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

  // --- 1. Load Data & PHÂN QUYỀN CHẶT CHẼ ---
  useEffect(() => {
    const checkQuyen = () => {
        if (typeof window === 'undefined') return false;
        const isHardAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        const role = localStorage.getItem('USER_ROLE');
        
        // ⛔ SỬA LẠI: CHỈ ADMIN THẬT SỰ MỚI ĐƯỢC QUYỀN SỬA GIAO DIỆN
        // Role 'quanly' sẽ trả về false ở đây -> Mất hết nút thêm/sửa layout
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

  // ... (Giữ nguyên phần còn lại của file, không thay đổi logic xử lý) ...
  // ... Copy lại logic Auto Save, Handlers, Layout Helpers, Drag/Drop từ bài trước ...

  // (Phần render ở dưới giữ nguyên, vì isAdmin bây giờ đã đúng nên nó sẽ tự ẩn các nút đi với Quản lý)
  
  // --- 2. Auto Save ---
  useEffect(() => { if (!isAdmin || cauHinhHang.length === 0) return; const timer = setTimeout(async () => { setIsSaving(true); await supabase.from('cau_hinh_giao_dien').upsert({ id: 'layout_main', du_lieu: { items, cauHinhHang, cauHinhModule, moduleConfigs } }); setTimeout(() => setIsSaving(false), 500); }, 1500); return () => clearTimeout(timer); }, [items, cauHinhHang, cauHinhModule, moduleConfigs, isAdmin]);

  // --- 3. Handlers ---
  const handleCreateModule = (config: ModuleConfig) => { setModuleConfigs(prev => ({ ...prev, [config.id]: config })); if (editingModule) { setShowAddModal(false); setEditingModule(undefined); return; } const destRow = targetRowId || cauHinhHang[0]?.id; if (destRow) { setItems(prev => ({ ...prev, [destRow]: [...(prev[destRow] || []), config.id] })); let defaultWidth = 1; if (config.viewType === 'kanban' || config.viewType.startsWith('button')) defaultWidth = 3; setCauHinhModule(prev => ({ ...prev, [config.id]: { doRong: defaultWidth } })); } else { const newRowId = `hang_${Date.now()}`; setCauHinhHang([{ id: newRowId, soCot: 3, chieuCao: 400 }]); setItems({ [newRowId]: [config.id] }); setCauHinhModule({ [config.id]: { doRong: 1 } }); } setShowAddModal(false); setTargetRowId(null); };
  const handleOpenAddModal = (rowId: string) => { setTargetRowId(rowId); setEditingModule(undefined); setShowAddModal(true); };
  const handleEditModule = (id: string, currentConfig: ModuleConfig) => { setEditingModule(currentConfig); setShowAddModal(true); };

  // --- Layout Helpers ---
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
    <div className="w-full min-h-screen bg-[#12100E] text-[#D4C4B7] p-1 pt-8 pb-60 relative overflow-x-hidden font-sans">
      
      {isAdmin && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#2A2420] border border-[#D4C4B7]/30 rounded-sm text-xs text-[#D4C4B7] shadow-xl">
              <span>Admin Mode</span>
              {isSaving && <span className="text-yellow-600 flex items-center gap-1 ml-2"><Loader2 className="animate-spin" size={10} /> Saving...</span>}
          </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-1 w-full mx-auto">
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
            <div className="flex gap-1 mt-4 px-1">
                <button 
                    onClick={xuLyThemHang}
                    className="w-full py-3 border border-dashed border-[#D4C4B7]/20 bg-white/[0.02] hover:bg-white/[0.05] rounded-sm text-[#D4C4B7]/40 hover:text-[#D4C4B7] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold"
                >
                    <LayoutTemplate size={16} />
                    THÊM HÀNG MỚI
                </button>
            </div>
          )}
        </div>

        {/* Modal chỉ Admin mới mở được (do nút bấm bị ẩn) */}
        <ModalTaoModule 
            isOpen={showAddModal} 
            onClose={() => { setShowAddModal(false); setEditingModule(undefined); }}
            onCreate={handleCreateModule}
            initialData={editingModule} 
        />

        <DragOverlay adjustScale={true}>
          {activeId ? <KhoiDon id={activeId} data={dbData[activeId] || []} doRong={cauHinhModule[activeId]?.doRong || 1} isAdmin={true} onThayDoiDoRong={() => {}} onXoaModule={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}