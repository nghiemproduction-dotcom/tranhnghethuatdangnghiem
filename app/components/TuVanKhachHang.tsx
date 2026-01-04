"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  X,
  Send,
  User,
  AlertCircle,
  Shield,
  Briefcase,
  Image as ImageIcon,
  Loader2,
  BellRing,
  UserPlus,
  Search,
  MoreVertical,
  Check,
  Circle,
} from "lucide-react";
import { supabase } from "@/app/ThuVien/ketNoiSupabase";
import { useUser } from "@/app/ThuVien/UserContext";
import { compressImage } from "@/app/ThuVien/compressImage";

const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function TuVanKhachHang() {
  const { user } = useUser();

  // --- STATE UI ---
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"waiting" | "my_chats" | "all">(
    "waiting"
  );
  const [showInviteModal, setShowInviteModal] = useState(false);

  // --- STATE DATA ---
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [onlineStaffIds, setOnlineStaffIds] = useState<Set<string>>(new Set());

  // --- STATE CHAT ---
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Refs
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isManager =
    user && ["admin", "quanly", "boss"].includes(user.role || "");

  // 1. INIT SOUND & STAFF LIST (ĐÃ SỬA LẠI QUERY)
  useEffect(() => {
    if (typeof window !== "undefined") {
      ringtoneRef.current = new Audio("/sounds/ring.mp3");
      ringtoneRef.current.loop = true;
    }

    // 🟢 LOAD DANH SÁCH NHÂN VIÊN ĐỂ MỜI (FIXED)
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from("nhan_su")
        .select("id, ho_ten, hinh_anh, vi_tri, vi_tri_normalized")
        .eq("trang_thai", "dang_lam_viec")
        // Chỉ lấy những người có vai trò hỗ trợ
        .in("vi_tri_normalized", ["admin", "quanly", "sales"]);

      if (error) {
        console.error("Lỗi lấy danh sách nhân viên:", error);
      } else if (data) {
        setStaffList(data);
      }
    };

    if (user) fetchStaff();
  }, [user]);

  // 2. REALTIME ONLINE STATUS
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("online_staff_tracking");
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) ids.add(p.user_id);
          });
        });
        setOnlineStaffIds(ids);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 3. LOAD SESSIONS & SUBSCRIBE
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
  }, [user, selectedSession?.id]);

  // 4. LOAD MESSAGES
  useEffect(() => {
    if (!selectedSession) return;

    setIsLoadingMessages(true);
    const fetchMsgs = async () => {
      const { data, error } = await supabase
        .from("tu_van_messages")
        .select("*")
        .eq("session_id", selectedSession.id)
        .order("tao_luc", { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
      setIsLoadingMessages(false);
    };
    fetchMsgs();

    const isMine =
      selectedSession.nhan_su_phu_trach_id === user?.id ||
      (selectedSession.ho_tro_vien_ids &&
        selectedSession.ho_tro_vien_ids.includes(user?.id));
    if (
      isMine &&
      !selectedSession.is_read &&
      selectedSession.last_sender_type === "customer"
    ) {
      supabase.rpc("mark_session_as_read", {
        p_session_id: selectedSession.id,
      });
    }

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
  }, [selectedSession?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100);
  };

  // --- LOGIC PHÂN LOẠI & BADGE ---
  const displayedSessions = useMemo(() => {
    if (!user) return [];
    if (activeTab === "waiting")
      return allSessions.filter((s) => !s.nhan_su_phu_trach_id);
    if (activeTab === "my_chats")
      return allSessions.filter(
        (s) =>
          s.nhan_su_phu_trach_id === user.id ||
          (s.ho_tro_vien_ids && s.ho_tro_vien_ids.includes(user.id))
      );
    return allSessions.filter((s) => s.nhan_su_phu_trach_id);
  }, [allSessions, activeTab, user]);

  const badgeCount = useMemo(() => {
    if (!user) return 0;
    const waiting = allSessions.filter((s) => !s.nhan_su_phu_trach_id).length;
    const myUnread = allSessions.filter(
      (s) =>
        (s.nhan_su_phu_trach_id === user.id ||
          (s.ho_tro_vien_ids && s.ho_tro_vien_ids.includes(user.id))) &&
        s.is_read === false &&
        s.last_sender_type === "customer"
    ).length;
    return waiting + myUnread;
  }, [allSessions, user]);

  useEffect(() => {
    if (badgeCount > 0 && !isOpen) ringtoneRef.current?.play().catch(() => {});
    else {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }
  }, [badgeCount, isOpen]);

  // --- ACTIONS ---
  const handleClaim = async () => {
    if (!selectedSession || !user) return;
    const { data: check } = await supabase
      .from("tu_van_sessions")
      .select("nhan_su_phu_trach_id")
      .eq("id", selectedSession.id)
      .single();
    if (check?.nhan_su_phu_trach_id) {
      alert("Đã có người nhận!");
      return;
    }
    await supabase
      .from("tu_van_sessions")
      .update({
        nhan_su_phu_trach_id: user.id,
        trang_thai: "dang_tu_van",
        ho_tro_vien_ids: [],
      })
      .eq("id", selectedSession.id);
    setActiveTab("my_chats");
  };

  const handleSend = async (file?: File) => {
    if ((!inputMsg.trim() && !file) || !selectedSession || !user) return;
    if (!selectedSession.nhan_su_phu_trach_id) {
      if (!confirm("Tiếp nhận khách này?")) return;
      await handleClaim();
    }
    setIsSending(true);
    const text = inputMsg;
    setInputMsg("");
    try {
      let imageUrl = null;
      if (file) {
        const compressed = await compressImage(file, 0.7, 1200);
        const fileName = `staff_chat_${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, compressed);
        if (!error)
          imageUrl = supabase.storage.from("images").getPublicUrl(fileName)
            .data.publicUrl;
      }
      await supabase.from("tu_van_messages").insert({
        session_id: selectedSession.id,
        nguoi_gui_id: user.id,
        la_nhan_vien: true,
        noi_dung: text,
        hinh_anh: imageUrl,
      });
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleInvite = async (staffId: string) => {
    // Gọi RPC để add staffId vào mảng ho_tro_vien_ids
    const { error } = await supabase.rpc("invite_staff_to_session", {
      p_session_id: selectedSession.id,
      p_staff_id: staffId,
    });

    if (error) {
      console.error("Lỗi mời:", error);
      alert("Không thể mời. Vui lòng thử lại.");
    } else {
      setShowInviteModal(false);
      alert("Đã thêm vào nhóm chat!");
    }
  };

  if (!user || user.userType !== "nhan_su") return null;
  const UserIcon = isManager ? Shield : Briefcase;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[9000]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 ${
            badgeCount > 0 && !isOpen
              ? "bg-red-600 border-white animate-bounce"
              : "bg-[#C69C6D] border-[#C69C6D] text-black hover:scale-110"
          }`}
        >
          {badgeCount > 0 && !isOpen ? (
            <BellRing size={32} className="text-white" />
          ) : isOpen ? (
            <X size={28} />
          ) : (
            <User size={32} />
          )}
          {!isOpen && badgeCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-red-600 border-2 border-red-600 rounded-full flex items-center justify-center text-xs font-black">
              {badgeCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-4 md:inset-10 z-[8999] bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 flex-col md:flex-row">
          {/* CỘT TRÁI: LIST */}
          <div className="w-full md:w-[350px] border-r border-white/10 flex flex-col bg-[#111]">
            <div className="p-4 border-b border-white/10 bg-[#161616]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#C69C6D]/20 flex items-center justify-center text-[#C69C6D]">
                  <UserIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-white uppercase">
                    {user.ho_ten}
                  </div>
                  <div className="text-xs text-gray-400">Trực tuyến</div>
                </div>
              </div>
              <div className="flex bg-black p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setActiveTab("waiting")}
                  className={`flex-1 py-2 text-xs font-bold rounded ${
                    activeTab === "waiting"
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  CHỜ (
                  {allSessions.filter((s) => !s.nhan_su_phu_trach_id).length})
                </button>
                <button
                  onClick={() => setActiveTab("my_chats")}
                  className={`flex-1 py-2 text-xs font-bold rounded ${
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
                    className={`flex-1 py-2 text-xs font-bold rounded ${
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

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
              {displayedSessions.map((s) => {
                const isUnread =
                  activeTab === "my_chats" &&
                  !s.is_read &&
                  s.last_sender_type === "customer";
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 relative ${
                      selectedSession?.id === s.id ? "bg-white/10" : ""
                    } ${isUnread ? "bg-[#C69C6D]/10" : ""}`}
                  >
                    {isUnread && (
                      <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                    )}
                    <div className="flex justify-between mb-1">
                      <span
                        className={`font-bold text-sm ${
                          isUnread ? "text-[#C69C6D]" : "text-white"
                        }`}
                      >
                        {s.ten_hien_thi}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatTime(s.cap_nhat_luc)}
                      </span>
                    </div>
                    <div
                      className={`text-xs truncate ${
                        isUnread ? "text-white font-bold" : "text-gray-400"
                      }`}
                    >
                      {s.last_sender_type === "staff" ? "Bạn: " : ""}{" "}
                      {s.tin_nhan_cuoi || "..."}
                    </div>
                  </div>
                );
              })}
              {displayedSessions.length === 0 && (
                <div className="p-8 text-center text-gray-600 text-sm">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: CHAT */}
          <div className="flex-1 flex flex-col bg-[#050505] relative min-w-0">
            {selectedSession ? (
              <>
                <div className="h-16 border-b border-white/10 flex justify-between items-center px-6 bg-[#161616] shrink-0">
                  <div>
                    <h3 className="font-bold text-white">
                      {selectedSession.ten_hien_thi}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {selectedSession.nhan_su_phu_trach_id
                          ? selectedSession.nhan_su_phu_trach_id === user.id
                            ? "Đang chat với bạn"
                            : "Đồng nghiệp đang chat"
                          : "Chưa ai nhận"}
                      </span>
                      {selectedSession.ho_tro_vien_ids?.length > 0 && (
                        <span className="bg-blue-900/50 text-blue-300 px-2 rounded-full text-[10px]">
                          Có hỗ trợ
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {!selectedSession.nhan_su_phu_trach_id ? (
                      <button
                        onClick={handleClaim}
                        className="px-4 py-2 bg-[#C69C6D] hover:bg-white text-black font-bold text-xs rounded animate-pulse"
                      >
                        TIẾP NHẬN
                      </button>
                    ) : (
                      // 🟢 NÚT MỜI ĐỒNG NGHIỆP: Chỉ hiện cho người phụ trách hoặc Admin
                      (selectedSession.nhan_su_phu_trach_id === user.id ||
                        isManager) && (
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-white"
                          title="Mời đồng nghiệp"
                        >
                          <UserPlus size={20} />
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/50"
                  ref={scrollRef}
                >
                  {isLoadingMessages ? (
                    <div className="flex justify-center pt-10">
                      <Loader2
                        className="animate-spin text-[#C69C6D]"
                        size={30}
                      />
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${
                          m.la_nhan_vien ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                            m.la_nhan_vien
                              ? "bg-[#C69C6D] text-black"
                              : "bg-[#222] text-white border border-white/10"
                          }`}
                        >
                          {m.hinh_anh && (
                            <img
                              src={m.hinh_anh}
                              className="w-full h-auto rounded-lg mb-2"
                            />
                          )}
                          <p className="whitespace-pre-wrap">{m.noi_dung}</p>
                          <div className="text-[9px] mt-1 opacity-50 text-right">
                            {formatTime(m.tao_luc)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#161616] flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-[#C69C6D] bg-white/5 rounded-xl"
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
                  <div className="flex-1 flex gap-2">
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm outline-none focus:border-[#C69C6D]"
                      placeholder="Nhập tin nhắn..."
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      disabled={
                        isSending ||
                        (!selectedSession.nhan_su_phu_trach_id && !isManager)
                      }
                    />
                    <button
                      onClick={() => handleSend()}
                      className="p-3 bg-[#C69C6D] hover:bg-white text-black rounded-xl disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/20 flex-col gap-3">
                <MessageSquare size={64} />
                <p className="uppercase font-bold tracking-widest">
                  Chưa chọn hội thoại
                </p>
              </div>
            )}
          </div>

          {/* 🟢 MODAL MỜI ĐỒNG NGHIỆP (ĐÃ FIX: LẤY ĐÚNG DATA STAFF) */}
          {showInviteModal && (
            <div
              className="absolute inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowInviteModal(false)}
            >
              <div
                className="bg-[#1a1a1a] w-[400px] max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#222]">
                  <h3 className="text-white font-bold uppercase">Mời hỗ trợ</h3>
                  <button onClick={() => setShowInviteModal(false)}>
                    <X className="text-gray-400 hover:text-white" size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {staffList.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Không tìm thấy nhân viên hỗ trợ nào khác.
                    </div>
                  )}

                  {staffList
                    .filter((s) => s.id !== user.id)
                    .map((s) => {
                      const isOnline = onlineStaffIds.has(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleInvite(s.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all group"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                              {s.hinh_anh ? (
                                <img
                                  src={s.hinh_anh}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User
                                  size={20}
                                  className="m-auto text-gray-400"
                                />
                              )}
                            </div>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${
                                isOnline ? "bg-green-500" : "bg-gray-500"
                              }`}
                            ></div>
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-[#C69C6D]">
                              {s.ho_ten}
                            </div>
                            <div className="text-xs text-gray-500">
                              {s.vi_tri || "Nhân viên"} •{" "}
                              {isOnline ? "Online" : "Offline"}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#C69C6D] group-hover:text-black group-hover:border-[#C69C6D]">
                            <UserPlus size={16} />
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
