'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from './KieuDuLieuModule'; 
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';

import AccessDenied from './AccessDenied';
import GridArea from './GridArea';
import MenuDuoi from '../MenuDuoi/MenuDuoi';
import Level3_FormChiTiet from '../Level3_FormChiTiet'; 

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
    
    const [activeRowId, setActiveRowId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false); 
    const [hasAccess, setHasAccess] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [redirectPath, setRedirectPath] = useState('/phongtrungbay');
    const [userRoleDisplay, setUserRoleDisplay] = useState('');

    const [detailItem, setDetailItem] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailConfig, setDetailConfig] = useState<ModuleConfig | any>(null);

    // Logic kiểm tra quyền (Giữ nguyên)
    const getSmartRedirectPath = (role: string): string => {
        const r = role.toLowerCase();
        if (r.includes('admin') || r.includes('quantri')) return '/phongadmin';
        if (r.includes('quanly') || r.includes('manager')) return '/phongquanly';
        if (r.includes('thietke') || r.includes('designer') || r.includes('hoasi')) return '/phongthietke';
        return '/phongtrungbay';
    };

    useEffect(() => {
        const verifyAccess = () => {
            setIsChecking(true);
            if (typeof window === 'undefined') return;

            const storedRole = localStorage.getItem('USER_ROLE');
            const laAdminCung = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
            let currentUserRole = storedRole || 'khach';
            
            setUserRoleDisplay(currentUserRole);
            setRedirectPath(getSmartRedirectPath(currentUserRole));

            if (laAdminCung || currentUserRole.includes('admin')) {
                setHasAccess(true); setIsAdmin(true); setIsChecking(false); return; 
            }

            const isAllowed = allowedRoles.some(allowed => currentUserRole.includes(allowed));
            if (isAllowed) {
                setHasAccess(true);
                const builderRoles = ['admin', 'adminsystem', 'admin_cung', 'boss'];
                setIsAdmin(builderRoles.some(r => currentUserRole.includes(r)));
            } else { setAccessDenied(true); }
            
            setIsChecking(false);
        };
        verifyAccess();
    }, [pageId, allowedRoles]);

    useEffect(() => {
        if (!hasAccess) return;
        if (initialModules && initialModules.length > 0) { setModules(initialModules); return; }

        const loadModules = async () => {
            const { data } = await supabase.from('cau_hinh_modules')
                .select('*')
                .eq('page_id', pageId)
                .order('created_at', { ascending: true });
            
            if (data) {
                setModules(data.map((row: any) => ({ ...row.config_json, id: row.module_id })));
            }
        };
        loadModules();
    }, [pageId, hasAccess]);

    // Các hàm xử lý (Giữ nguyên)
    const handleCreateQuickModule = async () => {
        if (!isAdmin) return;
        const newId = `mod_${Date.now()}`;
        const newModule: ModuleConfig = {
            id: newId, tenModule: 'Custom Module Mới', moduleType: 'custom', customId: 'custom_new', 
            bangDuLieu: '', danhSachCot: [], doRong: 1, rowHeight: 300, 
            rowId: activeRowId || `row_${Date.now()}`, page_id: pageId, version: '1.0', updatedAt: new Date().toISOString()
        };
        setModules(prev => [...prev, newModule]);
        await supabase.from('cau_hinh_modules').insert({ module_id: newId, page_id: pageId, config_json: newModule, version: '1.0' });
    };

    const handleEditModule = async (mod: ModuleConfig) => {
        const newName = prompt("Đổi tên hiển thị:", mod.tenModule);
        if (newName === null) return;
        const newCustomId = prompt("Nhập Custom ID:", mod.customId);
        const updatedMod = { ...mod, tenModule: newName || mod.tenModule, customId: newCustomId || mod.customId };
        setModules(prev => prev.map(m => m.id === mod.id ? updatedMod : m));
        await supabase.from('cau_hinh_modules').update({ config_json: updatedMod }).eq('module_id', mod.id);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if(!confirm('Xóa module này vĩnh viễn?')) return;
        setModules(prev => prev.filter(m => m.id !== id));
        await supabase.from('cau_hinh_modules').delete().eq('module_id', id);
    };

    // 🟢 SỬA LOADING: Bỏ min-h-screen, dùng h-full để không bị tràn modal
    if (isChecking) return <div className="h-full w-full flex items-center justify-center text-[#C69C6D]"><Loader2 className="animate-spin mr-2"/> Checking...</div>;
    
    if (accessDenied) return <AccessDenied userRole={userRoleDisplay} targetTitle={title} allowedRoles={allowedRoles} onRedirect={() => router.replace(redirectPath)} />;
    if (!hasAccess) return null;

    return (
        // 🟢 CSS FIX:
        // 1. bg-transparent: Xóa nền xám, để lộ nền modal bên dưới
        // 2. min-h-full: Thay cho min-h-screen để vừa vặn trong modal
        // 3. pt-2: Giảm khoảng cách phía trên (để module sát với thanh điều hướng hơn)
        <div className="w-full min-h-full bg-transparent text-white font-sans pt-2 pb-10">
            
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
                onAddToRow={(rid) => { setActiveRowId(rid); handleCreateQuickModule(); }}
                onCreateNewRow={() => { setActiveRowId(`row_${Date.now()}`); handleCreateQuickModule(); }}
                onResizeRow={(rid, delta) => {
                    setModules(prev => prev.map(m => (m.rowId || 'default') === rid ? { ...m, rowHeight: (m.rowHeight || 250) + delta } : m));
                }}
                onResizeWidth={(id, delta) => {
                    setModules(prev => prev.map(m => m.id === id ? { ...m, doRong: Math.max(1, Math.min(2, (m.doRong || 1) + delta)) } : m));
                }}
                onDeleteModule={handleDelete}
                onEditModule={handleEditModule}
            />

            {!hideAddButton && isAdmin && (
                <MenuDuoi /> 
            )}
            
            {isDetailOpen && detailConfig && (
                <Level3_FormChiTiet 
                    isOpen={isDetailOpen} 
                    onClose={() => setIsDetailOpen(false)} 
                    onSuccess={() => {}} 
                    config={detailConfig} 
                    initialData={detailItem} 
                    userRole={isAdmin ? 'admin' : 'user'}
                />
            )}
        </div>
    );
}