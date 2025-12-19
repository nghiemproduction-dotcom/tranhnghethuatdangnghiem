'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule'; 
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';

// Import Components
import AccessDenied from './AccessDenied';
import TopBar from './TopBar';
import GridArea from './GridArea';
import ModalTaoModule from '../ModalTaoModule/ModalTaoModule';
import MenuDuoi from '../MenuDuoi';
import Level3_FormChiTiet from '../Level3_FormChiTiet';
import ModalCauHinhCot from './ModalCauHinhCot'; 

interface Props {
    pageId: string; 
    title: string;
    allowedRoles: string[]; 
    initialModules?: ModuleConfig[]; 
    hideAddButton?: boolean; 
}

export default function DashboardBuilder({ pageId, title, allowedRoles, initialModules, hideAddButton = false }: Props) {
    const router = useRouter();
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfigColOpen, setIsConfigColOpen] = useState(false); 
    const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    
    // Security States
    const [isAdmin, setIsAdmin] = useState(false); 
    const [hasAccess, setHasAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [redirectPath, setRedirectPath] = useState('/phongtrungbay');
    const [userRoleDisplay, setUserRoleDisplay] = useState('');

    // Detail State
    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConfig, setDetailConfig] = useState<ModuleConfig | any>(null);

    const getSmartRedirectPath = (role: string): string => {
        const r = role.toLowerCase();
        if (r.includes('admin') || r.includes('quantri')) return '/phongadmin';
        if (r.includes('quanly') || r.includes('manager')) return '/phongquanly';
        if (r.includes('thietke') || r.includes('designer') || r.includes('hoasi')) return '/phongthietke';
        if (r.includes('sale') || r.includes('kinhdoanh')) return '/phongsales';
        if (r.includes('tho') || r.includes('kythuat')) return '/phongtho';
        if (r.includes('ctv') || r.includes('congtac')) return '/phongctv';
        return '/phongtrungbay';
    };

    useEffect(() => {
        const verifyAccess = () => {
            setIsChecking(true);
            if (typeof window === 'undefined') return;

            const storedRole = localStorage.getItem('USER_ROLE');
            const storedInfo = localStorage.getItem('USER_INFO');

            let currentUserRole = 'khach';
            if (storedRole && storedRole.trim() !== '' && storedInfo) currentUserRole = storedRole;
            
            setUserRoleDisplay(currentUserRole);
            setRedirectPath(getSmartRedirectPath(currentUserRole));

            const laAdminCung = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
            
            if (laAdminCung || currentUserRole.includes('admin') || currentUserRole.includes('adminsystem')) {
                setHasAccess(true); setIsAdmin(true); setIsChecking(false); return; 
            }

            const isGuest = currentUserRole === 'khach';
            const isRoomOpenForGuest = allowedRoles.some(r => r === 'khach');

            if (isGuest && !isRoomOpenForGuest) { setAccessDenied(true); setIsChecking(false); return; }

            const isAllowed = allowedRoles.some(allowed => currentUserRole.includes(allowed) || allowed.includes(currentUserRole));

            if (isAllowed) {
                setHasAccess(true);
                const builderRoles = ['admin', 'adminsystem', 'admin_cung', 'boss'];
                const canEdit = builderRoles.some(r => currentUserRole.includes(r));
                setIsAdmin(canEdit);
            } else { setAccessDenied(true); }
            
            setIsChecking(false);
        };
        verifyAccess();
    }, [pageId, allowedRoles, title]);

    useEffect(() => {
        if (!hasAccess) return;
        if (initialModules && initialModules.length > 0) { setModules(initialModules); return; }

        const loadModules = async () => {
            const { data } = await supabase.from('cau_hinh_modules').select('*').eq('page_id', pageId).order('created_at', { ascending: true });
            if (data) setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
        };
        loadModules();
    }, [pageId, hasAccess, initialModules]);

    const handleSaveModule = async (config: ModuleConfig) => {
        if (!isAdmin) return;
        let updatedModules = [...modules];
        const idx = modules.findIndex(m => m.id === config.id);
        
        const existingRowId = idx >= 0 ? modules[idx].rowId : activeRowId;
        const rowId = config.rowId || existingRowId || 'default';
        const rowModules = modules.filter(m => (m.rowId || 'default') === rowId);
        const currentH = rowModules.length > 0 ? (rowModules[0].rowHeight || 250) : 250;

        const newConfig = { 
            ...config, rowId: rowId, rowHeight: currentH, doRong: config.doRong || 1, page_id: pageId
        };

        if (idx >= 0) updatedModules[idx] = newConfig; else updatedModules.push(newConfig);
        
        setModules(updatedModules);
        setActiveRowId(null);

        if (!initialModules) {
            await supabase.from('cau_hinh_modules').upsert({ module_id: newConfig.id, page_id: pageId, config_json: newConfig });
        }
    };

    const handleSaveColumnConfig = async (newConfig: ModuleConfig) => {
        if (!isAdmin) return;
        const updatedModules = modules.map(m => m.id === newConfig.id ? newConfig : m);
        setModules(updatedModules);
        if (!initialModules) {
            const { error } = await supabase.from('cau_hinh_modules').update({ config_json: newConfig }).eq('module_id', newConfig.id);
            if (error) alert("Lỗi lưu: " + error.message);
        }
        setEditingModule(null);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if(!confirm('Xóa module này?')) return;
        setModules(prev => prev.filter(m => m.id !== id));
        if (!initialModules) await supabase.from('cau_hinh_modules').delete().eq('module_id', id);
    };

    if (isChecking) return <div className="min-h-screen bg-[#111] flex items-center justify-center text-[#C69C6D]"><Loader2 className="animate-spin mr-2"/> Kiểm tra quyền...</div>;

    if (accessDenied) return <AccessDenied userRole={userRoleDisplay} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.replace(redirectPath)} />;

    if (!hasAccess) return null;

    return (
        <div className="min-h-screen bg-[#111111] text-white w-full font-sans bg-[url('/noise.png')] bg-repeat opacity-95">
            <TopBar title={title} isAdmin={isAdmin} />
            
            <GridArea 
                modules={modules} isAdmin={isAdmin} 
                onDragEnd={(e) => {
                    const { active, over } = e;
                    if (over && active.id !== over.id) {
                        setModules((items) => {
                            const oldIndex = items.findIndex((item) => item.id === active.id);
                            const newIndex = items.findIndex((item) => item.id === over.id);
                            return arrayMove(items, oldIndex, newIndex);
                        });
                    }
                }}
                onAddToRow={(rid) => { setActiveRowId(rid); setEditingModule(null); setIsModalOpen(true); }}
                onCreateNewRow={() => { setActiveRowId(`row_${Date.now()}`); setEditingModule(null); setIsModalOpen(true); }}
                onResizeRow={(rid, delta) => {
                    const currentMods = modules.filter(m => (m.rowId || 'default') === rid);
                    const curH = currentMods[0]?.rowHeight || 250;
                    const newH = Math.max(150, Math.min(800, curH + delta));
                    setModules(prev => prev.map(m => (m.rowId || 'default') === rid ? { ...m, rowHeight: newH } : m));
                    if (!initialModules && currentMods.length > 0) {
                        currentMods.forEach(m => supabase.from('cau_hinh_modules').update({ config_json: { ...m, rowHeight: newH } }).eq('module_id', m.id).then());
                    }
                }}
                onResizeWidth={(id, delta) => {
                    setModules(prev => prev.map(m => {
                        if (m.id !== id) return m;
                        const newW = Math.max(1, Math.min(2, (m.doRong || 1) + delta));
                        if (!initialModules) supabase.from('cau_hinh_modules').update({ config_json: { ...m, doRong: newW } }).eq('module_id', id).then();
                        return { ...m, doRong: newW };
                    }));
                }}
                onDeleteModule={handleDelete}
                onEditModule={(mod) => { 
                    setEditingModule(mod); 
                    // 🟢 NẾU LÀ CUSTOM -> MỞ MODAL TAO MODULE ĐỂ SỬA TÊN/LOẠI
                    if (mod.moduleType === 'custom') setIsModalOpen(true);
                    // 🟢 NẾU LÀ GENERIC -> MỞ MODAL CẤU HÌNH CỘT
                    else setIsConfigColOpen(true); 
                }}
            />

            <ModalTaoModule 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveModule} 
                initialConfig={editingModule} 
                pageId={pageId}
            />

            {editingModule && editingModule.moduleType !== 'custom' && (
                <ModalCauHinhCot 
                    isOpen={isConfigColOpen} 
                    onClose={() => setIsConfigColOpen(false)} 
                    module={editingModule}
                    onSave={handleSaveColumnConfig}
                />
            )}

            {!hideAddButton && (
                <MenuDuoi onAdd={isAdmin ? () => { setActiveRowId(`row_${Date.now()}`); setIsModalOpen(true); } : undefined} /> 
            )}
            
            {isDetailOpen && detailConfig && (
                <Level3_FormChiTiet isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} onSuccess={() => {}} config={detailConfig} initialData={detailItem} userRole={isAdmin ? 'admin' : 'user'}/>
            )}
        </div>
    );
}