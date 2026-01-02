'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Play, CheckCircle, Clock, Camera, Loader2, 
    AlertTriangle, Banknote, RefreshCw, Briefcase, PlusCircle,
    Search, MoreHorizontal, FileText
} from 'lucide-react';
import { getMyTasksAction, getAvailableJobsAction, startJobAction, completeJobAction, getMySalaryToday, claimJobAction } from '@/app/actions/QuyenHanSanXuat';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

// 🟢 HÀM HỖ TRỢ TÌM KIẾM THÔNG MINH (Chuẩn hóa Tiếng Việt)
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

export default function BanLamViec() {
    const [tasks, setTasks] = useState<any[]>([]);      // Việc của tôi
    const [newJobs, setNewJobs] = useState<any[]>([]); // Việc mới chưa ai nhận
    
    const [salary, setSalary] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'my_jobs' | 'new_jobs'>('my_jobs');
    
    // Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingJobId, setUploadingJobId] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [resTasks, resNewJobs, resSalary] = await Promise.all([
            getMyTasksAction(),
            getAvailableJobsAction(),
            getMySalaryToday()
        ]);
        
        if (resTasks.success) setTasks(resTasks.data || []);
        if (resNewJobs.success) setNewJobs(resNewJobs.data || []);
        if (resSalary.success) setSalary(resSalary.total || 0);
        setLoading(false);
    };

    // 🟢 TABS CONFIG
    const tabs = useMemo(() => {
        return [
            { id: 'my_jobs', label: 'VIỆC CỦA TÔI', count: tasks.length },
            { id: 'new_jobs', label: 'SÀN VIỆC MỚI', count: newJobs.length },
        ];
    }, [tasks, newJobs]);

    // 🟢 LOGIC LỌC THÔNG MINH
    const filteredList = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);
        const sourceList = activeTab === 'my_jobs' ? tasks : newJobs;

        return sourceList.filter(item => {
            const normalizedName = toNonAccentVietnamese(item.ten_item_hien_thi || '');
            const maDon = (item.ma_don || item.ma_lenh || '').toLowerCase();
            return normalizedName.includes(normalizedSearch) || maDon.includes(normalizedSearch);
        });
    }, [tasks, newJobs, searchTerm, activeTab]);

    // Hàm nhận việc
    const handleClaim = async (jobId: string) => {
        setProcessingId(jobId);
        const res = await claimJobAction(jobId);
        if (res.success) {
            alert("Đã nhận việc thành công! Bắt đầu làm ngay nhé.");
            loadData();
            setActiveTab('my_jobs');
        } else {
            alert("Lỗi: " + res.error);
        }
        setProcessingId(null);
    };

    const handleStart = async (jobId: string) => {
        if (!confirm("Bắt đầu tính giờ làm?")) return;
        setProcessingId(jobId);
        const res = await startJobAction(jobId);
        if (res.success) loadData();
        else alert(res.error);
        setProcessingId(null);
    };

    const handleFinishClick = (jobId: string) => {
        setUploadingJobId(jobId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingJobId) return;

        setProcessingId(uploadingJobId);
        try {
            const compressed = await compressImage(file, 0.6, 800);
            const fileName = `evidence_${Date.now()}.jpg`;
            const { error: upErr } = await supabase.storage.from('evidence').upload(fileName, compressed);
            if (upErr) throw upErr;
            const { data } = supabase.storage.from('evidence').getPublicUrl(fileName);

            const res = await completeJobAction(uploadingJobId, data.publicUrl, "Hoàn thành qua App");
            
            if (res.success) {
                alert("🎉 Tuyệt vời! Đã cộng lương.");
                loadData();
            } else {
                alert("Lỗi: " + res.error);
            }
        } catch (err: any) {
            alert("Lỗi: " + err.message);
        } finally {
            setProcessingId(null);
            setUploadingJobId(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            {/* TAB LIST + SEARCH + SALARY (gộp 1 thanh) */}
            <div className="shrink-0 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 bg-[#0a0a0a]">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {/* Tabs */}
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as 'my_jobs' | 'new_jobs')} 
                        className={`pb-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-1 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        {tab.label} 
                        <span className={`px-1 py-0.5 rounded text-[8px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'} ${tab.id === 'new_jobs' && tab.count > 0 ? 'animate-pulse bg-red-600 text-white' : ''}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
                
                {/* Spacer */}
                <div className="flex-1 min-w-4" />
                
                {/* Actions ở bên phải */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Tìm..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-28 md:w-36 bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all"
                        />
                    </div>
                    {/* LƯƠNG TẠM TÍNH */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-[#C69C6D]/10 border border-[#C69C6D]/30 rounded-lg">
                        <Banknote size={14} className="text-[#C69C6D]"/>
                        <span className="text-[10px] font-black text-[#C69C6D]">{salary.toLocaleString('vi-VN')}₫</span>
                    </div>
                    {/* NÚT REFRESH */}
                    <button 
                        onClick={loadData} 
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> 
                    </button>
                </div>
            </div>

            {/* MOBILE SALARY BAR */}
            <div className="sm:hidden shrink-0 px-3 py-1.5 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-center gap-2">
                <Banknote size={14} className="text-[#C69C6D]"/>
                <span className="text-[10px] font-black text-[#C69C6D]">Lương: {salary.toLocaleString('vi-VN')}₫</span>
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
                        {activeTab === 'my_jobs' ? (
                            <>
                                <CheckCircle size={48} className="mb-4 opacity-20" />
                                <p className="text-xs uppercase tracking-widest font-bold">BẠN ĐANG RẢNH. QUA "SÀN VIỆC MỚI" NHẬN VIỆC ĐI!</p>
                            </>
                        ) : (
                            <>
                                <Briefcase size={48} className="mb-4 opacity-20" />
                                <p className="text-xs uppercase tracking-widest font-bold">HIỆN CHƯA CÓ VIỆC MỚI</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {filteredList.map((item, idx) => {
                            const isStarted = item.trang_thai === 'dang_lam';
                            const isMyJob = activeTab === 'my_jobs';
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={`group relative bg-[#0f0f0f] border rounded-xl p-4 transition-all overflow-hidden ${isStarted ? 'border-[#C69C6D] bg-[#C69C6D]/10 shadow-[0_0_20px_rgba(198,156,109,0.2)]' : 'border-white/5 hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {/* HEADER */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`relative shrink-0 w-12 h-12 rounded-full border p-0.5 bg-black flex items-center justify-center ${isStarted ? 'border-[#C69C6D]' : 'border-white/10 group-hover:border-[#C69C6D]'} transition-colors`}>
                                                {isStarted ? (
                                                    <Clock size={20} className="text-[#C69C6D] animate-pulse"/>
                                                ) : (
                                                    <FileText size={20} className="text-white/40"/>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded text-white/60 mb-1 inline-block">
                                                    {item.ma_don || item.ma_lenh}
                                                </span>
                                                <h3 className="text-white font-bold text-sm truncate uppercase tracking-wide group-hover:text-[#C69C6D] transition-colors">
                                                    {item.ten_item_hien_thi}
                                                </h3>
                                            </div>
                                        </div>
                                        <MoreHorizontal size={16} className="text-white/10 group-hover:text-[#C69C6D] transition-colors shrink-0"/>
                                    </div>

                                    {/* INFO */}
                                    <div className="mb-4 space-y-1">
                                        <p className="text-[10px] text-[#C69C6D] font-bold uppercase">{item.ten_quy_trinh}</p>
                                        <p className="text-xs text-white/50">Số lượng: <b className="text-white">{item.so_luong}</b></p>
                                    </div>

                                    {/* GHI CHÚ */}
                                    {item.ghi_chu_don && (
                                        <div className="mb-3 p-2 bg-black/40 rounded-lg border border-white/5 flex items-start gap-2">
                                            <AlertTriangle size={12} className="text-yellow-500 shrink-0 mt-0.5"/>
                                            <p className="text-[10px] text-yellow-500/80 italic truncate">{item.ghi_chu_don}</p>
                                        </div>
                                    )}

                                    {/* ACTIONS */}
                                    {isMyJob ? (
                                        !isStarted ? (
                                            <button 
                                                onClick={() => handleStart(item.id)}
                                                disabled={!!processingId}
                                                className="w-full py-3 bg-white/5 hover:bg-[#C69C6D] hover:text-black border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {processingId === item.id ? <Loader2 size={14} className="animate-spin"/> : <Play size={14} fill="currentColor"/>}
                                                BẮT ĐẦU LÀM
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleFinishClick(item.id)}
                                                disabled={!!processingId}
                                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                {processingId === item.id ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>}
                                                CHỤP ẢNH & XONG
                                            </button>
                                        )
                                    ) : (
                                        <button 
                                            onClick={() => handleClaim(item.id)}
                                            disabled={!!processingId}
                                            className="w-full py-3 bg-[#C69C6D] hover:bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            {processingId === item.id ? <Loader2 size={14} className="animate-spin"/> : <PlusCircle size={14}/>}
                                            NHẬN VIỆC NGAY
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment"/>
        </div>
    );
}