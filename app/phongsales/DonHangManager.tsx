'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, ShoppingBag, Calendar, User, Filter, Eye } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import DonHangDetail from './DonHangDetail';

export default function DonHangManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    
    // State cho Detail
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        // Lấy đơn hàng kèm thông tin khách và sales
        const { data, error } = await supabase
            .from('don_hang')
            .select(`
                *,
                khach_hang:khach_hang_id(ho_ten, so_dien_thoai),
                sales:sales_phu_trach_id(ho_ten)
            `)
            .order('tao_luc', { ascending: false })
            .limit(50);

        if (data) setItems(data);
        setLoading(false);
    };

    const filteredList = useMemo(() => {
        return items.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const matchSearch = 
                (item.ma_don || '').toLowerCase().includes(searchLower) ||
                (item.khach_hang?.ho_ten || '').toLowerCase().includes(searchLower) ||
                (item.khach_hang?.so_dien_thoai || '').includes(searchLower);
            
            const matchTab = activeTab === 'all' || item.trang_thai === activeTab;
            return matchSearch && matchTab;
        });
    }, [items, searchTerm, activeTab]);

    const handleOpenDetail = (item: any) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            {/* TOOLBAR */}
            <div className="shrink-0 p-4 flex gap-3 items-center justify-between bg-[#0a0a0a] border-b border-white/5">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" placeholder="Tìm mã đơn, tên khách..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase" />
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg"><Filter size={16}/></button>
                </div>
            </div>

            {/* TABS */}
            <div className="shrink-0 px-4 pt-2 pb-0 flex gap-4 border-b border-white/5 bg-[#050505] overflow-x-auto">
                {[{id: 'all', label: 'TẤT CẢ'}, {id: 'hoan_thanh', label: 'HOÀN THÀNH'}, {id: 'dang_xu_ly', label: 'ĐANG XỬ LÝ'}, {id: 'huy', label: 'HỦY'}].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-[11px] font-bold uppercase border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>{tab.label}</button>
                ))}
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {loading ? <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div> : (
                    <div className="space-y-3">
                        {filteredList.map((item) => (
                            <div key={item.id} onClick={() => handleOpenDetail(item)} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#0f0f0f] border border-white/5 rounded-xl hover:border-[#C69C6D]/30 transition-all cursor-pointer gap-3">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.trang_thai === 'hoan_thanh' ? 'bg-green-900/20 text-green-500' : 'bg-yellow-900/20 text-yellow-500'}`}>
                                        <ShoppingBag size={20}/>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[#C69C6D] font-black text-sm">{item.ma_don}</h3>
                                            <span className="text-[10px] bg-white/10 px-1.5 rounded text-white/60">{new Date(item.tao_luc).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="text-xs text-white font-bold flex items-center gap-1 mt-0.5"><User size={10}/> {item.khach_hang?.ho_ten || 'Khách lẻ'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8">
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase">TỔNG TIỀN</p>
                                        <p className="font-mono font-bold text-sm text-white">{Number(item.tong_tien).toLocaleString('vi-VN')}₫</p>
                                    </div>
                                    <Eye size={18} className="text-gray-600 hover:text-white"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {isDetailOpen && selectedItem && (
                <DonHangDetail 
                    isOpen={isDetailOpen} 
                    data={selectedItem} 
                    onClose={() => setIsDetailOpen(false)} 
                />
            )}
        </div>
    );
}