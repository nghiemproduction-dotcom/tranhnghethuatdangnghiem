'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../ThuVien/ketNoiSupabase';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';
import { PlusCircle, Save, Eraser, Loader2 } from 'lucide-react';

export default function BangChinh() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [dbData, setDbData] = useState<{ [key: string]: any[] }>({ nhan_su: [], khach_hang: [], viec_mau: [] });
  const [items, setItems] = useState<{ [key: string]: string[] }>({});
  const [cauHinhHang, setCauHinhHang] = useState<any[]>([]);
  const [cauHinhModule, setCauHinhModule] = useState<{ [key: string]: { doRong: number } }>({});

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // 1. KHỞI TẠO
  useEffect(() => {
    const checkAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
    setIsAdmin(checkAdmin);

    const fetchData = async () => {
        const { data: nhanSu } = await supabase.from('nhan_su').select('*').limit(50);
        const { data: khachHang } = await supabase.from('khach_hang').select('*').limit(50);
        const { data: viecMau } = await supabase.from('viec_mau').select('*').limit(50);
        setDbData({ nhan_su: nhanSu || [], khach_hang: khachHang || [], viec_mau: viecMau || [] });

        const { data: configData } = await supabase.from('cau_hinh_giao_dien').select('du_lieu').eq('id', 'layout_main').single();
        
        if (configData?.du_lieu) {
            const config = configData.du_lieu;
            setItems(config.items || {});
            setCauHinhHang(config.cauHinhHang || []);
            setCauHinhModule(config.cauHinhModule || {});
        } else {
            setItems({ hang_1: ['nhan_su', 'khach_hang'], hang_2: ['viec_mau'] });
            setCauHinhHang([{ id: 'hang_1', soCot: 4, chieuCao: 400 }, { id: 'hang_2', soCot: 3, chieuCao: 400 }]);
            setCauHinhModule({ 'nhan_su': { doRong: 2 }, 'khach_hang': { doRong: 2 }, 'viec_mau': { doRong: 3 } });
        }
    };
    fetchData();
  }, []);

  // 2. TỰ ĐỘNG LƯU
  useEffect(() => {
    if (!isAdmin || cauHinhHang.length === 0) return;
    const timer = setTimeout(async () => {
        setIsSaving(true);
        await supabase.from('cau_hinh_giao_dien').upsert({
            id: 'layout_main',
            du_lieu: { items, cauHinhHang, cauHinhModule }
        });
        setTimeout(() => setIsSaving(false), 500);
    }, 1500); 
    return () => clearTimeout(timer);
  }, [items, cauHinhHang, cauHinhModule, isAdmin]);

  // LOGIC XỬ LÝ
  const xuLyThemHang = () => {
    const idMoi = `hang_${Date.now()}`; 
    setCauHinhHang(prev => [...prev, { id: idMoi, soCot: 3, chieuCao: 250 }]);
    setItems(prev => ({ ...prev, [idMoi]: [] }));
  };
  const xuLyXoaHang = (idHang: string) => {
    setCauHinhHang(prev => prev.filter(h => h.id !== idHang));
    setItems(prev => { const copy = { ...prev }; delete copy[idHang]; return copy; });
  };
  const xuLyDonDepHangTrong = () => {
      if(!confirm("Xóa các hàng không chứa module?")) return;
      setCauHinhHang(prev => prev.filter(hang => {
          const itemsInRow = items[hang.id];
          return itemsInRow && itemsInRow.length > 0;
      }));
  };
  const xuLyDoiSoCotHang = (rowId: string, thayDoi: number) => {
    setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, soCot: Math.max(1, hang.soCot + thayDoi) } : hang));
  };
  const xuLyDoiChieuCaoHang = (rowId: string, chieuCaoMoi: number) => {
    setCauHinhHang((prev) => prev.map((hang) => hang.id === rowId ? { ...hang, chieuCao: chieuCaoMoi } : hang));
  };
  const xuLyDoiDoRongModule = (moduleId: string, thayDoi: number) => {
    setCauHinhModule((prev) => ({ ...prev, [moduleId]: { ...prev[moduleId], doRong: Math.max(1, (prev[moduleId]?.doRong || 1) + thayDoi) } }));
  };
  const xuLyXoaModule = (idModule: string) => {
    setItems((prev) => {
      const newItems = { ...prev };
      Object.keys(newItems).forEach(key => { newItems[key] = newItems[key].filter(item => item !== idModule); });
      return newItems;
    });
  };
  const findContainer = (id: string) => { if (id in items) return id; return Object.keys(items).find((key) => items[key].includes(id)); };
  
  const handleDragStart = (event: DragStartEvent) => { if (isAdmin) setActiveId(event.active.id as string); };
  const handleDragOver = (event: DragOverEvent) => {
    if (!isAdmin) return;
    const { active, over } = event;
    const { id } = active; const overId = over?.id;
    if (!overId) return;
    const activeContainer = findContainer(id as string);
    const overContainer = findContainer(overId as string);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;
    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(id as string);
      const overIndex = overItems.indexOf(overId as string);
      let newIndex;
      if (overId in prev) { newIndex = overItems.length + 1; } 
      else {
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      return {
        ...prev,
        [activeContainer]: [...prev[activeContainer].filter((item) => item !== id)],
        [overContainer]: [...prev[overContainer].slice(0, newIndex), items[activeContainer][activeIndex], ...prev[overContainer].slice(newIndex, prev[overContainer].length)]
      };
    });
  };
  const handleDragEnd = (event: DragEndEvent) => {
    if (!isAdmin) return;
    const { active, over } = event;
    const { id } = active; const overId = over?.id;
    if (overId) {
      const activeContainer = findContainer(id as string);
      const overContainer = findContainer(overId as string);
      if (activeContainer && overContainer && activeContainer === overContainer) {
        const activeIndex = items[activeContainer].indexOf(id as string);
        const overIndex = items[overContainer].indexOf(overId as string);
        if (activeIndex !== overIndex) {
          setItems((items) => ({ ...items, [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex) }));
        }
      }
    }
    setActiveId(null);
  };

  return (
    // 🟢 p-1 (4px) + bg-[#12100E] (Nền Nâu Đen) + pt-8 (Chừa chỗ cho toolbar)
    <div className="w-full min-h-screen bg-[#12100E] text-[#D4C4B7] p-1 pt-8 pb-60 relative overflow-x-hidden font-sans">
      
      {isAdmin && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-[#2A2420] border border-[#D4C4B7]/30 rounded-sm text-xs text-[#D4C4B7] shadow-xl">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Admin Mode</span>
              {isSaving && <span className="text-yellow-600 flex items-center gap-1 ml-2"><Loader2 className="animate-spin" size={10} /> Saving...</span>}
          </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        
        {/* 🟢 gap-1 (4px) giữa các hàng */}
        <div className="flex flex-col gap-1 w-full mx-auto">
          {cauHinhHang.map((hang) => (
            <HangLuoi
              key={hang.id} id={hang.id} soCot={hang.soCot} chieuCao={hang.chieuCao}
              items={items[hang.id]} duLieuModule={cauHinhModule} duLieuThat={dbData}
              isAdmin={isAdmin}
              onDoiSoCotHang={xuLyDoiSoCotHang} onDoiDoRongModule={xuLyDoiDoRongModule}
              onThayDoiChieuCao={xuLyDoiChieuCaoHang} onXoaHang={xuLyXoaHang}
              onXoaModule={xuLyXoaModule}
            />
          ))}

          {isAdmin && (
            <div className="flex gap-1 mt-1">
                <button onClick={xuLyThemHang} className="group flex-1 py-4 border border-dashed border-[#D4C4B7]/30 bg-white/5 rounded-sm text-[#D4C4B7]/50 hover:text-yellow-600 hover:border-yellow-600/50 hover:bg-yellow-900/10 transition-all duration-300 flex items-center justify-center gap-2">
                    <PlusCircle className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm tracking-widest uppercase">Thêm khu vực</span>
                </button>
                <button onClick={xuLyDonDepHangTrong} className="group w-16 py-4 border border-dashed border-[#D4C4B7]/30 bg-white/5 rounded-sm text-[#D4C4B7]/50 hover:text-red-500 hover:border-red-500/50 hover:bg-red-900/10 transition-all duration-300 flex items-center justify-center" title="Xóa các hàng trống">
                    <Eraser className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>
          )}
        </div>

        <DragOverlay adjustScale={true}>
          {activeId ? (
            <div className="opacity-90 shadow-2xl scale-105 cursor-grabbing">
                <KhoiDon 
                  id={activeId} data={dbData[activeId] || []}
                  doRong={cauHinhModule[activeId]?.doRong || 1} 
                  isAdmin={true}
                  onThayDoiDoRong={() => {}} 
                  onXoaModule={() => {}}
                />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}