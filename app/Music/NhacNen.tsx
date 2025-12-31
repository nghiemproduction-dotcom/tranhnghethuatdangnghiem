'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Music, Play, Pause, Volume2, VolumeX, Upload, Loader2, X, 
    SkipForward, Trash2, Repeat1, Shuffle, AlertCircle, Volume1, ChevronUp, ChevronDown, Square
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
    const [isMuted, setIsMuted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showQuickControls, setShowQuickControls] = useState(false);
    
    // State logic (Giữ nguyên phần nâng cấp logic)
    const [isLooping, setIsLooping] = useState(false);   
    const [isShuffling, setIsShuffling] = useState(false); 

    const [isAdmin, setIsAdmin] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [playlistLoaded, setPlaylistLoaded] = useState(false);
    
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);

    // 🎵 AUTO-PLAY: Phát nhạc khi user login thành công
    useEffect(() => {
        if (isUserAuthenticated && playlistLoaded && danhSachNhac.length > 0 && !isPlaying && audioRef.current) {
            // Delay một chút để đảm bảo audio element sẵn sàng
            const timer = setTimeout(() => {
                audioRef.current?.play().then(() => {
                    setIsPlaying(true);
                    console.log('🎵 Auto-play nhạc khi login');
                }).catch(err => {
                    console.warn('Auto-play failed (có thể do browser policy):', err);
                    // Auto-play có thể bị chặn bởi browser, đó là bình thường
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isUserAuthenticated, playlistLoaded, danhSachNhac.length, isPlaying]);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('USER_INFO');
            const storedRole = localStorage.getItem('USER_ROLE');
            let role = storedRole || '';
            let isAuthenticated = false;
            
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    role = parsed.role || parsed.vi_tri || parsed.chuc_vu || role;
                    isAuthenticated = true; // User đã đăng nhập
                } catch (e) { console.error(e); }
            }
            
            setIsUserAuthenticated(isAuthenticated);
            if (['admin', 'quanly', 'boss'].includes(role.toLowerCase().trim())) {
                setIsAdmin(true);
            }
        }
        fetchDanhSachNhac();
    }, []);

    const fetchDanhSachNhac = async () => {
        try {
            // 'tao_luc' không phải column chuẩn của Storage -> gây 400. Dùng created_at luôn.
            const { data, error } = await supabase.storage
                .from('nhac-nen')
                .list('', { sortBy: { column: 'created_at', order: 'asc' } });

            if (error) {
                console.warn("Không thể load playlist nhạc:", error);
                setPlaylistLoaded(true);
                return; // Return early instead of throwing
            }

            if (data) {
                const songs: BaiHat[] = data
                    .filter(file => file.name !== '.emptyFolderPlaceholder')
                    .map((file, index) => {
                        const { data: urlData } = supabase.storage
                            .from('nhac-nen')
                            .getPublicUrl(file.name);
                        return {
                            id: file.name,
                            name: `Giai điệu ${index + 1}: ${file.name.replace(/\.[^/.]+$/, "")}`,
                            url: urlData.publicUrl
                        };
                    });
                setDanhSachNhac(songs);
                setPlaylistLoaded(true); // 🎵 Đánh dấu playlist đã load xong
                setErrorMsg(null);
            }
        } catch (err: any) {
            console.error("Lỗi tải playlist:", err);
            setErrorMsg("Không thể tải danh sách nhạc.");
            setPlaylistLoaded(true); // Cũng đánh dấu là đã cố gắng load, để auto-play không chờ mãi
        }
    };

    useEffect(() => { if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

    // Close quick controls when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (controlsRef.current && !controlsRef.current.contains(e.target as Node)) {
                setShowQuickControls(false);
            }
        };
        if (showQuickControls) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showQuickControls]);

    useEffect(() => {
        if (audioRef.current && danhSachNhac.length > 0) {
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentSongIndex, danhSachNhac]);

    const togglePlay = () => {
        if (!audioRef.current || danhSachNhac.length === 0) return;
        if (audioRef.current.paused) { 
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        } else { 
            audioRef.current.pause(); 
            setIsPlaying(false); 
        }
    };

    const handleNext = () => {
        if (danhSachNhac.length === 0) return;
        if (isShuffling && danhSachNhac.length > 1) {
            let randomIndex;
            do { randomIndex = Math.floor(Math.random() * danhSachNhac.length); } 
            while (randomIndex === currentSongIndex);
            setCurrentSongIndex(randomIndex);
        } else {
            setCurrentSongIndex((prev) => (prev + 1) % danhSachNhac.length);
        }
    };

    const handlePrev = () => {
        if (danhSachNhac.length === 0) return;
        setCurrentSongIndex((prev) => (prev - 1 + danhSachNhac.length) % danhSachNhac.length);
    };

    const handleSongEnded = () => {
        if (isLooping && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            handleNext();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return; 
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('audio/')) return alert('Chọn file âm thanh!');

        try {
            setIsUploading(true);
            const fileName = `music-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                    <Music className="text-[#C69C6D]" />
                    <h2 className="text-xl font-serif text-[#C69C6D]">Music Player</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-center gap-6 md:gap-8 border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-[#1a1512] to-black">
                    <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#C69C6D]/30 shadow-[0_0_50px_rgba(198,156,109,0.2)] flex items-center justify-center relative overflow-hidden ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#C69C6D]/20 to-black opacity-80"></div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full border-2 border-[#C69C6D] z-10 flex items-center justify-center">
                             <div className="w-3 h-3 md:w-4 md:h-4 bg-[#C69C6D] rounded-full"></div>
                        </div>
                    </div>
                    <div className="text-center space-y-1 md:space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-[#F5F5F5] line-clamp-1 px-4">{danhSachNhac.length > 0 ? danhSachNhac[currentSongIndex]?.name : 'Chưa có nhạc trong Playlist'}</h3>
                        {errorMsg && <p className="text-red-500 text-xs flex items-center justify-center gap-1"><AlertCircle size={12}/> {errorMsg}</p>}
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                        <button onClick={() => setIsShuffling(!isShuffling)} className={`p-2 transition-all ${isShuffling ? 'text-[#C69C6D]' : 'text-white/30 hover:text-white'}`} title="Trộn bài"><Shuffle size={20} /></button>
                        <button onClick={handlePrev} className="text-white/50 hover:text-white transition-colors disabled:opacity-30" disabled={danhSachNhac.length === 0}><SkipForward size={24} className="rotate-180" /></button>
                        <button onClick={togglePlay} disabled={danhSachNhac.length === 0} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#C69C6D] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(198,156,109,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={handleNext} className="text-white/50 hover:text-white transition-colors disabled:opacity-30" disabled={danhSachNhac.length === 0}><SkipForward size={24} /></button>
                        <button onClick={() => setIsLooping(!isLooping)} className={`p-2 transition-all ${isLooping ? 'text-[#C69C6D]' : 'text-white/30 hover:text-white'}`} title="Lặp lại 1 bài"><Repeat1 size={20} /></button>
                    </div>
                    <div className="w-full max-w-[250px] flex items-center gap-4">
                        <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} className="text-gray-400">{volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
                        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"/>
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col bg-[#0a0807] min-h-0">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                        <span className="text-sm font-bold text-white uppercase">Playlist ({danhSachNhac.length})</span>
                        {isAdmin && (
                            <div>
                                <input type="file" ref={uploadInputRef} onChange={handleUpload} accept="audio/*" className="hidden" />
                                <button onClick={() => uploadInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D]/20 hover:bg-[#C69C6D] text-[#C69C6D] hover:text-black rounded-full text-xs font-bold uppercase transition-all">
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {isUploading ? 'Đang tải...' : 'Thêm nhạc'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2">
                        {danhSachNhac.length === 0 && <div className="text-center text-gray-500 py-10"><Music size={40} className="mx-auto mb-2 opacity-20"/><p>Chưa có bài hát nào</p></div>}
                        {danhSachNhac.map((song, idx) => (
                            <div key={song.id} onClick={() => { setCurrentSongIndex(idx); setIsPlaying(true); }} className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${currentSongIndex === idx ? 'bg-[#C69C6D]/10 border-[#C69C6D]/30 text-[#C69C6D]' : 'hover:bg-white/5 text-gray-400 border-white/5'}`}>
                                <div className="w-8 h-8 flex items-center justify-center rounded bg-black/30 text-[10px] font-mono shrink-0">
                                    {currentSongIndex === idx && isPlaying ? <div className="flex gap-0.5 items-end h-3"><span className="w-0.5 bg-current animate-[bounce_1s_infinite] h-2"></span><span className="w-0.5 bg-current animate-[bounce_1.2s_infinite] h-3"></span></div> : idx + 1}
                                </div>
                                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{song.name}</div></div>
                                {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(song.id, song.name); }} disabled={isDeleting === song.id} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
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
                onError={(e) => {
                    console.warn("Audio load error, skipping to next track");
                    handleNext(); // Skip to next song on error
                }}
            />
            
            {/* Main Music Button - INLINE (no fixed positioning) */}
            <div ref={controlsRef} className="relative">
                {/* Quick Controls Panel - Dropdown style */}
                {showQuickControls && (
                    <div className="absolute top-full right-0 mt-2 bg-black/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200 z-50 min-w-[280px]">
                        {/* Player Controls */}
                        <div className="px-4 py-3 border-b border-white/10 space-y-3">
                            {/* Current Song */}
                            <div className="text-xs font-semibold text-[#C69C6D] px-2 line-clamp-1 text-center">
                                {danhSachNhac.length > 0 ? danhSachNhac[currentSongIndex]?.name : 'Chưa có nhạc'}
                            </div>
                            
                        {/* Quick Control Buttons */}
                            <div className="flex items-center justify-center gap-3">
                                {/* Play */}
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (audioRef.current?.paused) {
                                            audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
                                        }
                                    }}
                                    disabled={danhSachNhac.length === 0}
                                    className="p-2.5 text-white/60 hover:text-white hover:bg-[#C69C6D]/10 rounded-lg transition-colors disabled:opacity-30"
                                    title="Phát"
                                >
                                    <Play size={18} fill="currentColor" className="ml-0.5" />
                                </button>
                                
                                {/* Stop */}
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (audioRef.current) {
                                            audioRef.current.pause();
                                            audioRef.current.currentTime = 0;
                                            setIsPlaying(false);
                                        }
                                    }}
                                    disabled={danhSachNhac.length === 0}
                                    className="p-2.5 text-white/60 hover:text-white hover:bg-[#C69C6D]/10 rounded-lg transition-colors disabled:opacity-30"
                                    title="Dừng"
                                >
                                    <Square size={18} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Volume Control */}
                        <div className="px-4 py-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMuted(!isMuted);
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        isMuted 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                    title={isMuted ? 'Bật âm' : 'Tắt âm'}
                                >
                                    {isMuted ? <VolumeX size={16} /> : <Volume1 size={16} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setVolume(val);
                                        if (val > 0) setIsMuted(false);
                                    }}
                                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#C69C6D]"
                                />
                                <span className="text-xs text-white/40 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                            </div>
                        </div>
                        
                        {/* Mode Buttons */}
                        <div className="px-4 py-3 flex items-center justify-between gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLooping(!isLooping);
                                }}
                                className={`flex-1 p-2 text-xs rounded-lg transition-all font-semibold ${
                                    isLooping
                                        ? 'bg-[#C69C6D]/20 text-[#C69C6D]'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                                title="Lặp 1 bài"
                            >
                                <Repeat1 size={14} className="mx-auto" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsShuffling(!isShuffling);
                                }}
                                className={`flex-1 p-2 text-xs rounded-lg transition-all font-semibold ${
                                    isShuffling
                                        ? 'bg-[#C69C6D]/20 text-[#C69C6D]'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                                title="Trộn bài"
                            >
                                <Shuffle size={14} className="mx-auto" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(true);
                                }}
                                className="flex-1 p-2 text-xs bg-white/5 text-white/60 hover:bg-white/10 rounded-lg transition-all font-semibold"
                                title="Mở playlist đầy đủ"
                            >
                                <Music size={14} className="mx-auto" />
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Main Music Button - 1 nút duy nhất */}
                {!isOpen && (
                    <button 
                        onClick={() => setShowQuickControls(!showQuickControls)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center relative active:scale-95 transition-all border shadow-lg ${
                            isPlaying 
                                ? 'bg-[#C69C6D] border-[#C69C6D] text-black shadow-[0_0_15px_rgba(198,156,109,0.4)] animate-[spin_4s_linear_infinite]' 
                                : 'bg-black/40 border-white/20 text-white hover:bg-white/10 backdrop-blur-md'
                        }`}
                        title="Điều khiển nhạc"
                    >
                        <Music size={18} />
                    </button>
                )}
            </div>
            
            {mounted && createPortal(modalContent, document.body)}
        </>
    );
}