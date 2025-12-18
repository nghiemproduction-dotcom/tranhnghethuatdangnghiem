'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpDown, PlusCircle, GripHorizontal, Check, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule';
import ModuleItem from './ModuleItem';
import ModalTaoModule from './ModalTaoModule';
import MenuDuoi from './MenuDuoi';
import Level3_FormChiTiet from './Level3_FormChiTiet'; 
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation'; 

// 🟢 NHẬN TÊN PHÒNG TỪ CHA
interface Props {
    pageId: string; 
    title: string;
    allowedRoles: string[]; // VD: ['quanly', 'admin']
}

export default function DashboardBuilder({ pageId, title, allowedRoles }: Props) {
    const router = useRouter();
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    
    // States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    
    // Quyền hạn
    const [isAdmin, setIsAdmin] = useState(false); 
    const [hasAccess, setHasAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Detail State
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConfig, setDetailConfig] = useState<ModuleConfig | any>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

    // CHECK QUYỀN
    useEffect(() => {
        const verifyAccess = () => {
            setIsChecking(true);
            if (typeof window === 'undefined') return;

            // Lấy role đã chuẩn hóa ("quanly", "admin", "thosanxuat")
            const currentUserRole = localStorage.getItem('USER_ROLE') || 'khach';
            const laAdminCung = localStorage.getItem('LA_ADMIN_CUNG') === 'true';

            // 1. Quyền sửa Layout (Admin & Quản lý)
            // Lưu ý: Role "quanly" (từ "Quản lý") được phép sửa
            const builderRoles = ['admin', 'adminsystem', 'quanly', 'manager'];
            const canEditLayout = laAdminCung || builderRoles.some(r => currentUserRole === r || currentUserRole.includes(r));
            setIsAdmin(canEditLayout);

            // 2. Quyền VÀO phòng này
            // - Admin hệ thống -> Vào tuốt
            const isSystemAdmin = currentUserRole.includes('admin') || laAdminCung;
            
            // - Hoặc người có role nằm trong danh sách cho phép (allowedRoles)
            // VD: allowedRoles=['quanly'] mà user='quanly' -> OK
            const isAllowed = isSystemAdmin || allowedRoles.some(r => currentUserRole.includes(r));

            if (!isAllowed) {
                alert(`Bạn (${currentUserRole}) không có quyền truy cập khu vực: ${title}`);
                router.push('/'); 
            } else {
                setHasAccess(true);
            }
            setIsChecking(false);
        };

        verifyAccess();
    }, [pageId, allowedRoles, title, router]);

    // LOAD DỮ LIỆU
    useEffect(() => {
        if (!hasAccess) return;

        const loadModules = async () => {
            const { data } = await supabase
                .from('cau_hinh_modules')
                .select('*')
                .eq('page_id', pageId)
                .order('created_at', { ascending: true });
                
            if (data) {
                setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
            }
        };
        loadModules();
    }, [pageId, hasAccess]);

    // --- LOGIC HÀNG (ROWS) ---
    const rows: Record<string, ModuleConfig[]> = {};
    const rowHeights: Record<string, number> = {};
    const uniqueRowIds = Array.from(new Set(modules.map(m => m.rowId || 'default')));
    
    uniqueRowIds.forEach(rid => {
        rows[rid] = modules.filter(m => (m.rowId || 'default') === rid);
        rowHeights[rid] = rows[rid][0]?.rowHeight || 250;
    });

    const handleCreateNewRow = () => {
        if (!isAdmin) return;
        const newRowId = `row_${Date.now()}`;
        setActiveRowId(newRowId);
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleAddToExistingRow = (rowId: string) => {
        if (!isAdmin) return;
        setActiveRowId(rowId);
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleSaveModule = async (config: ModuleConfig) => {
        if (!isAdmin) return;
        let updatedModules = [...modules];
        const idx = modules.findIndex(m => m.id === config.id);
        const targetRowId = idx >= 0 ? (config.rowId || 'default') : (activeRowId || 'default');
        const currentHeight = rowHeights[targetRowId] || 250;

        const newConfig = { 
            ...config, 
            rowId: targetRowId,
            rowHeight: currentHeight,
            doRong: config.doRong || 1,
            page_id: pageId
        };

        if (idx >= 0) updatedModules[idx] = newConfig;
        else updatedModules.push(newConfig);
        
        setModules(updatedModules);
        setActiveRowId(null);

        const { error } = await supabase.from('cau_hinh_modules').upsert({ 
            module_id: newConfig.id, 
            page_id: pageId, 
            config_json: newConfig 
        });
        if (error) console.error("Lỗi lưu Supabase:", error);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if(!confirm('Xóa module này?')) return;
        setModules(prev => prev.filter(m => m.id !== id));
        await supabase.from('cau_hinh_modules').delete().eq('module_id', id);
    };

    const handleResizeWidth = (id: string, delta: number) => {
        if (!isAdmin) return;
        setModules(prev => prev.map(m => {
            if (m.id !== id) return m;
            const newW = Math.max(1, Math.min(2, (m.doRong || 1) + delta));
            supabase.from('cau_hinh_modules').update({ config_json: { ...m, doRong: newW } }).eq('module_id', id).then();
            return { ...m, doRong: newW };
        }));
    };

    const handleResizeRowHeight = (rowId: string, delta: number) => {
        if (!isAdmin) return;
        const currentH = rowHeights[rowId] || 250;
        const newH = Math.max(150, Math.min(600, currentH + delta));
        
        setModules(prev => prev.map(m => {
            if ((m.rowId || 'default') === rowId) {
                const updated = { ...m, rowHeight: newH };
                supabase.from('cau_hinh_modules').update({ config_json: updated }).eq('module_id', m.id).then();
                return updated;
            }
            return m;
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (!isAdmin) return;
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (isChecking) {
        return <div className="min-h-screen bg-[#111] flex items-center justify-center text-[#C69C6D]"><Loader2 className="animate-spin mr-2"/> Đang tải dữ liệu...</div>;
    }

    if (!hasAccess) return null;

    return (
        <div className="min-h-screen bg-[#111111] text-white w-full pb-32 font-sans bg-[url('/noise.png')] bg-repeat opacity-95">
            
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 z-[900] h-16 pt-safe flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>
                <div className="relative w-full max-w-md mx-6 group pointer-events-auto transform hover:scale-[1.02] transition-transform duration-500 ease-out mt-1">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5E3C] via-[#C69C6D] to-[#8B5E3C] blur-xl opacity-20 group-hover:opacity-40 transition duration-700 rounded-[20px]"></div>
                    <div className="relative h-full bg-gradient-to-br from-[#5D4037] via-[#8B5E3C] to-[#3E2723] p-[2px] rounded-[12px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] border-t border-white/20 overflow-hidden">
                        <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_1px,transparent_1px,transparent_3px)] mix-blend-overlay"></div>
                        <div className="relative h-full bg-[#1a120f] rounded-[10px] flex items-center justify-center py-2 px-8 shadow-[inset_0_3px_15px_rgba(0,0,0,1)] border-b border-white/5 overflow-hidden">
                            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#5D4037] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.7)] border border-[#8B5E3C]/50"></div>
                            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-bl from-[#F5E6D3] to-[#5D4037] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.7)] border border-[#8B5E3C]/50"></div>
                            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#F5E6D3] to-[#5D4037] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.7)] border border-[#8B5E3C]/50"></div>
                            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tl from-[#F5E6D3] to-[#5D4037] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.7)] border border-[#8B5E3C]/50"></div>
                            <h1 className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-[#F5E6D3] via-[#C69C6D] to-[#8B5E3C] font-black tracking-[0.2em] text-sm sm:text-base md:text-lg uppercase text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] truncate">
                                {title}
                            </h1>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>
                {isAdmin && (
                    <div className="absolute right-2 top-2 pointer-events-auto bg-red-900/80 backdrop-blur-sm text-red-200 p-1 rounded-md border border-red-500/30 shadow-lg" title="Chế độ Admin: Bạn có quyền sửa Layout">
                        <ShieldAlert size={12} />
                    </div>
                )}
            </div>

            {/* BODY */}
            <div className="pt-20 px-2 md:px-4 space-y-2"> 
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    {uniqueRowIds.map(rowId => {
                        const rowModules = rows[rowId];
                        const h = rowHeights[rowId]; 
                        return (
                            <div key={rowId} className="relative group/row">
                                {isAdmin && (
                                    <div className="absolute -top-7 left-0 right-0 flex justify-between items-center px-1 z-20 transition-opacity opacity-100 md:opacity-0 md:group-hover/row:opacity-100">
                                        <div className="flex items-center gap-2">
                                            <GripHorizontal size={16} className="text-gray-600 cursor-grab"/>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">H: {h}px</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/10 rounded-t-lg px-2 py-1 shadow-lg">
                                            <button onClick={() => handleAddToExistingRow(rowId)} className="p-1 text-blue-500 hover:text-blue-400 hover:bg-white/5 rounded transition-colors" title="Thêm vào hàng này"><Plus size={14} /></button>
                                            <div className="w-[1px] h-3 bg-white/20 mx-1"></div>
                                            <button onClick={() => handleResizeRowHeight(rowId, -50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12} className="rotate-45"/></button>
                                            <button onClick={() => handleResizeRowHeight(rowId, 50)} className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded"><ArrowUpDown size={12}/></button>
                                        </div>
                                    </div>
                                )}
                                <div className="border border-transparent hover:border-white/5 rounded-xl transition-colors">
                                    <SortableContext items={rowModules.map(m => m.id)} strategy={rectSortingStrategy}>
                                        <div className="grid w-full transition-all duration-300 grid-flow-row-dense" style={{ gridTemplateColumns: `repeat(1, 1fr)`, gridAutoRows: `${h}px`, gap: '8px' } as React.CSSProperties}>
                                            <style jsx>{` @media (min-width: 768px) { div.grid { grid-template-columns: repeat(2, 1fr) !important; } } `}</style>
                                            {rowModules.map(mod => (
                                                <ModuleItem key={mod.id} id={mod.id} data={mod} isAdmin={isAdmin} onDelete={() => handleDelete(mod.id)} onEdit={() => { setEditingModule(mod); setIsModalOpen(true); }} onResizeWidth={(delta) => handleResizeWidth(mod.id, delta)}/>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </div>
                            </div>
                        );
                    })}
                </DndContext>

                {isAdmin && (
                    <div className="flex justify-center pb-10 pt-4 border-t border-dashed border-white/5">
                        <button onClick={handleCreateNewRow} className="flex items-center gap-3 px-8 py-3 bg-[#1A1A1A] hover:bg-[#222] border border-white/10 hover:border-[#C69C6D]/50 rounded-full shadow-lg transition-all active:scale-95 group">
                            <PlusCircle size={20} className="text-[#C69C6D] group-hover:scale-110 transition-transform"/>
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-widest">Tạo Hàng Lưới Mới</span>
                        </button>
                    </div>
                )}
            </div>

            <ModalTaoModule isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModule} initialConfig={editingModule} pageId={pageId}/>
            <MenuDuoi onAdd={isAdmin ? handleCreateNewRow : undefined} /> 
            
            {isDetailOpen && detailConfig && (
                <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => {}} config={detailConfig} initialData={detailItem} userRole={isAdmin ? 'admin' : 'user'}/>
            )}
        </div>
    );
}