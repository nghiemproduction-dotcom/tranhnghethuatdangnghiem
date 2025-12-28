'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Music, Play, Pause, Volume2, VolumeX, Upload, Loader2, X, 
    SkipForward, Trash2, Repeat1, Shuffle 
} from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 

interface BaiHat {
    id: string;
    name: string;
    url: string;
}

export default function NhacNen() {
    const [danhSachNhac, setDanhSachNhac] = useState<BaiHat[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); 
    const [isOpen, setIsOpen] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    
    // 🟢 THÊM STATE MỚI
    const [isLooping, setIsLooping] = useState(false);   // Chế độ lặp 1 bài
    const [isShuffling, setIsShuffling] = useState(false); // Chế độ trộn bài

    // Quản lý quyền và trạng thái
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 1. Kiểm tra quyền & Tải nhạc
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('USER_INFO');
            const storedRole = localStorage.getItem('USER_ROLE');
            
            let role = storedRole || '';
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    role = parsed.role || parsed.vi_tri || parsed.chuc_vu || role;
                } catch (e) { console.error(e); }
            }

            const cleanRole = role.toLowerCase().trim();
            if (['admin', 'quanly', 'boss'].includes(cleanRole)) {
                setIsAdmin(true);
            }
        }
        fetchDanhSachNhac();
    }, []);

    const fetchDanhSachNhac = async () => {
        try {
            const { data, error } = await supabase.storage
                .from('nhac-nen')
                .list('', { sortBy: { column: 'created_at', order: 'asc' } });

            if (error) throw error;

            if (data) {
                const songs: BaiHat[] = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .map((file, index) => {
                        const { data: urlData } = supabase.storage
                            .from('nhac-nen')
                            .getPublicUrl(file.name);

                        return {
                            id: file.name,
                            name: `Giai điệu ${index + 1}`,
                            url: urlData.publicUrl
                        };
                    });
                setDanhSachNhac(songs);
            }
        } catch (err) {
            console.error("Lỗi tải playlist:", err);
        }
    };

    // Điều khiển Volume
    useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

    // Auto Play khi đổi bài
    useEffect(() => {
        if (audioRef.current && danhSachNhac.length > 0) {
            audioRef.current.load();
            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => setIsPlaying(false));
                }
            }
        }
    }, [currentSongIndex, danhSachNhac]);

    const togglePlay = () => {
        if (!audioRef.current || danhSachNhac.length === 0) return;
        if (isPlaying) { 
            audioRef.current.pause(); 
            setIsPlaying(false); 
        } else { 
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    // 🟢 XỬ LÝ NEXT (Có tính toán Shuffle)
    const handleNext = () => {
        if (danhSachNhac.length === 0) return;

        if (isShuffling && danhSachNhac.length > 1) {
            // Random index khác bài hiện tại
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * danhSachNhac.length);
            } while (randomIndex === currentSongIndex);
            setCurrentSongIndex(randomIndex);
        } else {
            // Next bình thường
            setCurrentSongIndex((prev) => (prev + 1) % danhSachNhac.length);
        }
    };

    const handlePrev = () => {
        if (danhSachNhac.length === 0) return;
        // Prev thì cứ lùi bình thường, ít khi random lùi
        setCurrentSongIndex((prev) => (prev - 1 + danhSachNhac.length) % danhSachNhac.length);
    };

    // 🟢 XỬ LÝ KHI HẾT BÀI (quan trọng)
    const handleSongEnded = () => {
        if (isLooping) {
            // Nếu đang Loop 1 bài -> Tua lại từ đầu và hát tiếp
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else {
            // Nếu không Loop -> Next (Logic Shuffle đã nằm trong handleNext)
            handleNext();
        }
    };

    // --- UPLOAD & DELETE (Giữ nguyên) ---
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return; 
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('audio/')) return alert('Chọn file âm thanh!');

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `music-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('nhac-nen').upload(fileName, file);
            if (error) throw error;
            await fetchDanhSachNhac();
            alert('Tải nhạc thành công!');
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setIsUploading(false);
            if (uploadInputRef.current) uploadInputRef.current.value = ''; 
        }
    };

    const handleDelete = async (songId: string, songName: string) => {
        if (!isAdmin) return;
        if (!confirm(`Xóa "${songName}"?`)) return;
        try {
            setIsDeleting(songId);
            const { error } = await supabase.storage.from('nhac-nen').remove([songId]);
            if (error) throw error;
            if (danhSachNhac[currentSongIndex]?.id === songId) {
                setIsPlaying(false);
                setCurrentSongIndex(0);
            }
            await fetchDanhSachNhac();
        } catch (err: any) {
            alert('Lỗi xóa: ' + err.message);
        } finally {
            setIsDeleting(null);
        }
    };

    const modalContent = isOpen ? (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <Music className="text-[#C69C6D]" />
                    <h2 className="text-xl font-serif text-[#C69C6D]">Player</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* Cột Trái: Player Controls */}
                <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-center gap-6 md:gap-8 border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-[#1a1512] to-black">
                    
                    {/* Đĩa than */}
                    <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#C69C6D]/30 shadow-[0_0_50px_rgba(198,156,109,0.2)] flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070')] bg-cover opacity-50 grayscale"></div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full border-2 border-[#C69C6D] z-10 flex items-center justify-center">
                             <div className="w-3 h-3 md:w-4 md:h-4 bg-[#C69C6D] rounded-full"></div>
                        </div>
                    </div>

                    <div className="text-center space-y-1 md:space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-[#F5F5F5] line-clamp-1 px-4">
                            {danhSachNhac.length > 0 ? danhSachNhac[currentSongIndex]?.name : 'Chưa có nhạc'}
                        </h3>
                        <p className="text-[#C69C6D] text-xs md:text-sm uppercase tracking-widest">
                            {isPlaying ? 'Đang phát' : 'Đã tạm dừng'}
                        </p>
                    </div>

                    {/* 🟢 Controls Row: Shuffle - Prev - Play - Next - Loop */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Nút Shuffle */}
                        <button 
                            onClick={() => setIsShuffling(!isShuffling)} 
                            className={`p-2 transition-all ${isShuffling ? 'text-[#C69C6D]' : 'text-white/30 hover:text-white'}`}
                            title="Trộn bài"
                        >
                            <Shuffle size={20} />
                        </button>

                        <button onClick={handlePrev} className="text-white/50 hover:text-white transition-colors disabled:opacity-30" disabled={danhSachNhac.length === 0}>
                            <SkipForward size={24} className="rotate-180" />
                        </button>
                        
                        <button 
                            onClick={togglePlay}
                            disabled={danhSachNhac.length === 0}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#C69C6D] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(198,156,109,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        
                        <button onClick={handleNext} className="text-white/50 hover:text-white transition-colors disabled:opacity-30" disabled={danhSachNhac.length === 0}>
                            <SkipForward size={24} />
                        </button>

                        {/* Nút Loop */}
                        <button 
                            onClick={() => setIsLooping(!isLooping)} 
                            className={`p-2 transition-all ${isLooping ? 'text-[#C69C6D]' : 'text-white/30 hover:text-white'}`}
                            title="Lặp lại 1 bài"
                        >
                            <Repeat1 size={20} />
                        </button>
                    </div>

                    {/* Volume */}
                    <div className="w-full max-w-[250px] flex items-center gap-4">
                        <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} className="text-gray-400">
                            {volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                        </button>
                        <input 
                            type="range" min="0" max="1" step="0.05" 
                            value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                        />
                    </div>
                </div>

                {/* Cột Phải: Playlist */}
                <div className="w-full md:w-1/2 flex flex-col bg-[#0a0807] min-h-0">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                        <span className="text-sm font-bold text-white uppercase">
                            Playlist ({danhSachNhac.length})
                        </span>
                        
                        {isAdmin && (
                            <div>
                                <input type="file" ref={uploadInputRef} onChange={handleUpload} accept="audio/*" className="hidden" />
                                <button 
                                    onClick={() => uploadInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D]/20 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black rounded-full text-xs font-bold uppercase transition-all"
                                >
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    {isUploading ? 'Đang tải...' : 'Thêm nhạc'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2">
                        {danhSachNhac.map((song, idx) => (
                            <div 
                                key={song.id}
                                onClick={() => { setCurrentSongIndex(idx); setIsPlaying(true); }}
                                className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${currentSongIndex === idx ? 'bg-[#C69C6D]/10 border-[#C69C6D]/30 text-[#C69C6D]' : 'hover:bg-white/5 text-gray-400 border-white/5'}`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded bg-black/30 text-[10px] font-mono shrink-0">
                                    {currentSongIndex === idx && isPlaying ? <div className="flex gap-0.5 items-end h-3"><span className="w-0.5 bg-current animate-[bounce_1s_infinite] h-2"></span><span className="w-0.5 bg-current animate-[bounce_1.2s_infinite] h-3"></span></div> : idx + 1}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{song.name}</div>
                                </div>
                                
                                {currentSongIndex === idx && <div className="text-[10px] px-2 py-0.5 bg-[#C69C6D] text-black rounded font-bold hidden sm:block">PLAYING</div>}

                                {isAdmin && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.name); }}
                                        disabled={isDeleting === song.id}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    >
                                        {isDeleting === song.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <audio 
                ref={audioRef} 
                src={danhSachNhac[currentSongIndex]?.url || ''} 
                onEnded={handleSongEnded} 
                onError={(e) => console.error("Audio error", e)}
            />

            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative active:scale-95 transition-all border shadow-lg z-[5000] ${isPlaying ? 'bg-[#C69C6D] border-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)] animate-[spin_4s_linear_infinite]' : 'bg-black/40 border-white/20 text-white hover:bg-white/10 backdrop-blur-md'}`}
                    title="Mở trình phát nhạc"
                >
                    <Music size={18} />
                </button>
            )}

            {mounted && createPortal(modalContent, document.body)}
        </>
    );
}