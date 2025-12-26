'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X, Database, Layout, Save, Globe, CheckCircle, BarChart3, List, Hash, MousePointerClick, AppWindow, Settings2, Trash2, MapPin, PieChart, Circle, Edit3 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule'; 
import { useRouter } from 'next/navigation';
import AccessDenied from './AccessDenied';
import GridArea from './GridArea';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/quanlynhansu/Level3/level3'; 
import NutModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NutModal';

interface Props { pageId: string; title: string; allowedRoles: string[]; initialModules?: ModuleConfig[]; hideAddButton?: boolean; configModule?: ModuleConfig; }

export default function DashboardBuilder({ pageId, title, allowedRoles, initialModules, hideAddButton = false, configModule }: Props) {
    const router = useRouter();
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    
    // Modal & Data
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<'library' | 'new'>('library');
    const [availableTables, setAvailableTables] = useState<string[]>([]);
    const [globalModules, setGlobalModules] = useState<any[]>([]); 
    const [usageMap, setUsageMap] = useState<Record<string, string[]>>({}); 
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
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
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAnyLevel2Open, setIsAnyLevel2Open] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const role = 'admin'; setUserRole(role); setIsAdmin(true); setCheckingAuth(false);
            if (allowedRoles && !allowedRoles.includes(role)) setHasAccess(false);
            const { data: tables } = await supabase.rpc('get_manageable_tables');
            if (tables) setAvailableTables(tables.map((t: any) => t.table_name));
            fetchGlobalLibrary();
            if (!configModule) {
                const { data: layout } = await supabase.from('dashboard_layouts').select('layout_json').eq('page_id', pageId).single();
                if (layout?.layout_json) setModules(layout.layout_json);
                else if (initialModules) setModules(initialModules);
            } else { setModules([configModule]); }
            setLoading(false);
        };
        init();
    }, [pageId, configModule]);

    const fetchGlobalLibrary = async () => {
        const { data: mods } = await supabase.from('global_modules').select('*').order('created_at', { ascending: false });
        if (mods) setGlobalModules(mods);
        const { data: usages } = await supabase.rpc('get_module_usage_locations');
        if (usages) {
            const map: Record<string, string[]> = {};
            usages.forEach((u: any) => { map[u.module_name] = u.used_in_pages; });
            setUsageMap(map);
        }
    };

    const handleDeleteFromLibrary = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`CẢNH BÁO: Xóa vĩnh viễn module "${name}" khỏi kho?`)) {
            const { error } = await supabase.from('global_modules').delete().eq('id', id);
            if (!error) setGlobalModules(prev => prev.filter(m => m.id !== id));
            else alert("Lỗi xóa: " + error.message);
        }
    };

    useEffect(() => {
        const fetchCols = async () => {
            if (!newModuleData.table) { setTableColumns([]); return; }
            const { data } = await supabase.from(newModuleData.table).select('*').limit(1);
            if (data && data.length > 0) {
                const keys = Object.keys(data[0]).filter(k => !['id', 'created_at', 'updated_at', 'nguoi_tao_id'].includes(k));
                setTableColumns(keys);
                if (!editingId) {
                    setNewModuleData(prev => ({
                        ...prev,
                        groupBy: keys.includes('trang_thai') ? 'trang_thai' : keys[0],
                        titleField: keys.includes('ho_ten') ? 'ho_ten' : keys[0],
                        subField: keys[1] || keys[0],
                        buttonLabel: 'Truy Cập'
                    }));
                }
            }
        };
        fetchCols();
    }, [newModuleData.table]);

    const handleOpenAddModal = (rowId?: string) => { 
        setActiveRowId(rowId || 'row_default'); 
        setEditingId(null); 
        setNewModuleData({ name: '', table: '', viewType: 'chart', chartType: 'Pie', groupBy: '', titleField: '', subField: '', buttonLabel: '', buttonColor: '#C69C6D' });
        setIsAddModalOpen(true); 
    };

    const handleStartEdit = (id: string) => {
        const targetModule = modules.find(m => m.id === id);
        if (!targetModule) return;
        setEditingId(id); setAddMode('new'); setIsAddModalOpen(true);
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
        if (error) alert('Lỗi: ' + error.message);
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
    
    // 🟢 FIX LỖI TẠI ĐÂY: Cho phép max 4 cột (thay vì 2)
    const handleResizeWidth = (id: string, delta: number) => { 
        setModules(prev => prev.map(m => m.id === id ? { 
            ...m, 
            doRong: Math.max(1, Math.min(4, (m.doRong || 1) + delta)) // Sửa số 2 thành số 4
        } : m)); 
    };
    
    const handleOpenDetail = (item: any, config: ModuleConfig) => { setDetailItem(item || {}); setActiveModuleConfig(config); setIsDetailOpen(true); };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0807]"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;
    if (!hasAccess) return <AccessDenied userRole={userRole} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.push('/')} />;

    return (
        <div className="min-h-screen bg-[#0a0807] text-[#E8D4B9] font-sans pb-20 relative">
            <GridArea 
                modules={modules} isAdmin={isAdmin} 
                onChange={(newModules) => setModules(newModules)}
                onEditModule={handleStartEdit} 
                onDeleteModule={handleDelete}
                onResizeWidth={handleResizeWidth}
                onOpenDetail={handleOpenDetail} 
                onLevel2Toggle={(isOpen) => setIsAnyLevel2Open(isOpen)}
                onAddModuleToRow={(rowId) => handleOpenAddModal(rowId)}
                forceHidden={false} 
            />

            {!configModule && isAdmin && !isDetailOpen && !isAnyLevel2Open && (
                <NutModal 
                    danhSachTacVu={[
                        { id: 'save', icon: isSaving ? CheckCircle : Save, nhan: isSaving ? 'Đã Lưu!' : 'Lưu Cấu Hình', onClick: handleSaveLayout, mauSac: isSaving ? 'bg-green-600 border-green-500 text-white' : undefined },
                    ]} 
                />
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-[#161210] border border-[#8B5E3C]/30 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl p-0 relative flex flex-col overflow-hidden">
                        <div className="shrink-0 p-6 border-b border-[#8B5E3C]/20 flex justify-between items-center bg-[#1a120f]">
                            <h3 className="text-2xl font-bold text-[#F5E6D3] flex items-center gap-3">
                                {editingId ? <Edit3 className="text-[#C69C6D]" /> : <Layout className="text-[#C69C6D]" />}
                                {editingId ? 'Chỉnh Sửa Module' : 'Thêm Module Mới'}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#5D4037] hover:text-[#E8D4B9] bg-[#0a0807] p-2 rounded-full"><X size={24}/></button>
                        </div>
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-1/3 border-r border-[#8B5E3C]/20 flex flex-col bg-[#0a0807]/50">
                                <div className="flex border-b border-[#8B5E3C]/20">
                                    <button onClick={() => setAddMode('library')} disabled={!!editingId} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider ${addMode === 'library' ? 'bg-[#C69C6D]/10 text-[#C69C6D] border-b-2 border-[#C69C6D]' : 'text-[#5D4037] hover:bg-white/5'} ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}><Globe size={14} className="inline mb-1 mr-2"/>Thư Viện</button>
                                    <button onClick={() => setAddMode('new')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider ${addMode === 'new' ? 'bg-[#C69C6D]/10 text-[#C69C6D] border-b-2 border-[#C69C6D]' : 'text-[#5D4037] hover:bg-white/5'}`}><Plus size={14} className="inline mb-1 mr-2"/>{editingId ? 'Cấu Hình' : 'Tạo Mới'}</button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scroll p-4">
                                     {addMode === 'library' && (
                                         <div className="space-y-3">
                                            {globalModules.length === 0 && <p className="text-center text-[#5D4037] text-xs">Kho trống</p>}
                                            {globalModules.map((mod) => {
                                                const usedIn = usageMap[mod.name] || [];
                                                return (
                                                    <div key={mod.id} onClick={() => { setNewModuleData(prev => ({...prev, name: mod.name, table: mod.table_name})); setAddMode('new'); }} className="p-4 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl hover:border-[#C69C6D] mb-2 cursor-pointer group relative">
                                                        <div className="font-bold text-[#E8D4B9] group-hover:text-[#C69C6D]">{mod.name}</div>
                                                        <div className="text-xs text-[#5D4037] mt-1">{mod.table_name}</div>
                                                        {usedIn.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{usedIn.map(p => <span key={p} className="text-[9px] px-1.5 py-0.5 bg-[#8B5E3C]/20 text-[#8B5E3C] rounded border border-[#8B5E3C]/20 flex items-center gap-1"><MapPin size={8}/> {p}</span>)}</div>}
                                                        <button onClick={(e) => handleDeleteFromLibrary(mod.id, mod.name, e)} className="absolute top-2 right-2 p-1.5 text-[#5D4037] hover:text-red-500 hover:bg-red-900/20 rounded transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                                    </div>
                                                );
                                            })}
                                         </div>
                                     )}
                                     {addMode === 'new' && <div className="p-4 text-center text-[#5D4037] text-sm mt-10">{editingId ? 'Đang chỉnh sửa module...' : 'Nhập thông tin bên phải.'}</div>}
                                </div>
                            </div>
                            <div className="w-2/3 p-8 overflow-y-auto custom-scroll bg-[#161210]">
                                <div className="space-y-8 max-w-2xl mx-auto">
                                    <div className="space-y-4">
                                        <h4 className="text-[#C69C6D] font-bold text-sm uppercase tracking-widest border-b border-[#8B5E3C]/20 pb-2 mb-4">1. Thông tin</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Tên Module</label><input type="text" className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.name} onChange={(e) => setNewModuleData({...newModuleData, name: e.target.value})} /></div>
                                            <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Bảng Dữ Liệu</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.table} onChange={(e) => setNewModuleData({...newModuleData, table: e.target.value})}><option value="">-- Chọn --</option>{availableTables.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[#C69C6D] font-bold text-sm uppercase tracking-widest border-b border-[#8B5E3C]/20 pb-2 mb-4">2. Kiểu hiển thị</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                {id: 'chart', label: 'Biểu Đồ', icon: BarChart3},
                                                {id: 'list', label: 'Danh Sách', icon: List},
                                                {id: 'stat', label: 'Số Liệu', icon: Hash},
                                                {id: 'button', label: 'Nút Bấm', icon: MousePointerClick},
                                                {id: 'direct_l2', label: 'Bảng Trực Tiếp', icon: AppWindow},
                                            ].map(type => (
                                                <div key={type.id} onClick={() => setNewModuleData({...newModuleData, viewType: type.id})} className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${newModuleData.viewType === type.id ? 'bg-[#C69C6D]/20 border-[#C69C6D] text-[#C69C6D]' : 'bg-[#0a0807] border-[#8B5E3C]/20 text-[#5D4037]'}`}><type.icon size={20} /><span className="font-bold text-[10px] uppercase">{type.label}</span></div>
                                            ))}
                                        </div>
                                    </div>
                                    {newModuleData.table && (
                                        <div className="space-y-4 animate-in fade-in">
                                            <h4 className="text-[#C69C6D] font-bold text-sm uppercase tracking-widest border-b border-[#8B5E3C]/20 pb-2 mb-4">3. Cấu hình nội dung</h4>
                                            {newModuleData.viewType === 'chart' && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Loại Biểu Đồ</label><div className="flex bg-[#0a0807] p-1 rounded-lg border border-[#8B5E3C]/30">{['Pie', 'Donut', 'Bar'].map(ct => <button key={ct} onClick={() => setNewModuleData({...newModuleData, chartType: ct})} className={`flex-1 py-2 text-xs font-bold rounded ${newModuleData.chartType === ct ? 'bg-[#C69C6D] text-black' : 'text-[#5D4037] hover:text-[#E8D4B9]'}`}>{ct}</button>)}</div></div>
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Phân nhóm theo</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.groupBy} onChange={(e) => setNewModuleData({...newModuleData, groupBy: e.target.value})}>{tableColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                </div>
                                            )}
                                            {newModuleData.viewType === 'list' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Tiêu đề</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.titleField} onChange={(e) => setNewModuleData({...newModuleData, titleField: e.target.value})}>{tableColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Phụ đề</label><select className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.subField} onChange={(e) => setNewModuleData({...newModuleData, subField: e.target.value})}>{tableColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                </div>
                                            )}
                                            {newModuleData.viewType === 'button' && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Nhãn Nút</label><input type="text" className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg px-4 py-3 text-[#E8D4B9] outline-none" value={newModuleData.buttonLabel} onChange={(e) => setNewModuleData({...newModuleData, buttonLabel: e.target.value})}/></div>
                                                    <div><label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-2">Màu Sắc</label><input type="color" className="w-full h-12 bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg cursor-pointer" value={newModuleData.buttonColor} onChange={(e) => setNewModuleData({...newModuleData, buttonColor: e.target.value})}/></div>
                                                </div>
                                            )}
                                            {newModuleData.viewType === 'direct_l2' && <p className="text-sm text-[#5D4037] italic">Toàn bộ danh sách dữ liệu (Level 2) sẽ được hiển thị ngay trên Grid.</p>}
                                        </div>
                                    )}
                                    <div className="pt-6"><button onClick={handleAddOrUpdateModule} className="w-full bg-[#C69C6D] text-[#1a120f] font-bold py-4 rounded-xl text-sm hover:bg-[#b08b5e] shadow-xl">{editingId ? 'CẬP NHẬT THAY ĐỔI' : 'HOÀN TẤT & THÊM'}</button></div>
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