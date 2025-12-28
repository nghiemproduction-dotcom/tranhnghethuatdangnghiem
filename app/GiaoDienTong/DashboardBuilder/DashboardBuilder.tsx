'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X, Database, Layout, Save, Globe, CheckCircle, BarChart3, List, Hash, MousePointerClick, AppWindow, Settings2, Trash2, MapPin, PieChart, Circle, Edit3, ArrowLeft } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule'; 
import { useRouter } from 'next/navigation';
import AccessDenied from './AccessDenied';
import GridArea from './GridArea';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/Modulegeneric/level3generic/level3generic'; 
import NutModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

interface Props { pageId: string; title: string; allowedRoles: string[]; initialModules?: ModuleConfig[]; hideAddButton?: boolean; configModule?: ModuleConfig; }

export default function DashboardBuilder({ pageId, title, allowedRoles, initialModules, hideAddButton = false, configModule }: Props) {
    const router = useRouter();
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'library' | 'new'>('library');
    const [mobileStep, setMobileStep] = useState<'list' | 'form'>('list');

    const [availableTables, setAvailableTables] = useState<string[]>([]);
    const [globalModules, setGlobalModules] = useState<any[]>([]); 
    const [usageMap, setUsageMap] = useState<Record<string, string[]>>({}); 
    const [editingId, setEditingId] = useState<string | null>(null);

    const [newModuleData, setNewModuleData] = useState({ 
        name: '', table: '', viewType: 'chart', chartType: 'Pie', groupBy: '', titleField: '', subField: '', buttonLabel: '', buttonColor: '#C69C6D'
    });
    const [tableColumns, setTableColumns] = useState<string[]>([]);

    const [activeRowId, setActiveRowId] = useState<string | null>(null); 
    const [isAdmin, setIsAdmin] = useState(false); 
    const [hasAccess, setHasAccess] = useState(true); 
    const [userRole, setUserRole] = useState('khach');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); 
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeModuleConfig, setActiveModuleConfig] = useState<ModuleConfig | null>(null);
    const [isAnyLevel2Open, setIsAnyLevel2Open] = useState(false);

    useEffect(() => {
        const init = async () => {
            const role = localStorage.getItem('USER_ROLE') || 'khach';
            setUserRole(role);
            setIsAdmin(role === 'admin'); 
            
            if (allowedRoles && !allowedRoles.includes(role)) setHasAccess(false);
            
            const { data: tables } = await supabase.rpc('get_manageable_tables');
            if (tables) setAvailableTables(tables.map((t: any) => t.table_name));
            
            await fetchGlobalLibrary();
            
            if (!configModule) {
                const { data: layout } = await supabase.from('dashboard_layouts').select('layout_json').eq('page_id', pageId).single();
                if (layout?.layout_json) setModules(layout.layout_json);
                else if (initialModules) setModules(initialModules);
            } else { setModules([configModule]); }
            
            setLoading(false);
        };
        init();
    }, [pageId, configModule]);

    // 🟢 SỬA LỖI: Load thư viện an toàn không gây lỗi 400
    const fetchGlobalLibrary = async () => {
        try {
            const { data: mods, error } = await supabase.from('global_modules').select('*');
            if (!error && mods) {
                const sortedMods = mods.sort((a: any, b: any) => 
                    new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime()
                );
                setGlobalModules(sortedMods);
            }

            const { data: usages } = await supabase.rpc('get_module_usage_locations');
            if (usages) {
                const map: Record<string, string[]> = {};
                usages.forEach((u: any) => { map[u.module_name] = u.used_in_pages; });
                setUsageMap(map);
            }
        } catch (err) { console.error("Lỗi thư viện:", err); }
    };

    const handleDeleteFromLibrary = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Xóa vĩnh viễn module "${name}" khỏi kho?`)) {
            const { error } = await supabase.from('global_modules').delete().eq('id', id);
            if (!error) setGlobalModules(prev => prev.filter(m => m.id !== id));
        }
    };

    useEffect(() => {
        const fetchCols = async () => {
            if (!newModuleData.table) { setTableColumns([]); return; }
            try {
                const { data } = await supabase.from(newModuleData.table).select('*').limit(1);
                if (data && data.length > 0) {
                    const keys = Object.keys(data[0]).filter(k => !['id', 'tao_luc', 'updated_at', 'nguoi_tao_id'].includes(k));
                    setTableColumns(keys);
                    if (!editingId) {
                        setNewModuleData(prev => ({
                            ...prev,
                            groupBy: keys.includes('vi_tri') ? 'vi_tri' : (keys.includes('trang_thai') ? 'trang_thai' : keys[0]),
                            titleField: keys.includes('ho_ten') ? 'ho_ten' : keys[0],
                            subField: keys[1] || keys[0],
                            buttonLabel: 'Truy Cập'
                        }));
                    }
                }
            } catch (e) { setTableColumns([]); }
        };
        fetchCols();
    }, [newModuleData.table]);

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
        setEditingId(id); setAddMode('new'); setMobileStep('form'); 
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

    const handleSaveLayout = async () => {
        if (configModule) return;
        setIsSaving(true);
        const { error } = await supabase.from('dashboard_layouts').upsert({ page_id: pageId, layout_json: modules, updated_at: new Date().toISOString() }, { onConflict: 'page_id' });
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleAddOrUpdateModule = async () => {
        if (!newModuleData.name || !newModuleData.table) return alert("Thiếu tên hoặc bảng!");
        const widgetData = { chartType: newModuleData.chartType as any, groupBy: newModuleData.groupBy, titleField: newModuleData.titleField, subField: newModuleData.subField, buttonLabel: newModuleData.buttonLabel, buttonColor: newModuleData.buttonColor };
        
        if (editingId) {
            setModules(prev => prev.map(m => m.id === editingId ? { ...m, tenModule: newModuleData.name, bangDuLieu: newModuleData.table, viewType: newModuleData.viewType as any, widgetData: widgetData, updatedAt: new Date().toISOString() } : m));
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
                version: '1.0', updatedAt: new Date().toISOString()
            };
            if (addMode === 'new') {
                await supabase.from('global_modules').insert({ name: newModuleData.name, table_name: newModuleData.table, type: 'generic' });
                fetchGlobalLibrary();
            }
            setModules(prev => [...prev, newModule]);
        }
        setIsAddModalOpen(false); setEditingId(null); 
    };
    
    const handleDelete = (id: string) => { if (confirm('Gỡ module?')) setModules(prev => prev.filter(m => m.id !== id)); };
    const handleResizeWidth = (id: string, delta: number) => { 
        setModules(prev => prev.map(m => m.id === id ? { ...m, doRong: Math.max(1, Math.min(4, (m.doRong || 1) + delta)) } : m)); 
    };
    const handleOpenDetail = (item: any, config: ModuleConfig) => { setDetailItem(item || {}); setActiveModuleConfig(config); setIsDetailOpen(true); };

    if (loading) return <div className="h-screen flex items-center justify-center bg-transparent pointer-events-none"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;
    if (!hasAccess) return <AccessDenied userRole={userRole} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.push('/')} />;

    return (
        // 🟢 CẬP NHẬT QUAN TRỌNG:
        // 1. Thêm id="dashboard-main-content" để ModuleItem tìm thấy và làm mờ.
        // 2. Thêm transition-opacity để hiệu ứng ẩn hiện mượt mà.
        <div 
            id="dashboard-main-content"
            className="min-h-screen bg-transparent text-[#E8D4B9] font-sans pt-[130px] pb-32 relative pointer-events-none transition-opacity duration-500 ease-in-out"
        >
            
            <GridArea modules={modules} isAdmin={isAdmin} onChange={(newModules) => setModules(newModules)} onEditModule={handleStartEdit} onDeleteModule={handleDelete} onResizeWidth={handleResizeWidth} onOpenDetail={handleOpenDetail} onLevel2Toggle={(isOpen) => setIsAnyLevel2Open(isOpen)} onAddModuleToRow={(rowId) => handleOpenAddModal(rowId)} forceHidden={false} />

            {!configModule && isAdmin && !isDetailOpen && !isAnyLevel2Open && (
                <NutModal danhSachTacVu={[{ id: 'save', icon: isSaving ? CheckCircle : Save, nhan: isSaving ? 'Đã Lưu!' : 'Lưu Cấu Hình', onClick: handleSaveLayout, mauSac: isSaving ? 'bg-green-600 border-green-500 text-white' : undefined }]} />
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-0 md:p-4 backdrop-blur-sm pointer-events-auto">
                    <div className="bg-[#161210] border border-[#8B5E3C]/30 rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-[85vh] shadow-2xl flex flex-col overflow-hidden">
                        <div className="shrink-0 p-4 border-b border-[#8B5E3C]/20 flex justify-between items-center bg-[#1a120f]">
                            <h3 className="text-xl font-bold text-[#F5E6D3] flex items-center gap-3">{editingId ? <Edit3 /> : <Layout />} {editingId ? 'Chỉnh Sửa Module' : 'Thêm Module'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#5D4037] hover:text-[#E8D4B9] bg-[#0a0807] p-2 rounded-full"><X size={24}/></button>
                        </div>
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* ... (Nội dung modal) ... */}
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
                                        <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Bảng Dữ Liệu</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 outline-none" value={newModuleData.table} onChange={(e) => setNewModuleData({...newModuleData, table: e.target.value})}><option value="">-- Chọn --</option>{availableTables.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {[
                                            {id: 'chart', label: 'Biểu Đồ', icon: BarChart3},
                                            {id: 'list', label: 'Danh Sách', icon: List},
                                            {id: 'stat', label: 'Số Liệu', icon: Hash},
                                            {id: 'button', label: 'Nút Bấm', icon: MousePointerClick},
                                            {id: 'direct_l2', label: 'Bảng', icon: AppWindow},
                                        ].map(type => (
                                            <div key={type.id} onClick={() => setNewModuleData({...newModuleData, viewType: type.id})} className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center gap-2 ${newModuleData.viewType === type.id ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'bg-[#0a0807] border-[#8B5E3C]/20 text-[#5D4037]'}`}><type.icon size={20} /><span className="font-bold text-[9px] uppercase">{type.label}</span></div>
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
                <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => setIsDetailOpen(false)} config={activeModuleConfig} initialData={detailItem} userRole={userRole} />
            )}
        </div>
    );
}