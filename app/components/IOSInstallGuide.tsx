"use client";
import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react"; // Hoặc dùng icon svg nào ông có

export default function IOSInstallGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-t-2xl sm:rounded-2xl border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Cài đặt ứng dụng</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4 text-zinc-300">
          <p>Để cài đặt ứng dụng lên màn hình chính iPhone/iPad:</p>
          
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <Share className="text-blue-500" />
            <span>1. Bấm vào nút <strong>Chia sẻ</strong> ở thanh dưới cùng.</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <PlusSquare className="text-white" />
            <span>2. Chọn dòng <strong>Thêm vào MH chính</strong> (Add to Home Screen).</span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-zinc-500">
          Bấm xong nó sẽ hiện icon app ở màn hình chính như app thật.
        </div>
      </div>
    </div>
  );
}