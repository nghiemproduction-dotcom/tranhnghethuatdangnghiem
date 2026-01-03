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
  BellRing,
  UserPlus,
  Users,
  Search,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";
import { compressImage } from "@/app/ThuVien/compressImage";

// Helper format thời gian
const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function TuVanKhachHang() {
  const { user } = useUser();

  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"waiting" | "my_chats" | "all">(
    "waiting"
  );

  // Dữ liệu
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]); // Danh sách nhân viên để mời

  // Chat
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");

  // Loading & UI
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false); // Popup mời nhân viên

  // Refs
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quyền hạn
  const isManager =
    user && ["admin", "quanly", "boss"].includes(user.role || "");

  // --- 1. INIT & REALTIME ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      ringtoneRef.current = new Audio("/sounds/ring.mp3");
      ringtoneRef.current.loop = true;
    }
  }, []);

  // Load danh sách nhân viên (để mời hỗ trợ)
  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("nhan_su")
        .select("id, ho_ten, hinh_anh, vi_tri")
        .eq("trang_thai", "dang_lam_viec");
      if (data) setStaffList(data);
    };
    if (user) fetchStaff();
  }, [user]);

  // Load Sessions & Subscribe
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const { data } = await supabase
        .from("tu_van_sessions")
        .select("*")
        .neq("trang_thai", "ket_thuc")
        .order("cap_nhat_luc", { ascending: false });
      if (data) setAllSessions(data);
    };

    fetchSessions();

    const channel = supabase
      .channel("staff_chat_global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tu_van_sessions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAllSessions((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAllSessions((prev) =>
              prev.map((s) => (s.id === payload.new.id ? payload.new : s))
            );
            // Nếu đang mở chat của session này -> Update luôn selectedSession để UI phản hồi ngay (vd: đã đọc)
            if (selectedSession?.id === payload.new.id) {
              setSelectedSession(payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedSession?.id]); // Thêm dependency để update state realtime

  // --- 2. LOGIC PHÂN LOẠI & BADGE ---

  // Lọc danh sách theo Tab
  const displayedSessions = useMemo(() => {
    if (!user) return [];

    // Tab 1: Đang chờ (Chưa có ai nhận)
    if (activeTab === "waiting") {
      return allSessions.filter((s) => !s.nhan_su_phu_trach_id);
    }
    // Tab 2: Của tôi (Phụ trách chính HOẶC Được mời hỗ trợ)
    else if (activeTab === "my_chats") {
      return allSessions.filter(
        (s) =>
          s.nhan_su_phu_trach_id === user.id ||
          (s.ho_tro_vien_ids && s.ho_tro_vien_ids.includes(user.id))
      );
    }
    // Tab 3: Giám sát (Chỉ Admin thấy - Xem tất cả cuộc hội thoại ĐANG DIỄN RA)
    else {
      return allSessions.filter((s) => s.nhan_su_phu_trach_id); // Đã có người nhận
    }
  }, [allSessions, activeTab, user]);

  // Tính Badge Đỏ (Thông báo quan trọng)
  const badgeCount = useMemo(() => {
    if (!user) return 0;

    // 1. Khách mới chưa ai nhận
    const waiting = allSessions.filter((s) => !s.nhan_su_phu_trach_id).length;

    // 2. Tin nhắn mới trong "Của Tôi" (Chưa đọc & Là khách nhắn)
    const myUnread = allSessions.filter(
      (s) =>
        (s.nhan_su_phu_trach_id === user.id ||
          (s.ho_tro_vien_ids && s.ho_tro_vien_ids.includes(user.id))) &&
        s.is_read === false &&
        s.last_sender_type === "customer"
    ).length;

    return waiting + myUnread;
  }, [allSessions, user]);

  // Xử lý chuông reo
  useEffect(() => {
    if (badgeCount > 0 && !isOpen) {
      ringtoneRef.current?.play().catch(() => {});
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  }, [badgeCount, isOpen]);

  // --- 3. XỬ LÝ CHAT CHI TIẾT ---

  // Khi chọn 1 session -> Load tin nhắn & Đánh dấu đã đọc
  const handleSelectSession = async (session: any) => {
    setSelectedSession(session);

    // Load messages
    const { data } = await supabase
      .from("tu_van_messages")
      .select("*")
      .eq("session_id", session.id)
      .order("tao_luc", { ascending: true });
    if (data) setMessages(data);
    scrollToBottom();

    // Nếu là phiên của mình và đang chưa đọc -> Gọi RPC đánh dấu đã đọc
    const isMine =
      session.nhan_su_phu_trach_id === user?.id ||
      (session.ho_tro_vien_ids && session.ho_tro_vien_ids.includes(user?.id));
    if (isMine && !session.is_read && session.last_sender_type === "customer") {
      await supabase.rpc("mark_session_as_read", { p_session_id: session.id });
    }
  };

  // Subscribe tin nhắn mới trong phòng chat
  useEffect(() => {
    if (!selectedSession) return;

    const channel = supabase
      .channel(`room_${selectedSession.id}`)
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

          // Nếu đang mở cửa sổ này mà có tin mới từ khách -> Mark read ngay
          if (!payload.new.la_nhan_vien) {
            supabase.rpc("mark_session_as_read", {
              p_session_id: selectedSession.id,
            });
          }
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

  // --- 4. ACTIONS (Tiếp nhận, Gửi tin, Mời người) ---

  const handleClaimSession = async () => {
    if (!selectedSession || !user) return;
    setIsClaiming(true);
    try {
      // Check concurrency: Xem có ai nhận chưa
      const { data: check } = await supabase
        .from("tu_van_sessions")
        .select("nhan_su_phu_trach_id")
        .eq("id", selectedSession.id)
        .single();
      if (check?.nhan_su_phu_trach_id) {
        alert("Chậm tay rồi! Khách này đã được người khác nhận.");
        setSelectedSession(null); // Thoát ra
        return;
      }

      const { error } = await supabase
        .from("tu_van_sessions")
        .update({
          nhan_su_phu_trach_id: user.id,
          trang_thai: "dang_tu_van",
          ho_tro_vien_ids: [], // Reset list hỗ trợ
        })
        .eq("id", selectedSession.id);

      if (!error) {
        setActiveTab("my_chats"); // Chuyển tab tự động
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSend = async (file?: File) => {
    if ((!inputMsg.trim() && !file) || !selectedSession || !user) return;

    // Nếu chưa ai nhận -> Tự động nhận luôn khi gửi tin (dành cho Admin nhảy vào can thiệp)
    if (!selectedSession.nhan_su_phu_trach_id) {
      if (!confirm("Bạn muốn tiếp nhận và trả lời khách này?")) return;
      await handleClaimSession();
    }

    setIsSending(true);
    const text = inputMsg;
    setInputMsg("");

    try {
      let imageUrl = null;
      if (file) {
        const compressed = await compressImage(file, 0.7, 1200);
        const fileName = `staff_chat_${Date.now()}_${file.name}`;
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

      // Insert tin nhắn -> Trigger DB sẽ tự update session (is_read, tin_nhan_cuoi)
      await supabase.from("tu_van_messages").insert({
        session_id: selectedSession.id,
        nguoi_gui_id: user.id,
        la_nhan_vien: true,
        noi_dung: text,
        hinh_anh: imageUrl,
      });
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    }
  };

  const handleInviteStaff = async (staffId: string) => {
    if (!selectedSession) return;
    await supabase.rpc("invite_staff_to_session", {
      p_session_id: selectedSession.id,
      p_staff_id: staffId,
    });
    setShowInvitePopup(false);
    alert("Đã mời nhân viên vào hỗ trợ!");
  };

  // --- RENDER UI ---
  if (!user || user.userType !== "nhan_su") return null;
  const UserIcon = isManager ? Shield : Briefcase;

  return (
    <>
      <style jsx global>{`
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
        {/* PANEL CHÍNH */}
        {isOpen && (
          <div className="fixed left-4 right-4 bottom-24 h-[80vh] md:static md:w-[900px] md:h-[600px] bg-[#0a0a0a] border border-[#C69C6D]/50 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* CỘT TRÁI: DANH SÁCH SESSIONS */}
            <div className="w-full md:w-[320px] border-r border-white/10 flex flex-col bg-[#111]">
              {/* Header User */}
              <div className="p-3 border-b border-white/10 bg-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#C69C6D]/20 flex items-center justify-center text-[#C69C6D]">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase truncate max-w-[150px]">
                      {user.ho_ten}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {isManager ? "Quản lý / Admin" : "Nhân viên tư vấn"}
                    </div>
                  </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-black p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setActiveTab("waiting")}
                    className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${
                      activeTab === "waiting"
                        ? "bg-red-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    CHỜ
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
                  {isManager && (
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`flex-1 text-[10px] py-1.5 rounded font-bold transition-all ${
                        activeTab === "all"
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      GIÁM SÁT
                    </button>
                  )}
                </div>
              </div>

              {/* List Items */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {displayedSessions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                    <MessageSquare size={32} />
                    <span className="text-xs">Không có hội thoại</span>
                  </div>
                )}

                {displayedSessions.map((s) => {
                  // Logic highlight: Nếu là tab Của Tôi + Tin cuối là khách + Chưa đọc -> Đậm
                  const isUnread =
                    activeTab === "my_chats" &&
                    !s.is_read &&
                    s.last_sender_type === "customer";

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s)}
                      className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 relative transition-colors 
                                ${
                                  selectedSession?.id === s.id
                                    ? "bg-white/10"
                                    : ""
                                }
                                ${isUnread ? "bg-[#C69C6D]/10" : ""}
                             `}
                    >
                      {/* Dot đỏ báo tin mới */}
                      {isUnread && (
                        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                      )}

                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-xs font-bold truncate max-w-[180px] ${
                            isUnread ? "text-[#C69C6D]" : "text-white"
                          }`}
                        >
                          {s.ten_hien_thi}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {formatTime(s.cap_nhat_luc)}
                        </span>
                      </div>

                      <div
                        className={`text-[11px] truncate pr-4 ${
                          isUnread ? "text-white font-bold" : "text-gray-400"
                        }`}
                      >
                        {s.last_sender_type === "staff" ? "Bạn: " : ""}{" "}
                        {s.tin_nhan_cuoi || "Hình ảnh"}
                      </div>

                      {/* Badge nếu có người khác đang chat (Tab Giám sát/Chờ) */}
                      {s.nhan_su_phu_trach_id && activeTab !== "my_chats" && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-blue-400 bg-blue-900/20 w-fit px-1.5 py-0.5 rounded">
                          <User size={10} /> Đang chat
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: KHUNG CHAT */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
              {selectedSession ? (
                <>
                  {/* Chat Header */}
                  <div className="h-14 border-b border-white/10 flex justify-between items-center px-4 bg-[#111]">
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {selectedSession.ten_hien_thi}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-green-500 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>{" "}
                          Online
                        </span>
                        {/* Hiển thị ai đang phụ trách */}
                        {selectedSession.nhan_su_phu_trach_id && (
                          <span className="text-[10px] text-gray-500 border-l border-white/20 pl-2 ml-1">
                            Phụ trách:{" "}
                            {selectedSession.nhan_su_phu_trach_id === user.id
                              ? "Tôi"
                              : "Đồng nghiệp"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Nút Tiếp Nhận (Nếu chưa ai nhận) */}
                      {!selectedSession.nhan_su_phu_trach_id ? (
                        <button
                          onClick={handleClaimSession}
                          disabled={isClaiming}
                          className="px-3 py-1.5 bg-[#C69C6D] hover:bg-white text-black text-xs font-bold rounded animate-pulse transition-all"
                        >
                          {isClaiming ? "..." : "TIẾP NHẬN NGAY"}
                        </button>
                      ) : (
                        // Nút Mời hỗ trợ (Chỉ hiện khi đã tiếp nhận)
                        <div className="relative">
                          <button
                            onClick={() => setShowInvitePopup(!showInvitePopup)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                            title="Mời hỗ trợ"
                          >
                            <UserPlus size={18} />
                          </button>

                          {/* Popup Mời Staff */}
                          {showInvitePopup && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 p-2 animate-in zoom-in-95">
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 px-2">
                                Mời đồng nghiệp
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {staffList
                                  .filter((s) => s.id !== user.id)
                                  .map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => handleInviteStaff(s.id)}
                                      className="w-full text-left px-2 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-xs text-white"
                                    >
                                      <div className="w-5 h-5 rounded-full bg-gray-700 overflow-hidden">
                                        {s.hinh_anh ? (
                                          <img
                                            src={s.hinh_anh}
                                            className="w-full h-full"
                                          />
                                        ) : (
                                          <User size={12} className="m-auto" />
                                        )}
                                      </div>
                                      <span className="truncate">
                                        {s.ho_ten}
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-red-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Chat Body */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50"
                    ref={scrollRef}
                  >
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.la_nhan_vien ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Avatar nếu là khách */}
                        {!m.la_nhan_vien && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-gray-400 shrink-0">
                            <User size={14} />
                          </div>
                        )}

                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                            m.la_nhan_vien
                              ? "bg-[#C69C6D] text-black rounded-tr-sm"
                              : "bg-[#222] text-white rounded-tl-sm border border-white/10"
                          }`}
                        >
                          {m.hinh_anh && (
                            <img
                              src={m.hinh_anh}
                              className="w-full h-auto rounded-lg mb-2 cursor-pointer hover:opacity-90"
                            />
                          )}
                          <p className="whitespace-pre-wrap">{m.noi_dung}</p>
                          <div
                            className={`text-[9px] mt-1 text-right ${
                              m.la_nhan_vien ? "text-black/50" : "text-white/30"
                            }`}
                          >
                            {formatTime(m.tao_luc)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Cảnh báo nếu chưa tiếp nhận */}
                    {!selectedSession.nhan_su_phu_trach_id && (
                      <div className="flex justify-center my-4 sticky bottom-0">
                        <div className="bg-red-900/80 backdrop-blur border border-red-500/50 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
                          <AlertCircle size={14} /> Vui lòng TIẾP NHẬN để trả
                          lời khách!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-white/10 bg-[#111] flex gap-2 items-end">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={
                        !selectedSession.nhan_su_phu_trach_id && !isManager
                      }
                      className="p-3 text-gray-400 hover:text-[#C69C6D] disabled:opacity-30 disabled:cursor-not-allowed"
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

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 min-h-[46px] focus-within:border-[#C69C6D] transition-all">
                      <input
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none py-3"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={
                          isSending ||
                          (!selectedSession.nhan_su_phu_trach_id && !isManager)
                        }
                        placeholder={
                          !selectedSession.nhan_su_phu_trach_id
                            ? "Cần tiếp nhận trước..."
                            : "Nhập tin nhắn..."
                        }
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={
                          isSending ||
                          (!selectedSession.nhan_su_phu_trach_id && !isManager)
                        }
                        className="ml-2 text-[#C69C6D] hover:text-white disabled:opacity-30 transition-colors"
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
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/20 select-none">
                  <MessageSquare size={64} className="mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest text-center">
                    Chọn khách hàng để bắt đầu
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NÚT TRÒN CHÍNH - UPDATE LOGIC BADGE MỚI */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 
              ${
                badgeCount > 0 && !isOpen
                  ? "bg-red-600 border-white animate-ring shadow-red-500/80 z-[9001]"
                  : isOpen
                  ? "bg-[#1a1a1a] border-[#C69C6D] text-[#C69C6D]"
                  : "bg-[#C69C6D] border-[#C69C6D] text-black hover:scale-110 active:scale-95 animate-bounce-slow"
              }
          `}
        >
          {badgeCount > 0 && !isOpen ? (
            <BellRing size={28} className="text-white fill-white" />
          ) : isOpen ? (
            <X size={24} />
          ) : (
            <User size={28} fill="currentColor" />
          )}

          {/* Badge Số Lượng */}
          {!isOpen && badgeCount > 0 && (
            <span className="absolute -top-3 -right-3 w-7 h-7 bg-white text-red-600 border-2 border-red-600 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-20">
              {badgeCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
