'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Layers, Search, X, Plus } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

import ThanhDieuHuong from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhDieuHuong';
import NoidungModal from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/NoidungModal';
import ThanhPhanTrang from '@/app/GiaoDienTong/ModalDaCap/GiaoDien/ThanhPhanTrang';   
import NutChucNang from '../quanlynhansu/Level2/NutChucNang'; 
import CardView from '../quanlynhansu/Level2/CardView';
import TableView from '../quanlynhansu/Level2/TableView';
import Level3_FormChiTiet from '../quanlynhansu/Level3/level3'; 
import { getSearchFilter } from '../quanlynhansu/Level2/NutTimKiem';     

interface Props {
    isOpen: boolean;
    onClose?: () => void; 
    config: ModuleConfig;
    onOpenDetail?: (item: any, config: ModuleConfig) => void;
    isEmbedded?: boolean; // 🟢 NEW: Chế độ nhúng
}

export default function Level2_Generic({ isOpen, onClose, config, onOpenDetail, isEmbedded = false }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [tabOptions, setTabOptions] = useState<string[]>([]);
    const [search, setSearch] = useState(''); 
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const ITEMS_PER_PAGE = isEmbedded ? 8 : 20; // 🟢 Giảm item nếu nhúng

    const [userRole, setUserRole] = useState('khach');
    const [userEmail, setUserEmail] = useState(''); 
    
    const [isLevel3Open, setIsLevel3Open] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('table'); 
    
    const canAdd = ['admin', 'quanly', 'boss'].includes(userRole);
    const canConfig = userRole === 'admin'; 

    useEffect(() => {
        const role = localStorage.getItem('USER_ROLE') || 'khach';
        const email = localStorage.getItem('USER_EMAIL') || ''; 
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
            // Tự động tìm cột để phân Tab: ưu tiên 'trang_thai', 'loai', 'vi_tri'
            const tabCol = config.listConfig?.groupByColumn || 'trang_thai';
            const { data } = await supabase.from(config.bangDuLieu).select(tabCol).not(tabCol, 'is', null);
            if (data) {
                const unique = Array.from(new Set(data.map((item: any) => item[tabCol])));
                setTabOptions(unique.sort());
            }
        } catch (error) { console.error(error); }
    };

    const fetchData = async (pageNumber: number = page, currentTab: string = activeTab, keyword: string = search) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            // Xây dựng query
            let query = supabase.from(config.bangDuLieu).select('*', { count: 'exact' });
            
            // Filter Tab
            if (currentTab !== 'ALL') {
                 const tabCol = config.listConfig?.groupByColumn || 'trang_thai';
                 query = query.eq(tabCol, currentTab);
            }

            // Search
            if (keyword.trim()) {
                // Tự động tìm cột text để search
                const colsToSearch = config.danhSachCot.length > 0 
                    ? config.danhSachCot.filter(c => c.kieuDuLieu === 'text').map(c => c.key)
                    : ['ho_ten', 'ten', 'so_dien_thoai', 'email']; // Fallback
                
                const filterString = colsToSearch.map(col => `${col}.ilike.%${keyword}%`).join(',');
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
        setSelectedItem(item); 
        setIsLevel3Open(true);
        if (onOpenDetail) { }
    };

    let columns = config.danhSachCot || [];
    if (columns.length === 0 && data.length > 0) {
        columns = Object.keys(data[0]).filter(k => !['id','created_at','updated_at','nguoi_tao_id'].includes(k)).map(k => ({ 
            key: k, label: k.replace(/_/g, ' ').toUpperCase(), 
            kieuDuLieu: 'text', hienThiList: true, hienThiDetail: true, 
            tuDong: false, batBuoc: false 
        }));
    }
    const imgCol = columns.find(c => ['hinh_anh', 'avatar'].includes(c.key));
    const titleCol = columns[0] || { key: 'id' };

    if (!isOpen) return null;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // 🟢 RENDER GIAO DIỆN
    const content = (
        <div className={`flex flex-col h-full bg-[#0F0C0B] ${isEmbedded ? '' : 'animate-in slide-in-from-right-10 duration-300'}`}>
            {!isEmbedded && (
                <div className="shrink-0 z-50 bg-[#0a0807]/95 backdrop-blur-xl border-b border-[#8B5E3C]/30 shadow-lg">
                    <ThanhDieuHuong danhSachCap={[{ id: 'back', ten: 'Quay Lại', onClick: onClose || (() => {}) }, { id: 'current', ten: config.tenModule.toUpperCase() }]} />
                </div>
            )}
            
            <div className={`flex-1 flex flex-col relative overflow-hidden ${isEmbedded ? 'rounded-xl' : ''}`}>
                {/* 🟢 Search Bar Nhỏ gọn cho chế độ Embedded */}
                <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 px-3 py-2 z-40 flex items-center gap-2">
                    {isEmbedded ? (
                        <>
                            <div className="flex-1 relative">
                                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8B5E3C]"/>
                                <input 
                                    value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch(search)}
                                    placeholder="Tìm nhanh..." 
                                    className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-2 pl-7 py-1 text-xs text-[#F5E6D3] focus:border-[#C69C6D] outline-none"
                                />
                            </div>
                            {canAdd && (
                                <button onClick={() => handleOpenLevel3(null)} className="p-1.5 bg-[#C69C6D] text-[#1a120f] rounded hover:bg-[#b08b5e] shadow-lg">
                                    <Plus size={14}/>
                                </button>
                            )}
                        </>
                    ) : (
                        // Chế độ Full Modal: Dùng NutChucNang bên dưới
                        <div className="flex-1"></div> 
                    )}
                </div>

                <div className="flex-1 relative overflow-hidden bg-[#0a0807]">
                    {loading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 backdrop-blur-[2px]"><Loader2 className="animate-spin text-[#C69C6D]" size={30}/></div>}
                    
                    {data.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#8B5E3C] text-xs italic opacity-50"><p>Chưa có dữ liệu.</p></div>
                    ) : ( 
                        viewMode === 'table' 
                        ? <TableView data={data} columns={columns} page={page} itemsPerPage={ITEMS_PER_PAGE} onRowClick={(item) => handleOpenLevel3(item)}/> 
                        : <CardView data={data} columns={columns} imgCol={imgCol} titleCol={titleCol} canEdit={true} onRowClick={(item) => handleOpenLevel3(item)} /> 
                    )}
                </div>

                {totalPages > 1 && (
                     <div className="shrink-0 border-t border-[#8B5E3C]/10 bg-[#110d0c]">
                        <ThanhPhanTrang trangHienTai={page} tongSoTrang={totalPages} onLui={() => page > 1 && fetchData(page - 1)} onToi={() => page < totalPages && fetchData(page + 1)} />
                     </div>
                )}
            </div>

            {!isEmbedded && !isLevel3Open && (
                <NutChucNang config={config} canAdd={canAdd} canConfig={canConfig} viewMode={viewMode} onToggleView={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')} onAdd={() => handleOpenLevel3(null)} onRefresh={handleRefresh} onClose={onClose || (() => {})} onSearchData={handleSearch} currentSearch={search} onSaveConfig={handleSavePermission} />
            )}
        </div>
    );

    // 🟢 RENDER LEVEL 3 (FORM CHI TIẾT)
    // Nếu là Embedded: Form hiện đè lên (Modal)
    // Nếu là Full: Form hiện đè lên (Modal) -> Logic giống nhau
    const level3Modal = (
        <Level3_FormChiTiet 
            isOpen={isLevel3Open} 
            onClose={() => setIsLevel3Open(false)} 
            onSuccess={() => fetchData(page)} 
            config={config} 
            initialData={selectedItem} 
            userRole={userRole} 
            userEmail={userEmail} 
            parentTitle={config.tenModule} 
        />
    );

    if (isEmbedded) return (
        <>
            {content}
            {level3Modal}
        </>
    );

    return (
        <div className="fixed top-0 left-0 right-0 bottom-[clamp(65px,16vw,85px)] z-[2200] bg-[#0a0807] flex flex-col shadow-2xl">
             <NoidungModal>{content}</NoidungModal>
             {level3Modal}
        </div>
    );
}