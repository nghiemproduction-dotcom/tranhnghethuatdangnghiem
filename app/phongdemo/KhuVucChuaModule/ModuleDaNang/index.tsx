'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { Loader2, AlertCircle, Maximize2, TrendingUp } from 'lucide-react';
import { ModuleConfig, CustomAction } from '../KieuDuLieuModule';

// 🟢 FIX: Bỏ ButtonView, Thêm BarView và KanbanWidget
import { ChartView, MetricView, ListView, BarView, KanbanWidget } from './WidgetHienThi';

import { DanhSachModal } from './DanhSachModal';
import ChiTietModal from './ChiTietModal';

export default function ModuleDaNang({ config }: { config: ModuleConfig }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // State Phân Quyền
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canEdit: false,
        canDelete: false
    });

    // Modal State
    const [isListOpen, setIsListOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('USER_ROLE');
        const isHardAdmin = localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        const isAdminRole = isHardAdmin || role === 'admin';
        const isManager = role === 'quanly';

        setIsAdmin(isAdminRole);

        setPermissions({
            canCreate: isAdminRole || isManager,
            canEdit: isAdminRole || isManager,   
            canDelete: isAdminRole               
        });

        fetchData();
    }, [config]);

    const fetchData = async () => {
        if (!config.tableName) return;
        setLoading(true);
        let query = supabase.from(config.tableName).select('*').order('created_at', { ascending: false });
        if (config.filterColumn && config.filterValue) query = query.eq(config.filterColumn, config.filterValue);
        const { data: res, error: err } = await query.limit(200); 
        if (err) setError('Lỗi kết nối');
        else setData(res || []);
        setLoading(false);
    };

    const handleOpenDetail = (item: any) => {
        setEditingRow(item);
        setIsCreating(false);
        setIsDetailOpen(true);
    };

    const handleCreateNew = () => {
        const sample = data.length > 0 ? { ...data[0] } : {};
        Object.keys(sample).forEach(k => sample[k] = '');
        delete sample.id; delete sample.created_at;
        setEditingRow(sample);
        setIsCreating(true);
        setIsDetailOpen(true);
    };

    const handleSave = async (formData: any) => {
        try {
            const payload = { ...formData };
            let result;
            if (isCreating) {
                if (!payload.id) delete payload.id; 
                result = await supabase.from(config.tableName).insert([payload]);
            } else {
                result = await supabase.from(config.tableName).update(payload).eq('id', payload.id);
            }
            if (result.error) throw result.error;
            alert(isCreating ? "Thêm thành công!" : "Cập nhật thành công!");
            setIsDetailOpen(false);
            fetchData();
        } catch (err: any) { alert("Lỗi: " + err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!permissions.canDelete) return alert("Bạn không có quyền xóa!");
        if (!confirm("Xóa vĩnh viễn?")) return;
        try {
            const { error } = await supabase.from(config.tableName).delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err: any) { alert("Lỗi: " + err.message); }
    };

    const handleBulkDelete = async (ids: string[]) => {
        if (!permissions.canDelete) return alert("Bạn không có quyền xóa!");
        try {
            const { error } = await supabase.from(config.tableName).delete().in('id', ids);
            if (error) throw error;
            alert(`Đã xóa ${ids.length} mục thành công!`);
            fetchData();
        } catch (err: any) { alert("Lỗi xóa: " + err.message); }
    };

    const handleCustomAction = async (action: CustomAction, ids: string[]) => {
        if (!ids.length) return;
        if (!permissions.canEdit) return alert("Bạn không có quyền thực hiện thao tác này!");
        if (confirm(`Xác nhận thực hiện: ${action.label}?`)) {
            try {
                if (action.actionType === 'update_status') {
                    const { error } = await supabase.from(config.tableName).update({ [action.targetField]: action.targetValue }).in('id', ids);
                    if (error) throw error;
                    alert(`Đã cập nhật trạng thái thành công cho ${ids.length} mục!`);
                    fetchData();
                    if (isDetailOpen && ids.length === 1) setIsDetailOpen(false);
                }
            } catch (err: any) { alert("Lỗi thực thi: " + err.message); }
        }
    };

    const columns = config.displayColumns?.length ? config.displayColumns : (data.length > 0 ? Object.keys(data[0]) : []);

    return (
        <>
            <div 
                onClick={() => setIsListOpen(true)}
                className="w-full h-full flex flex-col bg-[#101010] overflow-hidden relative cursor-pointer hover:ring-1 hover:ring-white/20 transition-all group"
            >
                <div className="absolute top-2 right-2 z-10">{loading && <Loader2 size={12} className="animate-spin text-yellow-600"/>}</div>
                
                <div className="flex-1 overflow-hidden p-0 h-full">
                    {loading && data.length === 0 ? <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-yellow-600"/></div> : 
                     data.length === 0 ? <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs italic">Trống</div> :
                     (<>
                        {config.viewType === 'chart' && <ChartView data={data} groupBy={config.groupByColumn} />}
                        
                        {/* 🟢 HỖ TRỢ KIỂU HIỂN THỊ MỚI */}
                        {config.viewType === 'bar' && <BarView data={data} groupBy={config.groupByColumn} />}
                        {config.viewType === 'kanban' && <KanbanWidget data={data} groupBy={config.groupByColumn} />}
                        
                        {config.viewType === 'metric' && <MetricView data={data} />}
                        {config.viewType === 'list' && <ListView data={data} columns={columns} />}
                        
                        {/* Đã xóa ButtonView */}
                     </>)
                    }
                </div>

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-xs font-bold text-white uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">Mở Quản Lý</span>
                </div>
            </div>

            <DanhSachModal 
                isOpen={isListOpen} onClose={() => setIsListOpen(false)}
                config={config} data={data} permissions={permissions} 
                onSelectItem={handleOpenDetail} onCreateNew={handleCreateNew}
                onDelete={handleDelete} onBulkDelete={handleBulkDelete}
                onCustomAction={handleCustomAction}
            />

            <ChiTietModal 
                isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)}
                data={editingRow} isCreating={isCreating} canEdit={permissions.canEdit} 
                onSave={handleSave} customActions={config.customActions} onCustomAction={handleCustomAction}
            />
        </>
    );
}