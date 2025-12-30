'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Plus, X, Database, Layout, Save, Globe, CheckCircle, BarChart3, List, Hash, MousePointerClick, AppWindow, Settings2, Trash2, MapPin, PieChart, Circle, Edit3, ArrowLeft } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule'; 
import { useRouter } from 'next/navigation';
import AccessDenied from './AccessDenied';
import GridArea from './GridArea';
import GenericModule from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/GenericModule'; 
import NutModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Props { pageId: string; title: string; allowedRoles: string[]; initialModules?: ModuleConfig[]; hideAddButton?: boolean; configModule?: ModuleConfig; }

export default function DashboardBuilder({ pageId, title, allowedRoles, initialModules, hideAddButton = false, configModule }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'library' | 'new'>('library');
    const [mobileStep, setMobileStep] = useState<'list' | 'form'>('list');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newModuleData, setNewModuleData] = useState({ 
        name: '', table: '', viewType: 'chart', chartType: 'Pie', groupBy: '', titleField: '', subField: '', buttonLabel: '', buttonColor: '#C69C6D'
    });

    const [activeRowId, setActiveRowId] = useState<string | null>(null); 
    const [isAdmin, setIsAdmin] = useState(false); 
    const [hasAccess, setHasAccess] = useState(true); 
    const [userRole, setUserRole] = useState('khach');
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeModuleConfig, setActiveModuleConfig] = useState<ModuleConfig | null>(null);
    const [isAnyLevel2Open, setIsAnyLevel2Open] = useState(false);

    // 🟢 1. LẤY USER ROLE VÀ CHECK ACCESS (chạy ngay)
    useEffect(() => {
        const role = localStorage.getItem('USER_ROLE') || 'khach';
        setUserRole(role);
        const adminRoles = ['admin', 'boss', 'quanly'];
        setIsAdmin(adminRoles.includes(role)); 
        if (allowedRoles && !allowedRoles.includes(role) && !adminRoles.includes(role)) {
            setHasAccess(false);
        }
    }, [allowedRoles]);

    // 🟢 2. FETCH AVAILABLE TABLES (Cache 10 phút - ít thay đổi)
    const { data: availableTables = [] } = useQuery({
        queryKey: ['manageable_tables'],
        queryFn: async () => {
            const { data } = await supabase.rpc('get_manageable_tables');
            return data?.map((t: any) => t.table_name) || [];
        },
        staleTime: 1000 * 60 * 10, // Cache 10 phút
        retry: 1,
    });

    // 🟢 3. FETCH GLOBAL MODULES (Cache 5 phút)
    const { data: globalModules = [] } = useQuery({
        queryKey: ['global_modules'],
        queryFn: async () => {
            const { data, error } = await supabase.from('global_modules').select('*');
            if (error) throw error;
            return data?.sort((a: any, b: any) => 
                new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime()
            ) || [];
        },
        staleTime: 1000 * 60 * 5, // Cache 5 phút
        retry: 1,
    });

    // 🟢 4. FETCH USAGE MAP (Cache 5 phút)
    const { data: usageMap = {} } = useQuery({
        queryKey: ['module_usage'],
        queryFn: async () => {
            const { data } = await supabase.rpc('get_module_usage_locations');
            const map: Record<string, string[]> = {};
            data?.forEach((u: any) => { 
                map[u.module_name] = u.used_in_pages; 
            });
            return map;
        },
        staleTime: 1000 * 60 * 5, // Cache 5 phút
        retry: 1,
    });

    // 🟢 5. FETCH DASHBOARD LAYOUT (Cache 2 phút, theo pageId)
    const { data: layoutData, isLoading: isLoadingLayout } = useQuery({
        queryKey: ['dashboard_layout', pageId],
        queryFn: async () => {
            if (configModule) return null; // Không fetch nếu có configModule
            const { data } = await supabase
                .from('dashboard_layouts')
                .select('layout_json')
                .eq('page_id', pageId)
                .single();
            return data?.layout_json || null;
        },
        enabled: !configModule, // Chỉ fetch khi không có configModule
        staleTime: 1000 * 60 * 2, // Cache 2 phút
        retry: 1,
    });

    // 🟢 6. SET MODULES TỪ LAYOUT HOẶC INITIAL
    useEffect(() => {
        if (configModule) {
            setModules([configModule]);
        } else if (layoutData) {
            setModules(layoutData);
        } else if (initialModules) {
            setModules(initialModules);
        }
    }, [configModule, layoutData, initialModules]);

    // 🟢 7. FETCH TABLE COLUMNS (Khi chọn bảng trong form)
    const { data: tableColumns = [] } = useQuery({
        queryKey: ['table_columns', newModuleData.table],
        queryFn: async () => {
            if (!newModuleData.table) return [];
            const { data } = await supabase.from(newModuleData.table).select('*').limit(1);
            if (data && data.length > 0) {
                return Object.keys(data[0]).filter(k => !['id', 'tao_luc', 'updated_at', 'nguoi_tao'].includes(k));
            }
            return [];
        },
        enabled: !!newModuleData.table,
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });

    // 🟢 8. AUTO SET DEFAULT VALUES KHI CÓ COLUMNS
    useEffect(() => {
        if (tableColumns.length > 0 && !editingId) {
            setNewModuleData(prev => ({
                ...prev,
                groupBy: tableColumns.includes('vi_tri') ? 'vi_tri' : (tableColumns.includes('trang_thai') ? 'trang_thai' : tableColumns[0]),
                titleField: tableColumns.includes('ho_ten') ? 'ho_ten' : tableColumns[0],
                subField: tableColumns[1] || tableColumns[0],
                buttonLabel: 'Truy Cập'
            }));
        }
    }, [tableColumns, editingId]);

    // 🟢 9. MUTATION: DELETE FROM LIBRARY
    const deleteFromLibraryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('global_modules').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate cache để refetch
            queryClient.invalidateQueries({ queryKey: ['global_modules'] });
            queryClient.invalidateQueries({ queryKey: ['module_usage'] });
        },
    });

    const handleDeleteFromLibrary = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Xóa vĩnh viễn module "${name}" khỏi kho?`)) {
            deleteFromLibraryMutation.mutate(id);
        }
    };

    // 🟢 10. MUTATION: SAVE LAYOUT
    const saveLayoutMutation = useMutation({
        mutationFn: async (layoutJson: ModuleConfig[]) => {
            const { error } = await supabase.from('dashboard_layouts').upsert(
                { page_id: pageId, layout_json: layoutJson, updated_at: new Date().toISOString() }, 
                { onConflict: 'page_id' }
            );
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate cache để refetch
            queryClient.invalidateQueries({ queryKey: ['dashboard_layout', pageId] });
        },
    });

    const handleSaveLayout = async () => {
        if (configModule) return;
        saveLayoutMutation.mutate(modules);
    };

    // 🟢 11. MUTATION: ADD TO GLOBAL MODULES
    const addToGlobalModulesMutation = useMutation({
        mutationFn: async ({ name, table_name }: { name: string; table_name: string }) => {
            const { error } = await supabase.from('global_modules').insert({ 
                name, 
                table_name, 
                type: 'generic' 
            });
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate cache
            queryClient.invalidateQueries({ queryKey: ['global_modules'] });
            queryClient.invalidateQueries({ queryKey: ['module_usage'] });
        },
    });

    const handleOpenAddModal = (rowId?: string) => { 
        setActiveRowId(rowId || 'row_default'); 
        setEditingId(null); 
        setAddMode('library');
        setMobileStep('list'); 
        setIsAddModalOpen(true); 
    };

    const handleStartEdit = (id: string) => {
        const targetModule = modules.find(m => m.id === id);
        if (!targetModule) return;
        setEditingId(id); 
        setAddMode('new'); 
        setMobileStep('form'); 
        setIsAddModalOpen(true);
        setNewModuleData({
            name: targetModule.tenModule,
            table: targetModule.bangDuLieu,
            viewType: targetModule.viewType || 'chart',
            chartType: targetModule.widgetData?.chartType || 'Pie',
            groupBy: targetModule.widgetData?.groupBy || '',
            titleField: targetModule.widgetData?.titleField || '',
            subField: targetModule.widgetData?.subField || '',
            buttonLabel: targetModule.widgetData?.buttonLabel || '',
            buttonColor: targetModule.widgetData?.buttonColor || '#C69C6D'
        });
    };

    const handleAddOrUpdateModule = async () => {
        if (!newModuleData.name || !newModuleData.table) return alert("Thiếu tên hoặc bảng!");
        const widgetData = { 
            chartType: newModuleData.chartType as any, 
            groupBy: newModuleData.groupBy, 
            titleField: newModuleData.titleField, 
            subField: newModuleData.subField, 
            buttonLabel: newModuleData.buttonLabel, 
            buttonColor: newModuleData.buttonColor 
        };
        
        if (editingId) {
            setModules(prev => prev.map(m => 
                m.id === editingId 
                    ? { ...m, tenModule: newModuleData.name, bangDuLieu: newModuleData.table, viewType: newModuleData.viewType as any, widgetData: widgetData, updatedAt: new Date().toISOString() } 
                    : m
            ));
        } else {
            const newModule: ModuleConfig = {
                id: `mod_${Date.now()}`,
                tenModule: newModuleData.name,
                moduleType: 'generic', 
                bangDuLieu: newModuleData.table,
                doRong: 1, 
                rowId: activeRowId || 'row_default', 
                rowHeight: 400,
                viewType: newModuleData.viewType as any, 
                widgetData: widgetData, 
                page_id: pageId,
                danhSachCot: [], 
                version: '1.0', 
                updatedAt: new Date().toISOString()
            };
            
            if (addMode === 'new') {
                await addToGlobalModulesMutation.mutateAsync({ 
                    name: newModuleData.name, 
                    table_name: newModuleData.table 
                });
            }
            
            setModules(prev => [...prev, newModule]);
        }
        setIsAddModalOpen(false); 
        setEditingId(null); 
    };
    
    const handleDelete = (id: string) => { 
        if (confirm('Gỡ module?')) setModules(prev => prev.filter(m => m.id !== id)); 
    };
    
    const handleResizeWidth = (id: string, delta: number) => { 
        setModules(prev => prev.map(m => 
            m.id === id 
                ? { ...m, doRong: Math.max(1, Math.min(4, (m.doRong || 1) + delta)) } 
                : m
        )); 
    };
    
    const handleOpenDetail = (item: any, config: ModuleConfig) => { 
        setDetailItem(item || {}); 
        setActiveModuleConfig(config); 
        setIsDetailOpen(true); 
    };

    // 🟢 LOADING STATE: Chỉ loading khi fetch layout (nếu cần)
    const loading = !configModule && isLoadingLayout;

    if (loading) return <div className="h-screen flex items-center justify-center bg-transparent pointer-events-none"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;
    if (!hasAccess) return <AccessDenied userRole={userRole} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.push('/')} />;

    // 🟢 TẠO DANH SÁCH TÁC VỤ CHO NUTMODAL
    const danhSachTacVu: any[] = [];
    if (!hideAddButton) {
        danhSachTacVu.push({ id: 'add', icon: Plus, nhan: 'Thêm Module', onClick: () => handleOpenAddModal() });
    }
    const isSaving = saveLayoutMutation.isPending;
    danhSachTacVu.push({ 
        id: 'save', 
        icon: isSaving ? CheckCircle : Save, 
        nhan: isSaving ? 'Đang Lưu...' : 'Lưu Cấu Hình', 
        onClick: handleSaveLayout, 
        mauSac: isSaving ? 'bg-green-600 border-green-500 text-white' : undefined 
    });

    return (
        <div 
            id="dashboard-main-content"
            className="fixed inset-0 z-[3000] w-full h-[100dvh] bg-black/80 backdrop-blur-sm text-[#E8D4B9] font-sans overflow-hidden transition-opacity duration-500 ease-in-out"
        >
            <div className="w-full h-full overflow-y-auto custom-scroll">
                <div className="pt-[100px] pb-[120px]">
                    <GridArea 
                        modules={modules} 
                        isAdmin={isAdmin} 
                        onChange={(newModules) => setModules(newModules)} 
                        onEditModule={handleStartEdit} 
                        onDeleteModule={handleDelete} 
                        onResizeWidth={handleResizeWidth} 
                        onOpenDetail={handleOpenDetail} 
                        onLevel2Toggle={(isOpen) => setIsAnyLevel2Open(isOpen)} 
                        onAddModuleToRow={(rowId) => handleOpenAddModal(rowId)} 
                        forceHidden={false} 
                    />
                </div>
            </div>

            {/* 🟢 HIỂN THỊ NÚT TÁC VỤ (THÊM/LƯU) */}
            {!configModule && isAdmin && !isDetailOpen && !isAnyLevel2Open && (
                <NutModal danhSachTacVu={danhSachTacVu} />
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[6000] bg-black/90 flex items-center justify-center p-0 md:p-4 backdrop-blur-sm pointer-events-auto">
                    <div className="bg-[#161210] border border-[#8B5E3C]/30 rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-[85vh] shadow-2xl flex flex-col overflow-hidden">
                        <div className="shrink-0 p-4 border-b border-[#8B5E3C]/20 flex justify-between items-center bg-[#1a120f]">
                            <h3 className="text-xl font-bold text-[#F5E6D3] flex items-center gap-3">{editingId ? <Edit3 /> : <Layout />} {editingId ? 'Chỉnh Sửa Module' : 'Thêm Module'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#5D4037] hover:text-[#E8D4B9] bg-[#0a0807] p-2 rounded-full"><X size={24}/></button>
                        </div>
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* Layout Add/Edit Module */}
                            <div className={`w-full md:w-1/3 border-r border-[#8B5E3C]/20 flex flex-col bg-[#0a0807]/50 transition-all absolute md:relative inset-0 z-10 md:z-auto ${mobileStep === 'form' ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                                <div className="flex border-b border-[#8B5E3C]/20">
                                    <button onClick={() => setAddMode('library')} disabled={!!editingId} className={`flex-1 py-4 font-bold uppercase text-xs ${addMode === 'library' ? 'bg-[#C69C6D]/10 text-[#C69C6D] border-b-2 border-[#C69C6D]' : 'text-[#5D4037]'}`}><Globe size={14} className="inline mr-2"/>Thư Viện</button>
                                    <button onClick={() => { setAddMode('new'); setMobileStep('form'); }} className={`flex-1 py-4 font-bold uppercase text-xs ${addMode === 'new' ? 'bg-[#C69C6D]/10 text-[#C69C6D] border-b-2 border-[#C69C6D]' : 'text-[#5D4037]'}`}><Plus size={14} className="inline mr-2"/>{editingId ? 'Cấu Hình' : 'Tạo Mới'}</button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                     {addMode === 'library' && (
                                         <div className="space-y-3">
                                            {globalModules.map((mod) => (
                                                <div key={mod.id} onClick={() => { setNewModuleData(prev => ({...prev, name: mod.name, table: mod.table_name})); setAddMode('new'); setMobileStep('form'); }} className="p-4 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl hover:border-[#C69C6D] cursor-pointer group relative">
                                                    <div className="font-bold text-[#E8D4B9]">{mod.name}</div>
                                                    <div className="text-xs text-[#5D4037]">{mod.table_name}</div>
                                                    <button onClick={(e) => handleDeleteFromLibrary(mod.id, mod.name, e)} className="absolute top-2 right-2 text-[#5D4037] hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                         </div>
                                     )}
                                </div>
                            </div>
                            <div className={`w-full md:w-2/3 p-6 overflow-y-auto bg-[#161210] absolute md:relative inset-0 z-20 md:z-auto transition-all ${mobileStep === 'form' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                                <div className="md:hidden mb-6"><button onClick={() => setMobileStep('list')} className="flex items-center gap-2 text-[#8B5E3C]"><ArrowLeft size={18}/> Quay lại</button></div>
                                <div className="space-y-8 max-w-2xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Tên Module</label><input type="text" className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 outline-none" value={newModuleData.name} onChange={(e) => setNewModuleData({...newModuleData, name: e.target.value})} /></div>
                                        <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Bảng Dữ Liệu</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 outline-none" value={newModuleData.table} onChange={(e) => setNewModuleData({...newModuleData, table: e.target.value})}><option value="">-- Chọn --</option>{availableTables.map((t: string) => <option key={t} value={t}>{t}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {[
                                            {id: 'chart', label: 'Biểu Đồ', icon: BarChart3},
                                            {id: 'list', label: 'Danh Sách', icon: List},
                                            {id: 'stat', label: 'Số Liệu', icon: Hash},
                                            {id: 'button', label: 'Nút Bấm', icon: MousePointerClick},
                                            {id: 'direct_l2', label: 'Bảng', icon: AppWindow},
                                        ].map(type => (
                                            <div key={type.id} onClick={() => setNewModuleData({...newModuleData, viewType: type.id as any})} className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center gap-2 ${newModuleData.viewType === type.id ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'bg-[#0a0807] border-[#8B5E3C]/20 text-[#5D4037]'}`}><type.icon size={20} /><span className="font-bold text-[9px] uppercase">{type.label}</span></div>
                                        ))}
                                    </div>
                                    {newModuleData.table && (
                                        <div className="space-y-6 pt-4 border-t border-[#8B5E3C]/20">
                                            {newModuleData.viewType === 'chart' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-xs font-bold text-[#8B5E3C] uppercase">Loại</label><select className="w-full bg-[#0a0807] border p-3 rounded-lg" value={newModuleData.chartType} onChange={(e) => setNewModuleData({...newModuleData, chartType: e.target.value})}><option value="Pie">Pie</option><option value="Donut">Donut</option><option value="Bar">Bar</option></select></div>
                                                    <div><label className="text-xs font-bold text-[#8B5E3C] uppercase">Nhóm</label><select className="w-full bg-[#0a0807] border p-3 rounded-lg" value={newModuleData.groupBy} onChange={(e) => setNewModuleData({...newModuleData, groupBy: e.target.value})}>{tableColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button onClick={handleAddOrUpdateModule} className="w-full bg-[#C69C6D] text-[#1a120f] font-bold py-4 rounded-xl hover:bg-[#b08b5e]">{editingId ? 'LƯU THAY ĐỔI' : 'THÊM MODULE'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isDetailOpen && activeModuleConfig && (
                <GenericModule mode="level3" isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => setIsDetailOpen(false)} config={activeModuleConfig} initialData={detailItem} userRole={userRole} />
            )}
        </div>
    );
}