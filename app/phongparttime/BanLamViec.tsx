'use client';

import React, { useState, useEffect } from 'react';
import { 
    Clock, Calendar, CheckCircle, XCircle, DollarSign, 
    Coffee, Briefcase, Timer, Loader2, PlayCircle, StopCircle 
} from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { useUser } from '@/app/ThuVien/UserContext';

// 🟢 Đã xóa import sonner để fix lỗi
// import { toast } from 'sonner'; 

// Cấu hình hiển thị trạng thái
const PRIORITY_CONFIG: any = { 
    high: { label: 'Cao', color: 'text-red-400 border-red-400/30 bg-red-400/10' }, 
    medium: { label: 'Trung bình', color: 'text-[#C69C6D] border-[#C69C6D]/30 bg-[#C69C6D]/10' }, 
    low: { label: 'Thấp', color: 'text-gray-400 border-gray-400/30 bg-gray-400/10' } 
};

const TASK_STATUS_CONFIG: any = { 
    completed: { label: 'Hoàn thành', color: 'bg-green-500/20 text-green-400' }, 
    in_progress: { label: 'Đang làm', color: 'bg-[#C69C6D]/20 text-[#C69C6D]' }, 
    pending: { label: 'Chưa làm', color: 'bg-white/10 text-gray-300' } 
};

export default function BanLamViec() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    
    // Data States
    const [attendanceToday, setAttendanceToday] = useState<any>(null);
    const [shifts, setShifts] = useState<any[]>([]); // Lịch sử chấm công
    const [tasks, setTasks] = useState<any[]>([]);   // Danh sách nhiệm vụ
    const [stats, setStats] = useState({
        hoursMonth: 0,
        salaryEst: 0,
        tasksDone: 0,
        tasksTotal: 0
    });

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Kiểm tra chấm công hôm nay
            const { data: todayData } = await supabase
                .from('cham_cong')
                .select('*')
                .eq('nhan_su_id', user?.id)
                .eq('ngay', today)
                .is('thoi_gian_ra', null) // Chưa check-out
                .maybeSingle();

            if (todayData) {
                setIsCheckedIn(true);
                setCurrentSessionId(todayData.id);
                setAttendanceToday(todayData);
            }

            // 2. Lấy lịch sử chấm công (Gần đây)
            const { data: shiftData } = await supabase
                .from('cham_cong')
                .select('*')
                .eq('nhan_su_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);
            
            setShifts(shiftData || []);

            // 3. Lấy nhiệm vụ
            const { data: taskData } = await supabase
                .from('nhiem_vu')
                .select('*')
                .eq('nhan_su_id', user?.id)
                .order('han_chot', { ascending: true });
            
            setTasks(taskData || []);

            // 4. Tính toán thống kê (Giả lập tính lương cơ bản)
            const doneTasks = taskData?.filter(t => t.trang_thai === 'completed').length || 0;
            setStats({
                hoursMonth: 0, // Cần logic tính tổng giờ
                salaryEst: 0,  // Cần logic nhân lương
                tasksDone: doneTasks,
                tasksTotal: taskData?.length || 0
            });

        } catch (error) {
            console.error("Lỗi tải dữ liệu bàn làm việc:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase.from('cham_cong').insert({
                nhan_su_id: user.id,
                ngay: new Date().toISOString().split('T')[0],
                thoi_gian_vao: new Date().toISOString()
            }).select().single();

            if (error) throw error;

            setIsCheckedIn(true);
            setCurrentSessionId(data.id);
            setAttendanceToday(data);
            
            // 🟢 Dùng alert thay vì toast
            alert("✅ Check-in thành công! Chúc bạn một ngày làm việc hiệu quả.");
            
            fetchData(); 
        } catch (error: any) {
            alert("Lỗi check-in: " + error.message);
        }
    };

    const handleCheckOut = async () => {
        if (!currentSessionId) return;
        try {
            const { error } = await supabase.from('cham_cong').update({
                thoi_gian_ra: new Date().toISOString()
            }).eq('id', currentSessionId);

            if (error) throw error;

            setIsCheckedIn(false);
            setCurrentSessionId(null);
            setAttendanceToday(null);

            // 🟢 Dùng alert thay vì toast
            alert("👋 Check-out thành công! Hẹn gặp lại.");
            
            fetchData();
        } catch (error: any) {
            alert("Lỗi check-out: " + error.message);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C69C6D]" /></div>;
    }

    return (
        <div className="w-full h-full animate-fade-in-up pb-20">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#C69C6D]/10 p-3 rounded-lg border border-[#C69C6D]/30 shadow-[0_0_20px_rgba(198,156,109,0.2)]">
                        <Coffee className="w-6 h-6 text-[#C69C6D]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6D3] to-[#C69C6D]">
                            Bàn Làm Việc
                        </h1>
                        <p className="text-white/60 mt-1 font-light tracking-wide text-sm md:text-base">
                            Quản lý ca làm việc và nhiệm vụ cá nhân của {user?.ho_ten}
                        </p>
                    </div>
                </div>
            </div>

            {/* Check-in / Check-out Panel */}
            <div className={`backdrop-blur-md border rounded-2xl p-6 mb-8 relative overflow-hidden group transition-all duration-500
                ${isCheckedIn 
                    ? 'bg-[#C69C6D]/10 border-[#C69C6D]/50 shadow-[0_0_30px_rgba(198,156,109,0.15)]' 
                    : 'bg-white/5 border-[#C69C6D]/30'
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C69C6D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2 text-[#F5E6D3] font-serif">
                            {isCheckedIn ? 'Đang trong ca làm việc 💼' : 'Sẵn sàng làm việc? 🚀'}
                        </h2>
                        <p className="text-white/70 text-xs md:text-sm">
                            {isCheckedIn 
                                ? `Bắt đầu lúc: ${new Date(attendanceToday?.thoi_gian_vao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - Đừng quên check-out!` 
                                : 'Hãy Check-in để hệ thống bắt đầu tính giờ công cho bạn.'}
                        </p>
                    </div>
                    <button 
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all transform hover:scale-105 active:scale-95 
                        ${isCheckedIn 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' 
                            : 'bg-[#C69C6D] text-black hover:bg-[#F5E6D3]'
                        }`}
                    >
                        {isCheckedIn ? <><StopCircle size={18}/> Check-out</> : <><PlayCircle size={18}/> Check-in</>}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    icon={Clock} 
                    title="Giờ làm tháng này" 
                    value={`${stats.hoursMonth}h`} 
                    change="Cập nhật theo thực tế" 
                    color="blue" 
                />
                <StatCard 
                    icon={DollarSign} 
                    title="Lương tạm tính" 
                    value={`${(stats.salaryEst / 1000000).toFixed(1)}M`} 
                    change="Chưa bao gồm thưởng" 
                    color="green" 
                />
                <StatCard 
                    icon={CheckCircle} 
                    title="Nhiệm vụ xong" 
                    value={`${stats.tasksDone}/${stats.tasksTotal}`} 
                    change={`${stats.tasksTotal > 0 ? Math.round((stats.tasksDone/stats.tasksTotal)*100) : 0}%`} 
                    color="purple" 
                />
                <StatCard 
                    icon={Calendar} 
                    title="Ca làm gần nhất" 
                    value={shifts.length.toString()} 
                    change="Lần chấm công" 
                    color="orange" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lịch sử chấm công */}
                <div className="lg:col-span-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-[#C69C6D] font-serif flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Lịch sử chấm công
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {shifts.length === 0 ? (
                            <div className="text-center text-white/30 text-sm py-4">Chưa có dữ liệu chấm công</div>
                        ) : (
                            shifts.map((shift) => (
                                <div key={shift.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:border-[#C69C6D]/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[#F5E6D3] text-sm">
                                                {new Date(shift.ngay).toLocaleDateString('vi-VN', {weekday: 'long', day: '2-digit', month: '2-digit'})}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <PlayCircle className="w-3 h-3 text-green-400"/> 
                                                    {new Date(shift.thoi_gian_vao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <StopCircle className="w-3 h-3 text-red-400"/> 
                                                    {shift.thoi_gian_ra ? new Date(shift.thoi_gian_ra).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '---'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {shift.thoi_gian_ra ? (
                                                <span className="text-xs font-bold bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20">Hoàn thành</span>
                                            ) : (
                                                <span className="text-xs font-bold bg-[#C69C6D]/20 text-[#C69C6D] px-2 py-1 rounded border border-[#C69C6D]/30 animate-pulse">Đang làm</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Danh sách nhiệm vụ */}
                <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-[#C69C6D] font-serif mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                        📋 Nhiệm vụ
                    </h3>
                    <div className="space-y-4">
                        {tasks.length === 0 ? (
                            <div className="text-center text-white/30 text-sm py-4">Không có nhiệm vụ nào</div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:border-[#C69C6D]/30 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-gray-200 text-xs flex-1 mr-2">{task.tieu_de}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${PRIORITY_CONFIG[task.muc_do]?.color}`}>
                                            {PRIORITY_CONFIG[task.muc_do]?.label || task.muc_do}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {task.han_chot ? new Date(task.han_chot).toLocaleDateString('vi-VN') : 'Không hạn'}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${TASK_STATUS_CONFIG[task.trang_thai]?.color || 'text-gray-500'}`}>
                                            {TASK_STATUS_CONFIG[task.trang_thai]?.label || task.trang_thai}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-4 py-2 border border-dashed border-white/20 rounded-lg text-white/40 hover:border-[#C69C6D] hover:text-[#C69C6D] transition-colors text-xs font-bold uppercase tracking-widest">
                        + Báo cáo công việc
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component phụ StatCard
function StatCard({ icon: Icon, title, value, change, color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
        purple: 'bg-purple-500/10 text-purple-400',
        orange: 'bg-orange-500/10 text-orange-400'
    };

    return (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:border-[#C69C6D]/50 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{change}</span>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1 font-serif italic">{title}</p>
                <p className="text-2xl font-bold text-[#F5E6D3]">{value}</p>
            </div>
        </div>
    );
}