"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const PASSWORD = "2025Doimoi@"; // <- per request

export default function RoomSelectorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const rooms = [
    { id: "admin", label: "Phòng Admin", path: "/phongadmin" },
    // Add more rooms later
  ];

  const tryEnterRoom = async (roomId: string, path?: string) => {
    if (roomId === "admin") {
      setShowPasswordFor(roomId);
      setPassword("");
      setError(null);
      return;
    }

    if (path) {
      onClose();
      router.push(path);
    }
  };

  const submitPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (password === PASSWORD) {
      // grant access
      onClose();
      router.push("/phongadmin");
      return;
    }
    setError("Mật khẩu không đúng");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-60 w-full max-w-md bg-[#0b0b0b] rounded-lg border border-white/5 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Chọn phòng</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5"><X /></button>
        </div>

        <div className="flex flex-col gap-3">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => tryEnterRoom(r.id, r.path)}
              className="w-full text-left px-4 py-3 rounded bg-white/5 hover:bg-white/10"
            >
              {r.label}
            </button>
          ))}
        </div>

        {showPasswordFor === "admin" && (
          <form onSubmit={submitPassword} className="mt-4">
            <label className="block text-sm mb-2">Nhập mật khẩu cho Phòng Admin</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black/90 border border-white/10"
              placeholder="Mật khẩu"
            />
            {error && <p className="text-red-400 mt-2">{error}</p>}

            <div className="flex gap-2 justify-end mt-3">
              <button type="button" onClick={() => { setShowPasswordFor(null); setPassword(""); setError(null); }} className="px-3 py-2 rounded bg-white/5">Huỷ</button>
              <button type="submit" className="px-3 py-2 rounded bg-white text-black">Vào phòng</button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
