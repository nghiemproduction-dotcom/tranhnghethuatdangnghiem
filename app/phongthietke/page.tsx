'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { 
    Palette, Image as ImageIcon, Search, UploadCloud, FileCode, CheckCircle2, Loader2
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';
import { getDesignDataAction, updateDesignFileAction } from '@/app/actions/QuyenHanThietKe';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

// 🟢 HÀM HỖ TRỢ TÌM KIẾM THÔNG MINH
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

const THIETKE_FUNCTIONS = [
    { id: 'designs', label: 'THƯ VIỆN MẪU', icon: Palette },
];

export default function PhongThietKePage() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('designs');

    // Data states
    const [designs, setDesigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    
    // Upload State
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    useEffect(() => {
        if (!authLoading) fetchData();
    }, [authLoading]);

    const fetchData = async () => {
        setLoading(true);
        const res = await getDesignDataAction(1, 100, '', '');
        if (res.success) setDesigns(res.data || []);
        setLoading(false);
    };

    // Tabs config
    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: designs.length };
        designs.forEach(d => {
            const bst = d.bo_suu_tap || 'khac';
            counts[bst] = (counts[bst] || 0) + 1;
        });
        const uniqueBST = [...new Set(designs.map(d => d.bo_suu_tap).filter(Boolean))];
        return [
            { id: 'all', label: 'TẤT CẢ', count: counts.all },
            ...uniqueBST.slice(0, 4).map(bst => ({ id: bst, label: bst.toUpperCase(), count: counts[bst] || 0 }))
        ];
    }, [designs]);

    // Filter logic
    const filteredList = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);
        return designs.filter(item => {
            const name = toNonAccentVietnamese(item.ten_vat_tu || '');
            const sku = (item.ma_sku || '').toLowerCase();
            const matchSearch = name.includes(normalizedSearch) || sku.includes(normalizedSearch);
            const matchTab = activeTab === 'all' || item.bo_suu_tap === activeTab;
            return matchSearch && matchTab;
        });
    }, [designs, searchTerm, activeTab]);

    // Upload handlers
    const handleUploadClick = (id: string) => {
        setUploadingId(id);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingId) return;

        try {
            const fileName = `design_${uploadingId}_${Date.now()}.${file.name.split('.').pop()}`;
            const { error: upErr } = await supabase.storage.from('documents').upload(fileName, file);
            if (upErr) throw upErr;
            
            const { data } = supabase.storage.from('documents').getPublicUrl(fileName);
            await updateDesignFileAction(uploadingId, data.publicUrl, "File gốc mới cập nhật");
            
            alert("✅ Upload file thiết kế thành công!");
            fetchData();
        } catch (err: any) {
            alert("Lỗi upload: " + err.message);
        } finally {
            setUploadingId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="KHÔNG GIAN SÁNG TẠO" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* Thanh Phòng + Chức Năng */}
            <ThanhPhongChucNang 
                tenPhong="THIẾT KẾ"
                functions={THIETKE_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            {/* Content Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {/* TAB LIST + SEARCH */}
                        <div className="shrink-0 px-3 py-2 flex items-center gap-3 overflow-x-auto scrollbar-hide border-b border-white/5 bg-[#0a0a0a]">
                            <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-1 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                                    {tab.label} <span className={`px-1 py-0.5 rounded text-[8px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                                </button>
                            ))}
                            {/* Search ở bên phải */}
                            <div className="ml-auto relative group shrink-0">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-32 md:w-48 bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all"
                                />
                            </div>
                        </div>

                        {/* CARD GRID */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                            {loading ? (
                                <div className="h-full flex items-center justify-center flex-col">
                                    <Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32} />
                                    <p className="text-[#C69C6D]/50 text-xs uppercase tracking-[0.2em] animate-pulse">ĐANG TẢI...</p>
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/20">
                                    <ImageIcon size={48} className="mb-4 opacity-20" />
                                    <p className="text-xs uppercase tracking-widest font-bold">KHÔNG TÌM THẤY MẪU THIẾT KẾ</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                                    {filteredList.map((item, idx) => (
                                        <div 
                                            key={item.id} 
                                            className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden transition-all cursor-pointer hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                        >
                                            {/* Image */}
                                            <div className="aspect-[4/3] bg-black relative overflow-hidden">
                                                {item.hinh_anh ? (
                                                    <img src={item.hinh_anh} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={48}/></div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-[#C69C6D] font-bold border border-white/10">
                                                    {item.bo_suu_tap || 'BST Mới'}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <p className="text-[10px] text-[#C69C6D] font-mono mb-1">{item.ma_sku || 'NO SKU'}</p>
                                                <h3 className="text-white font-bold text-sm truncate uppercase group-hover:text-[#C69C6D] transition-colors mb-3">{item.ten_vat_tu}</h3>
                                                
                                                {/* File Status */}
                                                <div className="bg-white/5 rounded-lg p-2 mb-3">
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                                                        <FileCode size={10}/> File Thiết Kế Gốc
                                                    </p>
                                                    {item.metadata?.file_thiet_ke ? (
                                                        <div className="flex items-center justify-between text-[#C69C6D]">
                                                            <a href={item.metadata.file_thiet_ke.url} target="_blank" className="text-xs font-bold underline truncate hover:text-white max-w-[150px]">
                                                                Tải xuống
                                                            </a>
                                                            <CheckCircle2 size={14}/>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic">Chưa có file gốc</p>
                                                    )}
                                                </div>

                                                {/* Upload Button */}
                                                <button 
                                                    onClick={() => handleUploadClick(item.id)}
                                                    disabled={uploadingId === item.id}
                                                    className="w-full py-2 bg-white/5 hover:bg-[#C69C6D] text-white/60 hover:text-black border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                                                >
                                                    {uploadingId === item.id ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14}/>}
                                                    {item.metadata?.file_thiet_ke ? 'Cập nhật File' : 'Upload File Gốc'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".ai,.psd,.cdr,.pdf,.zip,.rar" />
        </KhungTrangChuan>
    );
}
