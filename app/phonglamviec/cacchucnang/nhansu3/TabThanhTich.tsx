'use client'
import { useMemo } from 'react'
import { Trophy, Star, Target, Shield, Zap, Medal } from 'lucide-react'
import { Nhansu3DTO } from './dto'

export default function TabThanhTich({ item }: { item: Nhansu3DTO }) {
  const gameStats = useMemo(() => {
    const currentExp = item.diem_cong_hien || 0;
    const nextLevelExp = 1000; 
    const percent = Math.min((currentExp / nextLevelExp) * 100, 100);
    return { level: item.cap_bac_game || 'Tân Binh', exp: currentExp, nextLevelExp, percent };
  }, [item]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#111] p-5 rounded-lg border border-white/5 relative overflow-hidden group hover:border-[#C69C6D]/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
            <div className="flex justify-between items-end mb-2 relative z-10">
                <div><p className="text-[10px] text-gray-500 font-bold uppercase">Current Rank</p><h3 className="text-2xl font-black text-[#C69C6D]">{gameStats.level}</h3></div>
                <div className="text-right"><span className="text-[#C69C6D] font-bold text-xl">{gameStats.exp}</span><span className="text-gray-600 text-xs"> / {gameStats.nextLevelExp} XP</span></div>
            </div>
            <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/10"><div className="h-full bg-gradient-to-r from-[#C69C6D] to-yellow-300" style={{ width: `${gameStats.percent}%` }} /></div>
        </div>
        <div className="text-center text-xs text-gray-500 uppercase">Module Gamification (Auto-Generated)</div>
    </div>
  )
}