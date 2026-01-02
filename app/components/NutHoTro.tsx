"use client";

import React, { useState, useEffect, useRef } from "react";
// ... (Giữ nguyên imports)
import {
  MessageCircle,
  Phone,
  X,
  Send,
  Zap,
  LogIn,
  User,
  AlertTriangle,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";
import { useRouter } from "next/navigation";
import { compressImage } from "@/app/ThuVien/compressImage";

// ... (Giữ nguyên hook useSoundEffect)
const useSoundEffect = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/click.mp3");
      audioRef.current.volume = 0.5;
    }
  }, []);

  return () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
};

export default function NutHoTro() {
  const { user } = useUser();
  const router = useRouter();
  const playClick = useSoundEffect();

  // ... (Giữ nguyên State và Refs)
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"form_guest" | "chat">("form_guest");
  const [isSending, setIsSending] = useState(false);

  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "" });
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [onlineStaffCount, setOnlineStaffCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (Giữ nguyên các useEffect 1, 2, 3 và logic showUrgentCall)

  // 1. KIỂM TRA TRẠNG THÁI NGƯỜI DÙNG KHI MỞ
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setViewMode("chat");
        initChatSession(
          user.id,
          user.ho_ten || "Khách hàng",
          user.so_dien_thoai
        );
      } else {
        const savedGuest = localStorage.getItem("guest_chat_info");
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          setGuestInfo(parsed);
          setViewMode("chat");
          initChatSession(null, parsed.name, parsed.phone);
        } else {
          setViewMode("form_guest");
        }
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    const channel = supabase.channel("online-users-counter");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineStaffCount(Object.keys(state).length);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, viewMode, isOpen]);

  const showUrgentCall = React.useMemo(() => {
    if (messages.length < 3) return false;
    const last3 = messages.slice(-3);
    return last3.every((m) => !m.la_nhan_vien);
  }, [messages]);

  // ... (Giữ nguyên initChatSession và subscribeToChat)
  const initChatSession = async (
    userId: string | null,
    name: string,
    phone: string | null
  ) => {
    let query = supabase
      .from("tu_van_sessions")
      .select("id")
      .neq("trang_thai", "ket_thuc");

    if (userId) {
      query = query.eq("khach_hang_id", userId);
    } else {
      query = query.eq("sdt_lien_he", phone);
    }

    const { data: existingList } = await query
      .order("cap_nhat_luc", { ascending: false })
      .limit(1);
    const existing =
      existingList && existingList.length > 0 ? existingList[0] : null;

    if (existing) {
      console.log("🟢 Found existing session:", existing.id);
      setSessionId(existing.id);
      subscribeToChat(existing.id);
    } else {
      console.log("⚪ No active session found, ready to create new one.");
    }
  };

  const subscribeToChat = async (sId: string) => {
    const { data } = await supabase
      .from("tu_van_messages")
      .select("*")
      .eq("session_id", sId)
      .order("tao_luc", { ascending: true });
    if (data) setMessages(data);

    const channel = supabase
      .channel(`guest_chat_${sId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tu_van_messages",
          filter: `session_id=eq.${sId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // 5. XỬ LÝ GỬI TIN - 🟢 ĐÃ CẬP NHẬT ĐỂ GỬI PUSH NOTIFICATION
  const handleSend = async (file?: File) => {
    if (!inputMsg.trim() && !file) return;

    playClick();
    setIsSending(true);
    const text = inputMsg;
    setInputMsg("");

    try {
      let activeSessionId = sessionId;
      let imageUrl = null;
      let isNewSession = false; // Flag để check session mới

      if (file) {
        try {
          const compressed = await compressImage(file, 0.7, 1200);
          const fileName = `chat_${Date.now()}_${file.name.replace(
            /[^a-zA-Z0-9.]/g,
            ""
          )}`;
          const { error: upErr } = await supabase.storage
            .from("images")
            .upload(fileName, compressed);
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        } catch (e) {
          console.error("Upload error:", e);
          setIsSending(false);
          return;
        }
      }

      if (!activeSessionId) {
        const { data: newSession, error } = await supabase
          .from("tu_van_sessions")
          .insert({
            khach_hang_id: user?.id || null,
            khach_vang_lai_id: !user ? `guest_${Date.now()}` : null,
            ten_hien_thi: user?.ho_ten || guestInfo.name,
            sdt_lien_he: user?.so_dien_thoai || guestInfo.phone,
            loai_khach: user ? "thanh_vien" : "vang_lai",
            trang_thai: "cho_tu_van",
            tin_nhan_cuoi: imageUrl ? "[Hình ảnh]" : text,
          })
          .select()
          .single();

        if (error) throw error;
        activeSessionId = newSession.id;
        setSessionId(newSession.id);
        subscribeToChat(newSession.id);
        isNewSession = true; // Đánh dấu là session mới
      } else {
        await supabase
          .from("tu_van_sessions")
          .update({
            tin_nhan_cuoi: imageUrl
              ? text
                ? `[Ảnh] ${text}`
                : "[Hình ảnh]"
              : text,
            cap_nhat_luc: new Date().toISOString(),
          })
          .eq("id", activeSessionId);
      }

      await supabase.from("tu_van_messages").insert({
        session_id: activeSessionId,
        nguoi_gui_id: user?.id || "guest",
        la_nhan_vien: false,
        noi_dung: text,
        hinh_anh: imageUrl,
      });

      // 🟢 GỌI API BẮN NOTIFICATION CHO NHÂN VIÊN
      // Chỉ bắn nếu là session mới hoặc tin nhắn quan trọng, ở đây ta bắn luôn để nhân viên biết
      // Có thể tối ưu chỉ bắn nếu session chưa có người phụ trách
      fetch("/api/push/notify-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Khách mới: ${user?.ho_ten || guestInfo.name}`,
          body: text || (imageUrl ? "Đã gửi một ảnh" : "Cần hỗ trợ tư vấn"),
          url: isNewSession ? "/phongsales" : undefined, // Link về phòng sales
        }),
      }).catch((err) => console.error("Push notify error:", err));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ... (Giữ nguyên phần còn lại handleGuestSubmit, handleGoToLogin, Render)
  const handleGuestSubmit = () => {
    playClick();
    if (!guestInfo.name.trim() || !guestInfo.phone.trim()) {
      alert("Vui lòng điền đủ Tên và SĐT!");
      return;
    }
    localStorage.setItem("guest_chat_info", JSON.stringify(guestInfo));
    setViewMode("chat");
    initChatSession(null, guestInfo.name, guestInfo.phone);
  };

  const handleGoToLogin = () => {
    playClick();
    setIsOpen(false);
    router.push("/?login=1");
  };

  if (user?.userType === "nhan_su") return null;

  return (
    <>
      <style jsx global>{`
        .cyber-panel {
          background: rgba(20, 18, 16, 0.95);
          border: 1px solid rgba(198, 156, 109, 0.3);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.8);
          border-radius: 16px;
          backdrop-filter: blur(12px);
        }
        .cyber-input {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
          border-left: none;
          border-right: none;
          color: #f5e6d3;
          font-family: serif;
          transition: all 0.3s;
        }
        .cyber-input:focus {
          border-bottom-color: #c69c6d;
          background: rgba(198, 156, 109, 0.05);
        }
        .chat-bubble-guest {
          background: #c69c6d;
          color: #1a120f;
          border-radius: 12px 12px 2px 12px;
        }
        .chat-bubble-staff {
          background: rgba(255, 255, 255, 0.1);
          color: #f5e6d3;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px 12px 12px 2px;
        }
      `}</style>

      <div className="fixed bottom-6 left-6 z-[9000] font-sans flex flex-col items-start gap-4">
        {isOpen && (
          <div className="cyber-panel w-[320px] h-[480px] flex flex-col animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#C69C6D]/30 bg-black/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#C69C6D]" size={18} />
                <div>
                  <h3 className="text-xs font-bold text-[#C69C6D] uppercase tracking-widest">
                    Hỗ Trợ Trực Tuyến
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        onlineStaffCount > 0
                          ? "bg-green-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-[9px] text-white/50">
                      {onlineStaffCount > 0
                        ? "Nhân viên Online"
                        : "Nhân viên Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {viewMode === "form_guest" && (
              <div className="flex-1 p-6 flex flex-col justify-center space-y-5">
                <div className="text-center space-y-2">
                  <User size={40} className="mx-auto text-[#C69C6D]/80" />
                  <h4 className="text-white font-bold text-sm">
                    THÔNG TIN LIÊN HỆ
                  </h4>
                  <p className="text-white/50 text-xs">
                    Vui lòng cho biết tên và số điện thoại để nhân viên hỗ trợ
                    bạn tốt nhất.
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    placeholder="Họ và tên của bạn..."
                    className="cyber-input w-full p-3 rounded text-xs outline-none"
                    value={guestInfo.name}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, name: e.target.value })
                    }
                  />
                  <input
                    placeholder="Số điện thoại / Email..."
                    className="cyber-input w-full p-3 rounded text-xs outline-none"
                    value={guestInfo.phone}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, phone: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={handleGuestSubmit}
                  className="w-full py-3 bg-[#C69C6D] hover:bg-white text-black font-bold text-xs uppercase tracking-widest transition-all rounded clip-path-polygon"
                >
                  Bắt đầu trò chuyện
                </button>
                <div className="relative border-t border-white/10 my-4 text-center">
                  <span className="bg-[#0a0a0a] px-2 text-[9px] text-white/30 absolute -top-2 left-1/2 -translate-x-1/2">
                    HOẶC
                  </span>
                </div>
                <button
                  onClick={handleGoToLogin}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-white/20 hover:border-[#C69C6D] text-white/70 hover:text-[#C69C6D] text-xs font-bold uppercase transition-all rounded"
                >
                  <LogIn size={14} /> Đăng Nhập Tài Khoản
                </button>
              </div>
            )}

            {viewMode === "chat" && (
              <>
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
                  ref={scrollRef}
                >
                  <div className="text-center text-[10px] text-white/20 uppercase tracking-widest my-2 font-mono">
                    --- Secure Channel Opened ---
                  </div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.la_nhan_vien ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 text-xs font-medium ${
                          m.la_nhan_vien
                            ? "chat-bubble-staff"
                            : "chat-bubble-guest"
                        }`}
                      >
                        {m.hinh_anh && (
                          <img
                            src={m.hinh_anh}
                            alt="img"
                            className="w-full h-auto rounded-lg mb-2 border border-black/20"
                          />
                        )}
                        {m.noi_dung}
                      </div>
                    </div>
                  ))}
                  {showUrgentCall && (
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex gap-3 animate-pulse mt-4">
                      <AlertTriangle
                        className="text-red-500 shrink-0"
                        size={20}
                      />
                      <div>
                        <p className="text-red-400 text-xs font-bold mb-1">
                          HỆ THỐNG ĐANG BẬN
                        </p>
                        <p className="text-white/70 text-[10px] mb-2">
                          Chưa có phản hồi. Vui lòng gọi:
                        </p>
                        <div className="flex gap-2">
                          <a
                            href="tel:0939941588"
                            className="bg-red-600 hover:bg-red-500 text-white text-[9px] px-2 py-1 rounded font-bold"
                          >
                            MS. CHI
                          </a>
                          <a
                            href="tel:0939852511"
                            className="bg-red-600 hover:bg-red-500 text-white text-[9px] px-2 py-1 rounded font-bold"
                          >
                            MR. TOMMY
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#111] border-t border-white/10 flex gap-2 items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="p-2 text-gray-400 hover:text-[#C69C6D] transition-colors"
                    title="Gửi ảnh"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleSend(e.target.files[0]);
                    }}
                  />

                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:border-[#C69C6D] outline-none placeholder-white/30"
                    placeholder={isSending ? "Đang gửi..." : "Nhập tin nhắn..."}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isSending}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isSending}
                    className="p-2 bg-[#C69C6D] hover:bg-white text-black rounded transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => {
            playClick();
            setIsOpen(!isOpen);
          }}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(198,156,109,0.6)] transition-all active:scale-95 border-2 ${
            isOpen
              ? "bg-white border-white rotate-90 text-black"
              : "bg-[#0a0a0a] border-[#C69C6D] text-[#C69C6D] animate-bounce-slow"
          }`}
        >
          {isOpen ? <X size={24} /> : <Zap size={28} fill="currentColor" />}
          {!isOpen && onlineStaffCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border border-black"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
}
