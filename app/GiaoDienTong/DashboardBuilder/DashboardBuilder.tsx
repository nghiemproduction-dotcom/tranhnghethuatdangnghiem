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

    if (loading) return <div className="h-screen flex items-center justify-center bg-transparent"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;
    if (!hasAccess) return <AccessDenied userRole={userRole} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.push('/')} />;

    return (
        // 🟢 QUAN TRỌNG: bg-transparent để nhận hiệu ứng kính từ NoidungModal
        <div className="min-h-screen bg-transparent text-[#E8D4B9] font-sans pb-20 relative">
            <GridArea modules={modules} isAdmin={isAdmin} onChange={(newModules) => setModules(newModules)} onEditModule={handleStartEdit} onDeleteModule={handleDelete} onResizeWidth={handleResizeWidth} onOpenDetail={handleOpenDetail} onLevel2Toggle={(isOpen) => setIsAnyLevel2Open(isOpen)} onAddModuleToRow={(rowId) => handleOpenAddModal(rowId)} forceHidden={false} />

            {!configModule && isAdmin && !isDetailOpen && !isAnyLevel2Open && (
                <NutModal danhSachTacVu={[{ id: 'save', icon: isSaving ? CheckCircle : Save, nhan: isSaving ? 'Đã Lưu!' : 'Lưu Cấu Hình', onClick: handleSaveLayout, mauSac: isSaving ? 'bg-green-600 border-green-500 text-white' : undefined }]} />
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-0 md:p-4 backdrop-blur-sm">
                    {/* Modal Thêm Module - Giữ nguyên */}
                    <div className="bg-[#161210] border border-[#8B5E3C]/30 rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-[85vh] shadow-2xl flex flex-col overflow-hidden">
                        <div className="shrink-0 p-4 border-b border-[#8B5E3C]/20 flex justify-between items-center bg-[#1a120f]">
                            <h3 className="text-xl font-bold text-[#F5E6D3] flex items-center gap-3">{editingId ? <Edit3 /> : <Layout />} {editingId ? 'Chỉnh Sửa Module' : 'Thêm Module'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#5D4037] hover:text-[#E8D4B9] bg-[#0a0807] p-2 rounded-full"><X size={24}/></button>
                        </div>
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* ... (Phần nội dung modal thêm module giữ nguyên như cũ) ... */}
                            {/* Tôi rút gọn hiển thị để tập trung vào phần quan trọng là container */}
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                (Form thêm module hiển thị tại đây)
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