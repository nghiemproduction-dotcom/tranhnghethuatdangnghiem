'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Layers, Search, X } from 'lucide-react'; 
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '../../../../../DashboardBuilder/KieuDuLieuModule';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';   
import NutChucNang from './NutChucNang'; 

import CardView from './CardView';
import TableView from './TableView';
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/quanlynhansu/Level3/level3';

import { getSearchFilter } from './NutTimKiem';     

interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: ModuleConfig;
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
}

export default function Level2_DanhSachModal({ isOpen, onClose, config, onOpenDetail }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [tabOptions, setTabOptions] = useState<string[]>([]);
    const [search, setSearch] = useState(''); 
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const ITEMS_PER_PAGE = 20;

    const [userRole, setUserRole] = useState('khach');
    const [userEmail, setUserEmail] = useState(''); // 🟢 State Email
    
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canConfig = userRole === 'admin'; 

    useEffect(() => {
        const role = localStorage.getItem('USER_ROLE') || 'khach';
        const email = localStorage.getItem('USER_EMAIL') || ''; // 🟢 Lấy email
        setUserRole(role);
        setUserEmail(email);
    }, []);

    useEffect(() => {
        if (isOpen && config.bangDuLieu) {
            setPage(1); fetchTabOptions(); fetchData(1, 'ALL'); setActiveTab('ALL');
        }
    }, [isOpen, config]);

    const fetchTabOptions = async () => {
        try {
            const { data } = await supabase.from(config.bangDuLieu).select('vi_tri').not('vi_tri', 'is', null);
            if (data) {
                const unique = Array.from(new Set(data.map((item: any) => item.vi_tri)));
                setTabOptions(unique.sort());
            }
        } catch (error) { console.error(error); }
    };

    const fetchData = async (pageNumber: number = page, currentTab: string = activeTab, keyword: string = search) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            let query = (supabase.from(config.bangDuLieu) as any).select('*', { count: 'exact' });
            if (currentTab !== 'ALL') query = query.eq('vi_tri', currentTab);
            if (keyword.trim()) {
                const filterString = getSearchFilter(config.bangDuLieu, keyword, config.danhSachCot);
                if (filterString) query = query.or(filterString);
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            const { data: result, count, error } = await query;
            if (error) throw error;
            setData(result || []);
            setTotal(count || 0);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleRefresh = async () => { setLoading(true); setTimeout(() => fetchData(page, activeTab, search), 500); };
    const handleSavePermission = async (newConfig: ModuleConfig) => { try { await supabase.from('cau_hinh_modules').update({ config_json: newConfig }).eq('module_id', config.id); alert("Đã lưu phân quyền thành công!"); } catch (e) { alert("Lỗi lưu phân quyền"); } };
    const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); fetchData(1, tab, search); };
    const handleSearch = (keyword: string) => { setSearch(keyword); setPage(1); fetchData(1, activeTab, keyword); };

    const handleOpenLevel3 = (item: any) => {
        if (onOpenDetail) onOpenDetail(item, config);
        else { setSelectedItem(item); setIsLevel3Open(true); }
    };

    let columns = config.danhSachCot || [];
    if (columns.length === 0 && data.length > 0) columns = Object.keys(data[0]).map(k => ({ key: k, label: k, kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, tuDong: false, batBuoc: false }));
    const imgCol = columns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
    const titleCol = columns[0] || { key: 'id' };

    if (!isOpen) return null;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2200] bg-[#0a0807] flex flex-col animate-in slide-in-from-right-10 duration-300 shadow-2xl">
            <div className="shrink-0 z-50 bg-[#0a0807]/95 backdrop-blur-xl border-b border-[#8B5E3C]/30 shadow-lg">
                <ThanhDieuHuong danhSachCap={[{ id: 'back', ten: 'Quay Lại', onClick: onClose }, { id: 'current', ten: config.tenModule.toUpperCase() }]} />
            </div>
            <NoidungModal>
                <div className="flex flex-col h-full relative overflow-hidden">
                    <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 px-4 py-2 z-40">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            <button onClick={() => handleTabChange('ALL')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap border ${activeTab === 'ALL' ? 'bg-[#C69C6D] text-[#0a0807] border-[#C69C6D]' : 'bg-transparent text-[#8B5E3C] border-transparent hover:bg-[#C69C6D]/10'}`}><Layers size={14} className="inline-block mr-1 -mt-0.5"/> Tất Cả</button>
                            {tabOptions.map((pos) => ( <button key={pos} onClick={() => handleTabChange(pos)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap border ${activeTab === pos ? 'bg-[#C69C6D] text-[#0a0807] border-[#C69C6D]' : 'bg-transparent text-[#8B5E3C] border-[#8B5E3C]/20 hover:bg-[#C69C6D]/10'}`}>{pos}</button> ))}
                        </div>
                    </div>
                    {search && <div className="shrink-0 px-4 py-2 bg-[#161210] border-b border-[#8B5E3C]/10 flex justify-center"><span className="px-4 py-1 bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D] rounded-full text-xs font-bold uppercase flex items-center gap-2"><Search size={12}/> Kết quả cho: "{search}" <button onClick={() => handleSearch('')}><X size={12} className="hover:text-white"/></button></span></div>}
                    <div className="flex-1 relative overflow-hidden">
                        {loading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px]"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>}
                        {data.length === 0 && !loading ? <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C]"><p>Chưa có dữ liệu nào.</p></div> : ( viewMode === 'table' ? <TableView data={data} columns={columns} page={page} itemsPerPage={ITEMS_PER_PAGE} onRowClick={(item) => handleOpenLevel3(item)}/> : <CardView data={data} columns={columns} imgCol={imgCol} titleCol={titleCol} canEdit={true} onRowClick={(item) => handleOpenLevel3(item)} /> )}
                    </div>
                </div>
            </NoidungModal>
            {totalPages > 1 && <ThanhPhanTrang trangHienTai={page} tongSoTrang={totalPages} onLui={() => page > 1 && fetchData(page - 1)} onToi={() => page < totalPages && fetchData(page + 1)} />}
            
            <NutChucNang config={config} canAdd={canAdd} canConfig={canConfig} viewMode={viewMode} onToggleView={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')} onAdd={() => handleOpenLevel3(null)} onRefresh={handleRefresh} onClose={onClose} onSearchData={handleSearch} currentSearch={search} onSaveConfig={handleSavePermission} />
            
            {/* 🟢 TRUYỀN USER_EMAIL VÀO */}
            <Level3_FormChiTiet isOpen={isLevel3Open} onClose={() => setIsLevel3Open(false)} onSuccess={() => fetchData(page)} config={config} initialData={selectedItem} userRole={userRole} userEmail={userEmail} />
        </div>
    );
}