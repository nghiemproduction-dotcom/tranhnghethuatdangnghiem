'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Music, ListMusic, Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';

export default function NhacNen() {
    // Playlist cấu hình
    const DANH_SACH_NHAC = [
        { url: '/sounds/bai-1.mp3', name: 'Giai điệu 1' },
        { url: '/sounds/bai-2.mp3', name: 'Giai điệu 2' },
        { url: '/sounds/bai-3.mp3', name: 'Giai điệu 3' },
        { url: '/sounds/bai-4.mp3', name: 'Giai điệu 4' },
    ];

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); 
    const [isOpen, setIsOpen] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
            if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
        }
    }, [currentSongIndex]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Nút Trigger trên Menu */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center relative active:scale-95 transition-all border ${isOpen || isPlaying ? 'bg-[#C69C6D] border-[#C69C6D] text-black shadow-[0_0_10px_rgba(198,156,109,0.4)]' : 'bg-black/40 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm'}`}
                title="Nhạc nền"
            >
                {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 bg-current animate-[bounce_1s_infinite] h-2"></span>
                        <span className="w-0.5 bg-current animate-[bounce_1.2s_infinite] h-3"></span>
                        <span className="w-0.5 bg-current animate-[bounce_0.8s_infinite] h-2"></span>
                    </div>
                ) : <Music size={18} />}
            </button>

            {/* Audio ẩn */}
            <audio ref={audioRef} src={DANH_SACH_NHAC[currentSongIndex].url} onEnded={() => setCurrentSongIndex((currentSongIndex + 1) % DANH_SACH_NHAC.length)} />

            {/* Dropdown Playlist */}
            {isOpen && (
                <div className="absolute top-12 right-0 w-72 bg-[#0f0c0b]/95 backdrop-blur-xl border border-[#8B5E3C]/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[6000]">
                    {/* Header */}
                    <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2 text-[#C69C6D] text-xs font-bold uppercase tracking-wider">
                            <ListMusic size={14} /> Playlist
                        </div>
                        <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#C69C6D]/10 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black transition-colors">
                            {isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto custom-scroll p-1 space-y-0.5">
                        {DANH_SACH_NHAC.map((song, idx) => (
                            <div 
                                key={idx}
                                onClick={() => { setCurrentSongIndex(idx); setIsPlaying(true); }}
                                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${currentSongIndex === idx ? 'bg-[#C69C6D]/20 text-[#C69C6D]' : 'hover:bg-white/5 text-gray-400'}`}
                            >
                                <div className="text-[10px] font-mono opacity-50 w-4 text-center">{idx + 1}</div>
                                <div className="flex-1 text-xs font-medium truncate">{song.name}</div>
                                {currentSongIndex === idx && isPlaying && <Volume2 size={12} className="animate-pulse"/>}
                            </div>
                        ))}
                    </div>

                    {/* Volume */}
                    <div className="p-3 border-t border-white/10 bg-black/20 flex items-center gap-3">
                        <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} className="text-gray-400 hover:text-white">
                            {volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                        </button>
                        <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}