'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Clock, Edit3, LogIn } from 'lucide-react';
import { useLevel3Context } from './Level3Context'; 

// Hàm format ngày giờ
const formatDateVN = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
    } catch (e) { return dateStr; }
};

export default function Tab_NhatKyHoatDong({ nhanSuId, loginHistory }: { nhanSuId: string, loginHistory?: any[] }) {
    const { config } = useLevel3Context(); 
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getColumnLabel = (key: string) => {
        const col = config.danhSachCot.find(c => c.key === key);
        return col ? col.label : key; 
    };

    useEffect(() => {
        const fetchLogs = async () => {
            if (!nhanSuId) return;
            setLoading(true);
            
            const { data: changeLogs } = await supabase
                .from('nhat_ky_hoat_dong')
                .select('*')
                .eq('nhan_su_id', nhanSuId)
                .order('tao_luc', { ascending: false });

            const formattedChanges = (changeLogs || []).map((log: any) => ({
                id: log.id,
                type: 'change',
                title: log.hanh_dong,
                details: log.chi_tiet,
                time: log.tao_luc,
                icon: Edit3,
                color: 'text-[#C69C6D]'
            }));

            // 🟢 FIX LỖI CRASH: Kiểm tra loginHistory có phải là Array không trước khi map
            const safeLoginHistory = Array.isArray(loginHistory) ? loginHistory : [];
            
            const formattedLogins = safeLoginHistory.map((log: any, index: number) => ({
                id: `login_${index}`,
                type: 'login',
                title: 'Đăng nhập hệ thống',
                details: log, 
                time: log.thoi_gian || log.time || new Date().toISOString(), 
                icon: LogIn,
                color: 'text-green-500'
            }));

            const combined = [...formattedChanges, ...formattedLogins].sort((a, b) => 
                new Date(b.time).getTime() - new Date(a.time).getTime()
            );

            setActivities(combined);
            setLoading(false);
        };

        fetchLogs();
    }, [nhanSuId, loginHistory]);

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Đang tải nhật ký...</div>;
    if (activities.length === 0) return <div className="p-8 text-center text-gray-500 italic">Chưa có hoạt động nào.</div>;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activities.map((item) => (
                <div key={item.id} className="relative pl-8 border-l border-[#8B5E3C]/30 last:border-0 pb-6">
                    <div className={`absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#161210] border border-[#8B5E3C]/50 flex items-center justify-center ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                        <item.icon size={14} />
                    </div>

                    <div className="bg-[#161210] border border-[#8B5E3C]/10 rounded-xl p-4 hover:border-[#8B5E3C]/40 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-[#E8D4B9] font-bold text-sm uppercase tracking-wide">{item.title}</h4>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock size={10} />
                                {formatDateVN(item.time)}
                            </span>
                        </div>

                        {item.type === 'change' && item.details && (
                            <div className="space-y-2 mt-2">
                                {Object.entries(item.details).map(([key, val]: any) => (
                                    <div key={key} className="text-xs grid grid-cols-[120px_1fr] gap-2 items-center bg-[#0a0807]/50 p-2 rounded border border-[#8B5E3C]/10">
                                        <span className="text-gray-400 font-medium text-right truncate">{getColumnLabel(key)}:</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="line-through text-gray-600 truncate max-w-[100px]">{val.cu ? String(val.cu) : '...'}</span>
                                            <span className="text-[#8B5E3C]">→</span>
                                            <span className="text-[#C69C6D] font-bold">{val.moi ? String(val.moi) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {item.type === 'login' && (
                            <div className="text-xs text-gray-400 mt-1">
                                <p>IP: <span className="text-gray-300">{item.details?.ip || 'Ẩn danh'}</span></p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}