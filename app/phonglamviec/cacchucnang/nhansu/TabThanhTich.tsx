'use client'
import { useMemo } from 'react'
import { Trophy, Star, Target, Shield, Zap, Medal, LucideIcon } from 'lucide-react'
import { NhanSuDTO } from './dto' // Import Type chuẩn từ DTO

export default function TabThanhTich({ item }: { item: NhanSuDTO }) {
  
  // 1. LOGIC TÍNH TOÁN DỮ LIỆU
  const gameStats = useMemo(() => {
    // Dùng đúng key trong NhanSuDTO (snake_case)
    const currentExp = item.diem_cong_hien || 0;
    const nextLevelExp = 1000; 
    const percent = Math.min((currentExp / nextLevelExp) * 100, 100);

    return {
      level: item.cap_bac_game || 'Tân Binh', 
      exp: currentExp,
      nextLevelExp,
      percent,
    };
  }, [item.cap_bac_game, item.diem_cong_hien]);

  // 2. DỮ LIỆU GIẢ LẬP (MOCKUP)
  const mockStats = [
    { icon: Trophy, label: "Thành Tích", value: "12", color: "text-yellow-500" },
    { icon: Star, label: "Đánh Giá", value: "4.9", color: "text-[#C69C6D]" },
    { icon: Target, label: "Nhiệm Vụ", value: "85%", color: "text-green-500" },
    { icon: Shield, label: "Thâm Niên", value: "2 Năm", color: "text-blue-500" }, 
  ];

  const recentAchievements = [
    { name: 'Nhân viên xuất sắc tháng 10', date: '10/2023', rank: 'Gold' },
    { name: 'Chiến thần doanh số', date: '09/2023', rank: 'Platinum' },
    { name: 'Ong chăm chỉ', date: '08/2023', rank: 'Silver' },
  ];

  // 3. RENDER UI
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- PHẦN 1: THANH LEVEL --- */}
        <div className="bg-[#111] p-5 rounded-lg border border-white/5 relative overflow-hidden group hover:border-[#C69C6D]/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} />
            </div>
            
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Rank</p>
                    <h3 className="text-2xl font-black #ffffff uppercase italic text-[#C69C6D]">
                        {gameStats.level}
                    </h3>
                </div>
                <div className="text-right">
                    <span className="text-[#C69C6D] font-bold text-xl">{gameStats.exp}</span>
                    <span className="text-gray-600 text-xs"> / {gameStats.nextLevelExp} XP</span>
                </div>
            </div>

            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/10 relative z-10">
                <div 
                    className="h-full bg-gradient-to-r from-[#C69C6D] to-yellow-300 shadow-[0_0_15px_#C69C6D] transition-all duration-1000 ease-out" 
                    style={{ width: `${gameStats.percent}%` }}
                />
            </div>
        </div>

        {/* --- PHẦN 2: STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockStats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
            ))}
        </div>

        {/* --- PHẦN 3: ACHIEVEMENTS --- */}
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Medal size={14} /> Danh hiệu gần đây
            </h4>
            <div className="space-y-2">
                {recentAchievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/5 rounded hover:bg-[#151515] transition-colors cursor-default group">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${
                                ach.rank === 'Gold' ? 'bg-yellow-500 text-yellow-500' : 
                                ach.rank === 'Platinum' ? 'bg-cyan-400 text-cyan-400' : 
                                'bg-gray-400 text-gray-400'
                            }`} />
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{ach.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono group-hover:text-gray-400">{ach.date}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string, color: string }) {
    return (
        <div className="bg-[#111] p-3 rounded border border-white/5 flex flex-col items-center justify-center gap-1 hover:bg-[#1a1a1a] transition-all hover:-translate-y-1 hover:border-[#C69C6D]/30 cursor-default">
            <Icon size={20} className={`${color} mb-1`} />
            <span className="text-xl font-black text-white">{value}</span>
            <span className="text-[9px] text-gray-500 uppercase font-bold">{label}</span>
        </div>
    )
}