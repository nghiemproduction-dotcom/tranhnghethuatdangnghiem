"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageCircle,
  X,
  Send,
  User,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
  Headphones,
  PhoneCall,
  Info,
  LogIn,
} from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";
import { useRouter } from "next/navigation";
import { compressImage } from "@/app/ThuVien/compressImage";

// Hook âm thanh click nhẹ
const useSoundEffect = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/click.mp3");
      audioRef.current.volume = 0.5;
    }
  }, []);
  return () => audioRef.current?.play().catch(() => {});
};

export default function NutHoTro() {
  const { user } = useUser();
  const router = useRouter();
  const playClick = useSoundEffect();

  // State
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

  // 1. REALTIME STAFF COUNT
  useEffect(() => {
    const channel = supabase.channel("online-users-counter");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const allUsers: any[] = Object.values(state).flat();

        // Lọc những người có role hỗ trợ
        const supportStaff = allUsers.filter(
          (u) =>
            u.role &&
            ["admin", "boss", "quanly", "sales"].includes(u.role.toLowerCase())
        );

        setOnlineStaffCount(supportStaff.length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. CHECK USER & RESTORE SESSION
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
        const saved = localStorage.getItem("guest_chat_info");
        if (saved) {
          const p = JSON.parse(saved);
          setGuestInfo(p);
          setViewMode("chat");
          initChatSession(null, p.name, p.phone);
        } else {
          setViewMode("form_guest");
        }
      }
    }
  }, [isOpen, user]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, viewMode, isOpen]);

  // 3. LOGIC HIỂN THỊ THÔNG BÁO LỊCH SỰ
  const showPoliteMessage = useMemo(() => {
    if (messages.length < 2) return false;
    const last2 = messages.slice(-2);
    return last2.every((m) => !m.la_nhan_vien);
  }, [messages]);

  // Init Session
  const initChatSession = async (
    userId: string | null,
    name: string,
    phone: string | null
  ) => {
    let q = supabase
      .from("tu_van_sessions")
      .select("id")
      .neq("trang_thai", "ket_thuc");
    if (userId) q = q.eq("khach_hang_id", userId);
    else q = q.eq("sdt_lien_he", phone);

    const { data } = await q
      .order("cap_nhat_luc", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      setSessionId(data[0].id);
      subscribeToChat(data[0].id);
    }
  };

  // Subscribe Chat
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
          setMessages((p) => [...p, payload.new]);
          if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  };

  // 4. GỬI TIN NHẮN
  const handleSend = async (file?: File) => {
    if (!inputMsg.trim() && !file) return;
    setIsSending(true);
    const text = inputMsg;
    setInputMsg("");

    try {
      let activeId = sessionId;
      let imgUrl = null;
      let isNew = false;

      if (file) {
        const compressed = await compressImage(file, 0.7, 1200);
        const name = `chat_${Date.now()}_${file.name.replace(/\W/g, "")}`;
        const { error: upErr } = await supabase.storage
          .from("images")
          .upload(name, compressed);
        if (!upErr) {
          const { data } = supabase.storage.from("images").getPublicUrl(name);
          imgUrl = data.publicUrl;
        }
      }

      if (!activeId) {
        const { data: newSess, error } = await supabase
          .from("tu_van_sessions")
          .insert({
            khach_hang_id: user?.id || null,
            khach_vang_lai_id: !user ? `guest_${Date.now()}` : null,
            ten_hien_thi: user?.ho_ten || guestInfo.name,
            sdt_lien_he: user?.so_dien_thoai || guestInfo.phone,
            loai_khach: user ? "thanh_vien" : "vang_lai",
            trang_thai: "cho_tu_van",
            tin_nhan_cuoi: imgUrl ? "[Hình ảnh]" : text,
          })
          .select()
          .single();
        if (!error) {
          activeId = newSess.id;
          setSessionId(newSess.id);
          subscribeToChat(newSess.id);
          isNew = true;
        }
      } else {
        await supabase
          .from("tu_van_sessions")
          .update({
            tin_nhan_cuoi: imgUrl
              ? text
                ? `[Ảnh] ${text}`
                : "[Hình ảnh]"
              : text,
            cap_nhat_luc: new Date().toISOString(),
          })
          .eq("id", activeId);
      }

      if (activeId) {
        await supabase.from("tu_van_messages").insert({
          session_id: activeId,
          nguoi_gui_id: user?.id || "guest",
          la_nhan_vien: false,
          noi_dung: text,
          hinh_anh: imgUrl,
        });

        // Gửi Push Notification cho nhân viên
        fetch("/api/push/notify-staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Khách: ${user?.ho_ten || guestInfo.name}`,
            body: text || "Đã gửi ảnh",
            url: isNew ? "/phongsales" : undefined,
          }),
        }).catch(() => {});
      }
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGuestSubmit = () => {
    if (!guestInfo.name.trim() || !guestInfo.phone.trim())
      return alert("Vui lòng nhập tên và SĐT");
    localStorage.setItem("guest_chat_info", JSON.stringify(guestInfo));
    setViewMode("chat");
    initChatSession(null, guestInfo.name, guestInfo.phone);
  };

  return (
    <>
      <style jsx global>{`
        .glass-panel {
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(198, 156, 109, 0.2); /* Đổi border sang phải cho đẹp */
          box-shadow: 10px 0 50px rgba(0, 0, 0, 0.8);
        }
        .chat-bubble-guest {
          background: #c69c6d;
          color: #000;
          border-radius: 12px 12px 2px 12px;
        }
        .chat-bubble-staff {
          background: #222;
          color: #fff;
          border: 1px solid #333;
          border-radius: 12px 12px 12px 2px;
        }
      `}</style>

      {/* 🟢 1. DỜI CONTAINER VỀ BÊN TRÁI (left-6) & ALIGN ITEMS START */}
      <div className="fixed bottom-6 left-6 z-[9000] font-sans flex flex-col items-start gap-4">
        {/* PANEL LỚN: Full màn hình mobile, Full chiều cao bên TRÁI desktop */}
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-start">
            {" "}
            {/* 🟢 justify-start để căn trái */}
            {/* Backdrop tối */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
              onClick={() => setIsOpen(false)}
            ></div>
            {/* 🟢 SLIDE TỪ TRÁI QUA (slide-in-from-left) */}
            <div className="relative w-full md:w-[450px] h-full glass-panel flex flex-col animate-in slide-in-from-left duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#C69C6D]/20 bg-[#151515]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C69C6D]/10 flex items-center justify-center text-[#C69C6D]">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                      Trung Tâm Hỗ Trợ
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          onlineStaffCount > 0
                            ? "bg-green-500 animate-pulse"
                            : "bg-gray-500"
                        }`}
                      ></span>
                      <span className="text-[10px] text-white/60">
                        {onlineStaffCount > 0
                          ? `${onlineStaffCount} tư vấn viên Online`
                          : "Đang ngoại tuyến"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                {viewMode === "form_guest" ? (
                  <div className="flex-1 flex flex-col justify-center p-8 space-y-6 animate-in zoom-in-95">
                    <div className="text-center space-y-3">
                      <ShieldCheck
                        size={48}
                        className="mx-auto text-[#C69C6D]"
                      />
                      <h3 className="text-lg font-bold text-white">
                        Kết Nối Với Chúng Tôi
                      </h3>
                      <p className="text-white/50 text-sm">
                        Để được hỗ trợ tốt nhất, quý khách vui lòng để lại thông
                        tin liên hệ.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <input
                        placeholder="Họ và tên của bạn"
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#C69C6D] transition-all"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                      />
                      <input
                        placeholder="Số điện thoại liên hệ"
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#C69C6D] transition-all"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                      />
                      <button
                        onClick={handleGuestSubmit}
                        className="w-full py-4 bg-[#C69C6D] text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(198,156,109,0.3)]"
                      >
                        Bắt đầu trò chuyện
                      </button>
                    </div>
                    <div className="text-center pt-4 border-t border-white/5">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push("/?login=1");
                        }}
                        className="text-white/40 hover:text-[#C69C6D] text-xs uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <LogIn size={14} /> Đăng nhập tài khoản
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat Messages */}
                    <div
                      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                      ref={scrollRef}
                    >
                      <div className="text-center py-4">
                        <span className="text-[10px] text-white/20 uppercase tracking-widest border px-3 py-1 rounded-full border-white/10">
                          Kênh hỗ trợ bảo mật
                        </span>
                      </div>
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${
                            m.la_nhan_vien ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 text-sm font-medium shadow-md ${
                              m.la_nhan_vien
                                ? "chat-bubble-staff"
                                : "chat-bubble-guest"
                            }`}
                          >
                            {m.hinh_anh && (
                              <img
                                src={m.hinh_anh}
                                className="w-full h-auto rounded-lg mb-2 border border-black/10"
                              />
                            )}
                            {m.noi_dung}
                          </div>
                        </div>
                      ))}

                      {/* Thông báo lịch sự khi chờ lâu */}
                      {showPoliteMessage && (
                        <div className="bg-[#15202B] border border-[#C69C6D]/30 p-4 rounded-xl flex gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-xl mx-2">
                          <Info className="text-[#C69C6D] shrink-0" size={24} />
                          <div className="flex-1">
                            <p className="text-[#C69C6D] text-sm font-bold mb-1">
                              QUÝ KHÁCH CẦN HỖ TRỢ GẤP?
                            </p>
                            <p className="text-white/70 text-xs mb-3 leading-relaxed">
                              Hiện tại các tư vấn viên đang bận. Quý khách vui
                              lòng gọi trực tiếp để được ưu tiên phục vụ.
                            </p>
                            <div className="flex gap-2">
                              <a
                                href="tel:0939941588"
                                className="flex-1 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <PhoneCall size={12} /> MS. CHI
                              </a>
                              <a
                                href="tel:0939852511"
                                className="flex-1 bg-[#065F46] hover:bg-[#047857] text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <PhoneCall size={12} /> MR. TOMMY
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#111] border-t border-white/10 flex gap-3 items-end">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-[#C69C6D] transition-colors h-[46px] w-[46px] flex items-center justify-center"
                      >
                        <ImageIcon size={20} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files?.[0] && handleSend(e.target.files[0])
                        }
                      />

                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 min-h-[46px] focus-within:border-[#C69C6D] transition-colors">
                        <input
                          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none py-3"
                          placeholder={
                            isSending ? "Đang gửi..." : "Nhập tin nhắn..."
                          }
                          value={inputMsg}
                          onChange={(e) => setInputMsg(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          disabled={isSending}
                        />
                        <button
                          onClick={() => handleSend()}
                          disabled={isSending}
                          className="ml-2 text-[#C69C6D] hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {isSending ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Send size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => {
              playClick();
              setIsOpen(true);
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-[#C69C6D] text-black shadow-[0_0_30px_rgba(198,156,109,0.4)] hover:scale-110 active:scale-95 transition-all animate-bounce-slow z-[9000] border-2 border-white/20"
          >
            <MessageCircle size={28} fill="currentColor" />
            {onlineStaffCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
            )}
          </button>
        )}
      </div>
    </>
  );
}
