'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../ThuVien/ketNoiSupabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import HangLuoi from '@/app/phongdemo/KhuVucChuaModule/HangLuoi';
import KhoiDon from './KhoiDon';

export default function BangChinh() {
  const [dbData, setDbData] = useState<{ [key: string]: any[] }>({
    nhan_su: [],
    khach_hang: [],
    viec_mau: []
  });

  useEffect(() => {
    const fetchData = async () => {
        const { data: nhanSu } = await supabase.from('nhan_su').select('*').limit(50);
        const { data: khachHang } = await supabase.from('khach_hang').select('*').limit(50);
        const { data: viecMau } = await supabase.from('viec_mau').select('*').limit(50);

        setDbData({
            nhan_su: nhanSu || [],
            khach_hang: khachHang || [],
            viec_mau: viecMau || []
        });
    };
    fetchData();
  }, []);

  const [items, setItems] = useState<{ [key: string]: string[] }>({
    hang_1: ['nhan_su', 'khach_hang'], 
    hang_2: ['viec_mau'],              
    hang_3: [], 
  });

  const [cauHinhHang, setCauHinhHang] = useState([
    { id: 'hang_1', soCot: 4, chieuCao: 320 }, 
    { id: 'hang_2', soCot: 3, chieuCao: 400 }, 
    { id: 'hang_3', soCot: 2, chieuCao: 150 },
  ]);

  const [cauHinhModule, setCauHinhModule] = useState<{ [key: string]: { doRong: number } }>({
    'nhan_su': { doRong: 2 },
    'khach_hang': { doRong: 2 }, 
    'viec_mau': { doRong: 3 }, 
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- CÁC HÀM LOGIC ---

  const xuLyThemHang = () => {
    const idMoi = `hang_${Date.now()}`; 
    setCauHinhHang(prev => [...prev, { id: idMoi, soCot: 3, chieuCao: 200 }]);
    setItems(prev => ({ ...prev, [idMoi]: [] }));
  };

  const xuLyXoaHang = (idHang: string) => {
    setCauHinhHang(prev => prev.filter(h => h.id !== idHang));
    setItems(prev => {
        const copy = { ...prev };
        delete copy[idHang];
        return copy;
    });
  };

  const xuLyDoiSoCotHang = (rowId: string, thayDoi: number) => {
    setCauHinhHang((prev) =>
      prev.map((hang) =>
        hang.id === rowId ? { ...hang, soCot: Math.max(1, hang.soCot + thayDoi) } : hang
      )
    );
  };

  const xuLyDoiChieuCaoHang = (rowId: string, chieuCaoMoi: number) => {
    setCauHinhHang((prev) =>
      prev.map((hang) =>
        hang.id === rowId ? { ...hang, chieuCao: chieuCaoMoi } : hang
      )
    );
  };

  const xuLyDoiDoRongModule = (moduleId: string, thayDoi: number) => {
    setCauHinhModule((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        doRong: Math.max(1, (prev[moduleId]?.doRong || 1) + thayDoi)
      }
    }));
  };

  const findContainer = (id: string) => {
    if (id in items) return id;
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;
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
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over && active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }
      return {
        ...prev,
        [activeContainer]: [...prev[activeContainer].filter((item) => item !== id)],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;
    if (overId) {
      const activeContainer = findContainer(id as string);
      const overContainer = findContainer(overId as string);
      if (activeContainer && overContainer && activeContainer === overContainer) {
        const activeIndex = items[activeContainer].indexOf(id as string);
        const overIndex = items[overContainer].indexOf(overId as string);
        if (activeIndex !== overIndex) {
          setItems((items) => ({
            ...items,
            [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex),
          }));
        }
      }
    }
    setActiveId(null);
  };

  return (
    // Giảm padding p-8 -> p-4. Trên mobile thì p-2
    <div className="w-full min-h-screen bg-black text-gray-200 p-4 md:p-8 pb-40">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Giảm gap-8 -> gap-4 (hoặc gap-2 trên mobile) */}
        <div className="flex flex-col gap-2 md:gap-4 w-full max-w-[1600px] mx-auto">
          {cauHinhHang.map((hang) => (
            <HangLuoi
              key={hang.id}
              id={hang.id}
              soCot={hang.soCot}
              chieuCao={hang.chieuCao}
              items={items[hang.id]}
              duLieuModule={cauHinhModule}
              duLieuThat={dbData}
              onDoiSoCotHang={xuLyDoiSoCotHang}
              onDoiDoRongModule={xuLyDoiDoRongModule}
              onThayDoiChieuCao={xuLyDoiChieuCaoHang}
              onXoaHang={xuLyXoaHang}
            />
          ))}

          <button 
            onClick={xuLyThemHang}
            className="w-full py-4 md:py-6 mt-2 border border-dashed border-gray-800 rounded-xl 
                       text-gray-600 hover:text-white hover:border-gray-600 hover:bg-gray-900
                       transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="text-xl md:text-2xl font-light group-hover:scale-110 transition-transform">+</span>
            <span className="font-mono text-xs uppercase tracking-wider">Thêm hàng lưới</span>
          </button>
        </div>

        <DragOverlay adjustScale={true}>
          {activeId ? (
            <div className="opacity-90">
                <KhoiDon 
                id={activeId} 
                data={dbData[activeId] || []}
                doRong={cauHinhModule[activeId]?.doRong || 1} 
                onThayDoiDoRong={() => {}} 
                />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}