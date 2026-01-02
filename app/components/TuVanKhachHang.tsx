"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  X,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  Shield,
  Briefcase,
  Image as ImageIcon,
  Loader2,
  BellRing, // Thêm icon chuông
} from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";
import { compressImage } from "@/app/ThuVien/compressImage";

// Helper format thời gian
const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function TuVanKhachHang() {
  const { user } = useUser();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"waiting" | "my_chats">("waiting");

  // Chúng ta sẽ load tất cả session liên quan (Chờ + Của mình) để tính toán badge cho đúng
  const [allSessions, setAllSessions] = useState<any[]>([]);

  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Âm thanh loop
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init âm thanh
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Sử dụng file âm thanh reo chuông.
      // Bạn nên có file /sounds/ring.mp3, nếu chưa có hãy copy file mp3 chuông điện thoại vào public/sounds
      ringtoneRef.current = new Audio("/sounds/ring.mp3");
      ringtoneRef.current.loop = true; // 🔁 LẶP LẠI LIÊN TỤC
    }
  }, []);

  // Hàm fetch sessions (Lấy cả WAITING và MY CHATS)
  const fetchAllSessions = async () => {
    if (!user) return;

    // Lấy session chưa có người phụ trách HOẶC do mình phụ trách
    // (Lọc client side cho đơn giản logic realtime)
    const { data } = await supabase
      .from("tu_van_sessions")
      .select("*")
      .neq("trang_thai", "ket_thuc") // Không lấy cái đã đóng
      .order("cap_nhat_luc", { ascending: false });

    if (data) setAllSessions(data);
  };

  // 1. LUÔN LUÔN LẮNG NGHE (REALTIME) - KHÔNG CẦN ISOPEN
  useEffect(() => {
    if (!user) return;

    fetchAllSessions(); // Load lần đầu

    const channel = supabase
      .channel("staff_chat_global_listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tu_van_sessions" },
        () => {
          fetchAllSessions(); // Reload khi có thay đổi bất kỳ
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Lọc danh sách hiển thị theo Tab
  const displayedSessions = useMemo(() => {
    if (!user) return [];
    if (activeTab === "waiting") {
      return allSessions.filter((s) => !s.nhan_su_phu_trach_id);
    } else {
      return allSessions.filter((s) => s.nhan_su_phu_trach_id === user.id);
    }
  }, [allSessions, activeTab, user]);

  // Tính số lượng khách đang chờ (Global)
  const waitingCount = useMemo(() => {
    return allSessions.filter((s) => !s.nhan_su_phu_trach_id).length;
  }, [allSessions]);

  // 2. XỬ LÝ ÂM THANH REO LIÊN TỤC & VISUAL
  useEffect(() => {
    // Chỉ reo nếu có khách chờ VÀ đang đóng cửa sổ chat
    if (waitingCount > 0 && !isOpen) {
      ringtoneRef.current?.play().catch(() => {}); // Bỏ qua lỗi nếu trình duyệt chặn autoplay
    } else {
      // Tắt chuông ngay lập tức nếu mở cửa sổ hoặc hết khách
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  }, [waitingCount, isOpen]);

  // 3. LOAD TIN NHẮN CHI TIẾT
  useEffect(() => {
    if (!selectedSession) return;
    const loadMsgs = async () => {
      const { data } = await supabase
        .from("tu_van_messages")
        .select("*")
        .eq("session_id", selectedSession.id)
        .order("tao_luc", { ascending: true });
      if (data) setMessages(data);
      scrollToBottom();
    };
    loadMsgs();

    const channel = supabase
      .channel(`staff_chat_room_${selectedSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tu_van_messages",
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  // 4. TIẾP NHẬN & GỬI TIN
  const handleClaimSession = async () => {
    if (!selectedSession || !user) return;
    setIsClaiming(true);
    try {
      const { error } = await supabase
        .from("tu_van_sessions")
        .update({ nhan_su_phu_trach_id: user.id, trang_thai: "dang_tu_van" })
        .eq("id", selectedSession.id);
      if (!error) {
        // Update local state optimistic
        const updatedSession = {
          ...selectedSession,
          nhan_su_phu_trach_id: user.id,
          trang_thai: "dang_tu_van",
        };
        setSelectedSession(updatedSession);

        // Update list
        setAllSessions((prev) =>
          prev.map((s) => (s.id === selectedSession.id ? updatedSession : s))
        );

        setActiveTab("my_chats");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSend = async (file?: File) => {
    if ((!inputMsg.trim() && !file) || !selectedSession || !user) return;
    const isManager = ["admin", "quanly", "boss"].includes(user.role || "");
    if (!selectedSession.nhan_su_phu_trach_id && !isManager) {
      if (confirm("Tiếp nhận khách này trước khi chat?"))
        await handleClaimSession();
      else return;
    }

    setIsSending(true);
    const text = inputMsg;
    setInputMsg("");

    try {
      let imageUrl = null;
      if (file) {
        const compressed = await compressImage(file, 0.7, 1200);
        const fileName = `staff_${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("images")
          .upload(fileName, compressed);
        if (!upErr) {
          const { data } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      }

      await supabase.from("tu_van_messages").insert({
        session_id: selectedSession.id,
        nguoi_gui_id: user.id,
        la_nhan_vien: true,
        noi_dung: text,
        hinh_anh: imageUrl,
      });

      await supabase
        .from("tu_van_sessions")
        .update({
          tin_nhan_cuoi: imageUrl
            ? text
              ? `[Ảnh] ${text}`
              : "[Hình ảnh]"
            : `TVV: ${text}`,
          cap_nhat_luc: new Date().toISOString(),
        })
        .eq("id", selectedSession.id);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user || user.userType !== "nhan_su") return null;

  const isManager = ["admin", "quanly", "boss"].includes(user.role || "");
  const UserIcon = isManager ? Shield : Briefcase;

  return (
    <>
      <style jsx global>{`
        /* Animation Rung Lắc mạnh khi có thông báo */
        @keyframes ring-shake {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: rotate(-10deg) scale(1.1);
          }
          20%,
          40%,
          60%,
          80% {
            transform: rotate(10deg) scale(1.1);
          }
        }
        .animate-ring {
          animation: ring-shake 0.8s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed bottom-6 left-6 z-[9000] font-sans flex flex-col items-start gap-3">
        {/* PANEL CHAT */}
        {isOpen && (
          <div className="fixed left-4 right-4 bottom-24 h-[80vh] md:static md:w-[800px] md:h-[500px] bg-[#0a0a0a] border border-[#C69C6D]/50 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* CỘT TRÁI: DANH SÁCH */}
            <div className="w-full h-[35%] md:w-[30%] md:h-full border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#111]">
              <div className="p-3 border-b border-white/10 bg-[#C69C6D]/10">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon size={16} className="text-[#C69C6D]" />
                  <span className="text-xs font-bold text-white uppercase truncate">
                    {user.ho_ten}
                  </span>
                </div>
                <div className="flex bg-black/50 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("waiting")}
                    className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${
                      activeTab === "waiting"
                        ? "bg-red-600 text-white shadow-lg shadow-red-900/50"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    CHỜ ({waitingCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("my_chats")}
                    className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${
                      activeTab === "my_chats"
                        ? "bg-[#C69C6D] text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    CỦA TÔI
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {displayedSessions.length === 0 && (
                  <div className="text-center text-white/20 text-xs py-10">
                    Không có dữ liệu
                  </div>
                )}
                {displayedSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 relative ${
                      selectedSession?.id === s.id ? "bg-white/10" : ""
                    }`}
                  >
                    {!s.nhan_su_phu_trach_id && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    )}
                    <div className="font-bold text-xs text-white mb-1 truncate pr-4">
                      {s.ten_hien_thi}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {s.tin_nhan_cuoi}
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-500 mt-1">
                      <span>{formatTime(s.cap_nhat_luc)}</span>
                      {s.loai_khach === "vip" && (
                        <span className="text-yellow-500 border border-yellow-500/30 px-1 rounded">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI (CHAT) */}
            <div className="flex-1 flex flex-col bg-[#050505] relative h-[65%] md:h-full">
              {selectedSession ? (
                <>
                  <div className="h-12 border-b border-white/10 flex justify-between items-center px-4 bg-[#111]">
                    <span className="font-bold text-white text-sm">
                      {selectedSession.ten_hien_thi}
                    </span>
                    <div className="flex gap-2">
                      {!selectedSession.nhan_su_phu_trach_id && (
                        <button
                          onClick={handleClaimSession}
                          className="px-3 py-1 bg-[#C69C6D] text-black text-xs font-bold rounded animate-pulse shadow-lg shadow-[#C69C6D]/20"
                        >
                          TIẾP NHẬN
                        </button>
                      )}
                      <button onClick={() => setIsOpen(false)}>
                        <X
                          size={18}
                          className="text-gray-400 hover:text-white"
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/50"
                    ref={scrollRef}
                  >
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.la_nhan_vien ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-xs ${
                            m.la_nhan_vien
                              ? "bg-[#C69C6D] text-black"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {m.hinh_anh && (
                            <img
                              src={m.hinh_anh}
                              className="w-full h-auto rounded mb-1"
                            />
                          )}
                          {m.noi_dung}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/10 bg-[#111] flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-[#C69C6D]"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && handleSend(e.target.files[0])
                      }
                    />
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#C69C6D] outline-none"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={
                        isSending ||
                        (!selectedSession.nhan_su_phu_trach_id && !isManager)
                      }
                      placeholder={
                        !selectedSession.nhan_su_phu_trach_id && !isManager
                          ? "Cần tiếp nhận..."
                          : "Nhập tin nhắn..."
                      }
                    />
                    <button
                      onClick={() => handleSend()}
                      className="p-2 bg-[#C69C6D] text-black rounded"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/20 select-none">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest text-center">
                    Chọn khách để chat
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NÚT TRÒN CHÍNH - UPDATE VISUAL MẠNH HƠN */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 
              ${
                waitingCount > 0 && !isOpen
                  ? "bg-red-600 border-white animate-ring shadow-red-500/80 z-[9001]" // 🔥 Nổi bật cực mạnh khi có khách
                  : isOpen
                  ? "bg-[#1a1a1a] border-[#C69C6D] text-[#C69C6D]"
                  : "bg-[#C69C6D] border-[#C69C6D] text-black hover:scale-110 active:scale-95 animate-bounce-slow"
              }
          `}
        >
          {/* Icon thay đổi khi có khách chờ */}
          {waitingCount > 0 && !isOpen ? (
            <BellRing size={28} className="text-white fill-white" />
          ) : isOpen ? (
            <X size={24} />
          ) : (
            <User size={28} fill="currentColor" />
          )}

          {/* Badge số lượng lớn hơn */}
          {!isOpen && waitingCount > 0 && (
            <span className="absolute -top-3 -right-3 w-7 h-7 bg-white text-red-600 border-2 border-red-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-20">
              {waitingCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
