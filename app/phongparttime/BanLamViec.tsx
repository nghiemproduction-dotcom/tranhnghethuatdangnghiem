'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, CheckCircle, Clock, Camera, Loader2, 
    AlertTriangle, Banknote, RefreshCw, Briefcase, PlusCircle 
} from 'lucide-react';
// 👇 Import thêm hàm mới
import { getMyTasksAction, getAvailableJobsAction, startJobAction, completeJobAction, getMySalaryToday, claimJobAction } from '@/app/actions/QuyenHanSanXuat';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

export default function BanLamViec() {
    const [activeTab, setActiveTab] = useState<'my_jobs' | 'new_jobs'>('my_jobs');
    const [tasks, setTasks] = useState<any[]>([]);      // Việc của tôi
    const [newJobs, setNewJobs] = useState<any[]>([]); // Việc mới chưa ai nhận
    
    const [salary, setSalary] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingJobId, setUploadingJobId] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [resTasks, resNewJobs, resSalary] = await Promise.all([
            getMyTasksAction(),
            getAvailableJobsAction(), // Lấy việc mới
            getMySalaryToday()
        ]);
        
        if (resTasks.success) setTasks(resTasks.data || []);
        if (resNewJobs.success) setNewJobs(resNewJobs.data || []);
        if (resSalary.success) setSalary(resSalary.total || 0);
        setLoading(false);
    };

    // Hàm nhận việc
    const handleClaim = async (jobId: string) => {
        setProcessingId(jobId);
        const res = await claimJobAction(jobId);
        if (res.success) {
            alert("Đã nhận việc thành công! Bắt đầu làm ngay nhé.");
            loadData();
            setActiveTab('my_jobs'); // Chuyển về tab việc của tôi
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
        <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
            {/* Header Lương */}
            <div className="p-6 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border-b border-[#C69C6D]/30 shrink-0 shadow-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Lương tạm tính tháng này</p>
                        <h1 className="text-3xl font-black text-[#C69C6D] flex items-center gap-2">
                            <Banknote size={28}/> {salary.toLocaleString('vi-VN')}₫
                        </h1>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-white/10 bg-[#111]">
                <button 
                    onClick={() => setActiveTab('my_jobs')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'my_jobs' ? 'border-[#C69C6D] text-[#C69C6D] bg-white/5' : 'border-transparent text-gray-500'}`}
                >
                    Việc Của Tôi ({tasks.length})
                </button>
                <button 
                    onClick={() => setActiveTab('new_jobs')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'new_jobs' ? 'border-[#C69C6D] text-[#C69C6D] bg-white/5' : 'border-transparent text-gray-500'}`}
                >
                    Sàn Việc Mới 
                    {newJobs.length > 0 && <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">{newJobs.length}</span>}
                </button>
            </div>

            {/* DANH SÁCH */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                
                {/* TAB VIỆC MỚI */}
                {activeTab === 'new_jobs' && (
                    <>
                        {newJobs.length === 0 && !loading && (
                            <div className="text-center py-20 text-white/30"><Briefcase size={40} className="mx-auto mb-2 opacity-30"/><p>Hiện chưa có đơn hàng nào cần làm</p></div>
                        )}
                        {newJobs.map(job => (
                            <div key={job.id} className="p-5 rounded-2xl border border-white/10 bg-[#111] hover:border-[#C69C6D]/50 transition-all flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-white/60 mb-2 inline-block">ĐƠN: {job.ma_don}</span>
                                        <h3 className="text-lg font-bold text-white">{job.ten_item_hien_thi}</h3>
                                        <p className="text-sm text-gray-400">Số lượng: <b className="text-white">{job.so_luong}</b> • {job.ten_quy_trinh}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClaim(job.id)}
                                    disabled={!!processingId}
                                    className="w-full py-3 bg-[#C69C6D] hover:bg-white text-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                >
                                    {processingId === job.id ? <Loader2 className="animate-spin"/> : <PlusCircle size={18}/>}
                                    NHẬN VIỆC NAY
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {/* TAB VIỆC CỦA TÔI */}
                {activeTab === 'my_jobs' && (
                    <>
                        {tasks.length === 0 && !loading && (
                            <div className="text-center py-20 text-white/30 flex flex-col items-center">
                                <CheckCircle size={48} className="mb-4 opacity-20"/>
                                <p className="text-sm font-bold uppercase">Bạn đang rảnh rỗi. Qua tab "Sàn Việc Mới" nhận việc đi!</p>
                            </div>
                        )}
                        {tasks.map(task => {
                            const isStarted = task.trang_thai === 'dang_lam';
                            return (
                                <div key={task.id} className={`relative p-5 rounded-2xl border-2 transition-all ${isStarted ? 'bg-[#C69C6D]/10 border-[#C69C6D] shadow-[0_0_20px_rgba(198,156,109,0.2)]' : 'bg-[#151515] border-white/5'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-white/60 mb-2 inline-block">{task.ma_lenh}</span>
                                            <h3 className="text-lg font-bold text-white mb-1">{task.ten_item_hien_thi}</h3>
                                            <p className="text-sm text-gray-400">SL: <b className="text-white">{task.so_luong}</b> • {task.ten_quy_trinh}</p>
                                        </div>
                                        {isStarted && <span className="animate-pulse text-[#C69C6D]"><Clock size={24}/></span>}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {!isStarted ? (
                                            <button 
                                                onClick={() => handleStart(task.id)}
                                                disabled={!!processingId}
                                                className="w-full py-4 bg-white/5 hover:bg-[#C69C6D] hover:text-black border border-white/10 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {processingId === task.id ? <Loader2 className="animate-spin"/> : <Play size={20} fill="currentColor"/>}
                                                BẮT ĐẦU LÀM
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleFinishClick(task.id)}
                                                disabled={!!processingId}
                                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                {processingId === task.id ? <Loader2 className="animate-spin"/> : <Camera size={20}/>}
                                                CHỤP ẢNH & XONG
                                            </button>
                                        )}
                                    </div>
                                    {task.ghi_chu_don && (
                                        <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 flex items-start gap-2">
                                            <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5"/>
                                            <p className="text-xs text-yellow-500/80 italic">{task.ghi_chu_don}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment"/>
        </div>
    );
}