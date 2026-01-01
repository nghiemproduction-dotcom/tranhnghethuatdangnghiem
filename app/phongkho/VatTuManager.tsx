'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, Package, MoreHorizontal, LayoutGrid, Box } from 'lucide-react';
import { getVatTuDataAction, deleteVatTuAction } from '@/app/actions/QuyenHanKho';
import FormVatTu from './FormVatTu';
import VatTuDetail from './VatTuDetail';

const toNonAccentVietnamese = (str: string) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return str;
};

interface VatTu {
    id: string;
    ma_sku: string;
    ten_vat_tu: string;
    loai_vat_tu: string;
    don_vi_tinh: string;
    ton_kho: number;
    canh_bao_toi_thieu: number;
    hinh_anh?: string;
    gia_von: number;
    gia_ban: number;
}

export default function VatTuManager() {
    const [items, setItems] = useState<VatTu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<VatTu | null>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getVatTuDataAction(1, 1000, '', ''); 
            if (res.success && res.data) {
                setItems(res.data as unknown as VatTu[]);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: items.length };
        items.forEach(i => {
            const type = i.loai_vat_tu || 'khac';
            counts[type] = (counts[type] || 0) + 1;
        });
        return [
            { id: 'all', label: 'TẤT CẢ' },
            { id: 'nguyen_lieu', label: 'NGUYÊN LIỆU' },
            { id: 'thanh_pham', label: 'THÀNH PHẨM' },
            { id: 'dich_vu', label: 'DỊCH VỤ' },
        ].map(t => ({ ...t, count: counts[t.id] || 0 }));
    }, [items]);

    const filteredList = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);
        return items.filter(item => {
            const name = toNonAccentVietnamese(item.ten_vat_tu);
            const sku = (item.ma_sku || '').toLowerCase();
            const matchSearch = name.includes(normalizedSearch) || sku.includes(normalizedSearch);
            const matchTab = activeTab === 'all' || item.loai_vat_tu === activeTab;
            return matchSearch && matchTab;
        });
    }, [items, searchTerm, activeTab]);

    const handleAddNew = () => { setSelectedItem(null); setIsFormOpen(true); };
    const handleCardClick = (item: VatTu) => { setSelectedItem(item); setIsDetailOpen(true); };
    const handleSaveSuccess = () => { fetchData(); setIsFormOpen(false); };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            {/* TOOLBAR */}
            <div className="shrink-0 p-4 flex gap-3 items-center justify-between bg-[#0a0a0a] border-b border-white/5">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={16} />
                    <input type="text" placeholder="Tìm tên, mã SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all" />
                </div>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] hover:bg-white text-black text-xs font-black rounded-lg shadow-lg active:scale-95 uppercase tracking-wider">
                    <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Thêm Mới</span>
                </button>
            </div>

            {/* TAB LIST */}
            <div className="shrink-0 px-4 pt-2 pb-0 flex gap-4 overflow-x-auto scrollbar-hide border-b border-white/5 bg-[#050505]">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                        {tab.label} <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* CARD GRID */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col"><Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32} /><p className="text-[#C69C6D]/50 text-xs uppercase tracking-[0.2em] animate-pulse">ĐANG TẢI...</p></div>
                ) : filteredList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20"><Package size={48} className="mb-4 opacity-20" /><p className="text-xs uppercase tracking-widest font-bold">KHÔNG TÌM THẤY DỮ LIỆU</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                        {filteredList.map((item, idx) => (
                            <div key={item.id} onClick={() => handleCardClick(item)} className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-4 transition-all cursor-pointer hover:border-[#C69C6D]/50 hover:-translate-y-1 flex flex-col gap-3">
                                <div className="relative w-full aspect-square rounded-lg border border-white/10 bg-black overflow-hidden group-hover:border-[#C69C6D]">
                                    {item.hinh_anh ? <img src={item.hinh_anh} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={32} /></div>}
                                    {item.ton_kho <= item.canh_bao_toi_thieu && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded animate-pulse shadow-lg">SẮP HẾT</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-[#C69C6D] font-mono mb-1">{item.ma_sku || 'NO SKU'}</p>
                                    <h3 className="text-white font-bold text-sm truncate uppercase group-hover:text-[#C69C6D] transition-colors mb-1">{item.ten_vat_tu}</h3>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Tồn: <b className="text-white">{item.ton_kho}</b> {item.don_vi_tinh}</span>
                                        <span className="font-mono text-[#C69C6D]">{item.gia_ban?.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isFormOpen && <FormVatTu isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selectedItem} onSuccess={handleSaveSuccess} />}
            {isDetailOpen && selectedItem && (
                <VatTuDetail 
                    isOpen={isDetailOpen} 
                    data={selectedItem} 
                    onClose={() => setIsDetailOpen(false)} 
                    onEdit={() => { setIsDetailOpen(false); setIsFormOpen(true); }} 
                    onDelete={async (id: string) => { const res = await deleteVatTuAction(id); if(res.success) fetchData(); else alert(res.error); }}
                />
            )}
        </div>
    );
}