'use client';
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { TrendingUp, Layers, Columns } from 'lucide-react';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- HELPERS ---
const groupData = (data: any[], groupBy: string) => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
        const val = String(item[groupBy] || item['trang_thai'] || 'Khác');
        // Viết hoa chữ cái đầu
        const label = val.charAt(0).toUpperCase() + val.slice(1);
        counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
};

// Bảng màu chuẩn Dark Mode
const COLORS = ['#8B5CF6', '#10B981', '#64748B', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4'];

// --- COMPONENTS ---

// 1. BIỂU ĐỒ TRÒN (Doughnut) - Số nằm giữa
export const ChartView = ({ data, groupBy }: { data: any[], groupBy?: string }) => {
    const counts = groupData(data, groupBy || 'trang_thai');
    const labels = Object.keys(counts);
    const values = Object.values(counts);

    const chartData = {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: COLORS,
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    return (
        <div className="flex flex-col h-full w-full p-2 relative">
            {/* Biểu đồ nằm giữa */}
            <div className="flex-1 relative flex items-center justify-center min-h-[120px]">
                <div className="w-28 h-28 relative">
                    <Doughnut 
                        data={chartData} 
                        options={{ 
                            cutout: '70%', 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false }, tooltip: { enabled: true } } 
                        }} 
                    />
                    {/* Số tổng ở giữa */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <span className="text-2xl font-black text-white tracking-tighter">{data.length}</span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Tổng</span>
                    </div>
                </div>
            </div>

            {/* Chú thích (Legend) dạng thẻ bài nằm dưới */}
            <div className="mt-2 flex flex-wrap justify-center gap-2 overflow-y-auto max-h-[80px] content-start">
                {labels.map((key, i) => (
                    <div key={key} className="flex items-center bg-[#151515] border border-white/5 rounded-full px-2 py-1 group hover:border-white/20 transition-all">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 shadow-[0_0_5px_currentColor]" style={{ color: COLORS[i % COLORS.length], backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="text-[9px] text-gray-300 font-bold mr-1 max-w-[60px] truncate" title={key}>{key}:</span>
                        <span className="text-[9px] text-white font-black">{counts[key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 2. BIỂU ĐỒ CỘT (Bar)
export const BarView = ({ data, groupBy }: { data: any[], groupBy?: string }) => {
    const counts = groupData(data, groupBy || 'trang_thai');
    const chartData = {
        labels: Object.keys(counts),
        datasets: [{
            label: 'Số lượng',
            data: Object.values(counts),
            backgroundColor: COLORS,
            borderRadius: 4,
            barThickness: 20,
        }],
    };

    return (
        <div className="w-full h-full p-3 flex flex-col">
            <div className="flex-1 relative">
                <Bar 
                    data={chartData} 
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { 
                                beginAtZero: true, 
                                grid: { color: '#ffffff10' }, 
                                ticks: { color: '#ffffff80', font: { size: 9 } },
                                border: { display: false }
                            },
                            x: { 
                                grid: { display: false }, 
                                ticks: { color: '#ffffff', font: { size: 9 } },
                                border: { display: false }
                            }
                        }
                    }} 
                />
            </div>
        </div>
    );
};

// 3. KANBAN WIDGET (Tóm tắt tiến độ)
export const KanbanWidget = ({ data, groupBy }: { data: any[], groupBy?: string }) => {
    const counts = groupData(data, groupBy || 'trang_thai');
    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 text-gray-500">
                <Columns size={14}/> <span className="text-[10px] uppercase font-bold">Tổng quan trạng thái</span>
            </div>
            <div className="space-y-2">
                {Object.keys(counts).map((key, i) => (
                    <div key={key} className="flex justify-between items-center bg-[#151515] p-2 rounded border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                            <span className="text-xs font-bold text-gray-300 truncate max-w-[100px]" title={key}>{key}</span>
                        </div>
                        <span className="text-sm font-black text-white">{counts[key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. METRIC VIEW (Thẻ Số Lớn)
export const MetricView = ({ data }: { data: any[] }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative bg-gradient-to-b from-[#1A1A1A] to-transparent">
        <Layers size={24} className="text-gray-700 mb-2 opacity-50"/>
        <span className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">{data.length}</span>
        <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-bold border-t border-white/10 pt-2 px-4">Tổng bản ghi</span>
        
        <div className="absolute top-2 right-2 flex items-center gap-1 text-green-500 bg-green-900/10 border border-green-500/20 px-2 py-0.5 rounded-full text-[8px] font-bold">
            <TrendingUp size={10} /> Live
        </div>
    </div>
);

// 5. LIST VIEW (Danh sách rút gọn - Có hiện Avatar)
export const ListView = ({ data, columns }: { data: any[], columns: string[] }) => (
    <div className="w-full h-full overflow-auto p-1">
        <table className="w-full text-left text-[10px] text-gray-400 border-collapse">
            <tbody className="divide-y divide-white/5">
                {data.slice(0, 6).map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                        {columns.slice(0, 2).map((col) => {
                            const val = row[col];
                            // 🟢 LOGIC: Chỉ hiển thị ảnh nếu tên cột LÀ 'hinh_anh'
                            const isImg = col === 'hinh_anh' && typeof val === 'string' && val.length > 5;
                            
                            return (
                                <td key={col} className="p-2 truncate max-w-[100px] first:font-medium first:text-gray-300">
                                    {isImg ? (
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                            <img src={val} alt="Img" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        String(val)
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);