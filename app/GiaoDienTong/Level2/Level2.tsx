'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../KieuDuLieuModule';
import { useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';

// Import Sub-components
import ControlBar from './ControlBar';
import TableView from './TableView';
import CardView from './CardView';
import KanbanView from './KanbanView';
import Level3_FormChiTiet from '../Level3_FormChiTiet';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
}

export default function Level2_DanhSachModal({ isOpen, onClose, config }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card' | 'kanban'>('table');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const ITEMS_PER_PAGE = 20;
    const [kanbanGroupBy, setKanbanGroupBy] = useState<string>(''); 
    
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [userRole, setUserRole] = useState('user'); 
    const [isSyncing, setIsSyncing] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        const checkRole = () => {
            const laAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
            if (laAdmin) { setUserRole('admin'); return; }
            const stored = localStorage.getItem('USER_INFO');
            if (stored) { try { const u = JSON.parse(stored); setUserRole(u.role || 'user'); } catch(e) { setUserRole('user'); } } 
            else { const roleOnly = localStorage.getItem('USER_ROLE'); if (roleOnly) setUserRole(roleOnly); }
        };
        checkRole();

        if (isOpen && config.bangDuLieu) {
            setPage(1);
            fetchData(1);
            if(config.kieuHienThiList) setViewMode(config.kieuHienThiList as any);
            const defaultGroup = config.danhSachCot?.find(c => ['status','trang_thai','vi_tri','position','loai','type'].some(k => c.key.toLowerCase().includes(k)))?.key;
            if(defaultGroup) setKanbanGroupBy(defaultGroup);
        }
    }, [isOpen, config]);

    const fetchData = async (pageNumber: number) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            let query = supabase.from(config.bangDuLieu).select('*', { count: 'exact' });
            if (search.trim()) {
                const searchCol = config.danhSachCot?.find(c => c.key.toLowerCase().includes('ten'))?.key || config.danhSachCot?.[0]?.key || 'id';
                query = query.ilike(searchCol, `%${search}%`);
            }
            query = query.order('created_at', { ascending: false });
            const { data: result, count, error } = await query.range(from, to);
            if (error) { console.error(error); } else { setData(result || []); setTotal(count || 0); }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleKanbanDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event; if (!over) return;
        const itemId = active.id as string; const newGroupValue = over.id as string;
        const oldData = [...data]; 
        setData(prev => prev.map(item => String(item.id) === itemId ? { ...item, [kanbanGroupBy]: newGroupValue } : item));
        try { await supabase.from(config.bangDuLieu).update({ [kanbanGroupBy]: newGroupValue }).eq('id', itemId); } catch (err) { console.error(err); setData(oldData); }
    };

    const handleSyncUsers = async () => {
        if (!confirm('Tiếp tục đồng bộ dữ liệu nhân sự?')) return;
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync-users', { method: 'POST' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            alert(`Xong: Thêm ${result.added}, Sửa ${result.updated}, Xóa ${result.deleted}`);
            fetchData(1);
        } catch (err: any) { alert(`Lỗi: ${err.message}`); } finally { setIsSyncing(false); }
    };

    if (!isOpen) return null;

    let columns = config.danhSachCot?.filter(c => c.hienThiList) || [];
    if (columns.length === 0 && data.length > 0) {
        columns = Object.keys(data[0]).map(k => ({ 
            key: k, label: k, kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, batBuoc: false, tuDong: false
        }));
    }

    const imgCol = columns.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key));
    const titleCol = columns[0] || { key: 'id' };
    const canEdit = ['admin', 'adminsystem', 'quanly', 'manager', 'admin_cung'].some(r => userRole.includes(r));

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(60px,15vw,80px)] z-[980] flex flex-col bg-[#110d0c]/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 border-b border-[#8B5E3C]/30 shadow-2xl">
            <style jsx>{` .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scroll::-webkit-scrollbar-track { background: #1a120f; } .custom-scroll::-webkit-scrollbar-thumb { background: #8B5E3C; border-radius: 4px; } `}</style>

            {/* 🟢 NEW CONTROL BAR (ALL IN ONE) */}
            <ControlBar 
                config={config} total={total} page={page} itemsPerPage={ITEMS_PER_PAGE}
                search={search} setSearch={setSearch} onEnter={() => fetchData(1)}
                viewMode={viewMode} setViewMode={setViewMode}
                kanbanGroupBy={kanbanGroupBy} setKanbanGroupBy={setKanbanGroupBy}
                onPageChange={(p) => { setPage(p); fetchData(p); }}
                canEdit={canEdit} isSyncing={isSyncing} onSync={handleSyncUsers}
                onAdd={() => { setSelectedItem(null); setIsLevel3Open(true); }}
                onClose={onClose}
            />

            {/* CONTENT (Full height trừ ControlBar) */}
            <div className="flex-1 overflow-hidden bg-[#0a0807] relative flex flex-col custom-scroll">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 gap-3 backdrop-blur-[2px]">
                        <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
                        <span className="text-[#A1887F] text-xs font-mono tracking-widest animate-pulse">ĐANG TẢI...</span>
                    </div>
                )}
                
                {data.length === 0 && !loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#5D4037] gap-4">
                        <Search size={48} className="opacity-50"/>
                        <span className="text-sm font-bold uppercase tracking-widest">Không tìm thấy dữ liệu</span>
                    </div>
                ) : (
                    <div className="h-full w-full overflow-hidden">
                        {viewMode === 'table' && <TableView data={data} columns={columns} page={page} itemsPerPage={ITEMS_PER_PAGE} onRowClick={(item) => { setSelectedItem(item); setIsLevel3Open(true); }} />}
                        {viewMode === 'card' && <CardView data={data} columns={columns} imgCol={imgCol} titleCol={titleCol} canEdit={canEdit} onRowClick={(item) => { setSelectedItem(item); setIsLevel3Open(true); }} />}
                        {viewMode === 'kanban' && <KanbanView data={data} kanbanGroupBy={kanbanGroupBy} columns={columns} imgCol={imgCol} titleCol={titleCol} sensors={sensors} onDragEnd={handleKanbanDragEnd} onRowClick={(item) => { setSelectedItem(item); setIsLevel3Open(true); }} canEdit={canEdit} />}
                    </div>
                )}
            </div>

            <Level3_FormChiTiet 
                isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} 
                onSuccess={() => fetchData(page)} 
                config={config} initialData={selectedItem} userRole={userRole}
            />
        </div>
    );
}