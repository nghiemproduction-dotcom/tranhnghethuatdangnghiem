'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getThuChiDataAction, deleteThuChiAction } from '@/app/actions/QuyenHanKeToan';
import FormThuChi from './FormThuChi';
import ThuChiDetail from './ThuChiDetail';

export default function ThuChiManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getThuChiDataAction(1, 1000, '', '');
            if (res.success && res.data) setItems(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const filteredList = useMemo(() => {
        return items.filter(item => {
            const matchSearch = (item.mo_ta || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchTab = activeTab === 'all' || item.loai_giao_dich === activeTab;
            return matchSearch && matchTab;
        });
    }, [items, searchTerm, activeTab]);

    const handleAddNew = () => { setSelectedItem(null); setIsFormOpen(true); };
    const handleCardClick = (item: any) => { setSelectedItem(item); setIsDetailOpen(true); };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            <div className="shrink-0 p-4 flex gap-3 items-center justify-between bg-[#0a0a0a] border-b border-white/5">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" placeholder="Tìm giao dịch..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white outline-none focus:border-[#C69C6D] font-bold uppercase" />
                </div>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] hover:bg-white text-black text-xs font-black rounded-lg shadow-lg active:scale-95 uppercase tracking-wider">
                    <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Ghi Mới</span>
                </button>
            </div>

            <div className="shrink-0 px-4 pt-2 pb-0 flex gap-4 border-b border-white/5 bg-[#050505]">
                {[{id: 'all', label: 'TẤT CẢ'}, {id: 'thu', label: 'THU'}, {id: 'chi', label: 'CHI'}].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-[11px] font-bold uppercase border-b-2 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>{tab.label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {loading ? <div className="h-full flex justify-center items-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div> : (
                    <div className="space-y-3">
                        {filteredList.map((item) => (
                            <div key={item.id} onClick={() => handleCardClick(item)} className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-white/5 rounded-xl hover:border-[#C69C6D]/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.loai_giao_dich === 'thu' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                        {item.loai_giao_dich === 'thu' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{item.mo_ta}</h3>
                                        <p className="text-xs text-gray-500">{new Date(item.tao_luc).toLocaleDateString('vi-VN')} • {item.nguoi_thuc_hien_ten || 'Hệ thống'}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-bold text-sm ${item.loai_giao_dich === 'thu' ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.loai_giao_dich === 'thu' ? '+' : ''}{Number(item.so_tien).toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && <FormThuChi isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selectedItem} onSuccess={() => { fetchData(); setIsFormOpen(false); }} />}
            {isDetailOpen && selectedItem && (
                <ThuChiDetail 
                    isOpen={isDetailOpen} 
                    data={selectedItem} 
                    onClose={() => setIsDetailOpen(false)} 
                    onEdit={() => { setIsDetailOpen(false); setIsFormOpen(true); }} 
                    onDelete={async (id: string) => { 
                        const res = await deleteThuChiAction(id); 
                        if(res.success) { fetchData(); setIsDetailOpen(false); } 
                        else alert(res.error); 
                    }}
                />
            )}
        </div>
    );
}