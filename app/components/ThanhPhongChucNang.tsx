"use client";
import React, { useState } from "react";
import { Check, List } from "lucide-react";

interface FunctionItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Props {
  tenPhong: string;
  functions: FunctionItem[];
  activeFunction: string;
  onFunctionChange: (id: string) => void;
}

export default function ThanhPhongChucNang({
  tenPhong,
  functions,
  activeFunction,
  onFunctionChange,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Tìm chức năng đang được chọn
  const activeItem = functions.find((f) => f.id === activeFunction);

  return (
    // justify-between: Đẩy Tên Phòng sang trái, Chức Năng sang phải
    <div className="flex-none z-30 w-full h-[50px] bg-[#080808] border-b border-[#C69C6D]/20 shadow-md flex items-center justify-between px-4 md:px-6">
      {/* 1. TÊN PHÒNG (BÊN TRÁI - Canh sát lề trái) */}
      <div className="shrink-0 bg-gradient-to-r from-[#C69C6D] to-[#B58B5D] text-black px-4 py-1.5 rounded-l-md rounded-r-xl transform skew-x-[-10deg] shadow-[0_0_15px_rgba(198,156,109,0.3)]">
        <h1 className="text-xs md:text-sm font-black uppercase tracking-[0.15em] skew-x-[10deg] whitespace-nowrap">
          {tenPhong}
        </h1>
      </div>

      {/* 2. TRÌNH CHỌN CHỨC NĂNG (BÊN PHẢI - Canh sát lề phải) */}
      <div className="relative flex items-center">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 group outline-none text-right"
        >
          {/* Tên chức năng - Chữ to, không viền */}
          <span className="text-[#C69C6D] font-black text-base md:text-lg uppercase tracking-wide truncate max-w-[180px] sm:max-w-xs">
            {activeItem?.label}
          </span>

          {/* Nút danh sách (Icon) - Cùng màu vàng */}
          <List
            size={24}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${
              showDropdown
                ? "rotate-90 text-white"
                : "text-[#C69C6D] group-hover:text-white"
            }`}
          />
        </button>

        {/* MENU XỔ XUỐNG - Căn phải (right-0) */}
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            <div className="absolute top-full right-0 mt-3 w-[240px] bg-[#1a1a1a] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 py-2 border border-white/5">
              {functions.map((func) => {
                const Icon = func.icon;
                const isActive = func.id === activeFunction;
                return (
                  <button
                    key={func.id}
                    onClick={() => {
                      onFunctionChange(func.id);
                      setShowDropdown(false);
                    }}
                    className={`
                                            w-full flex items-center justify-end gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all text-right
                                            ${
                                              isActive
                                                ? "bg-[#C69C6D] text-black"
                                                : "text-white/60 hover:bg-white/5 hover:text-white hover:pr-6"
                                            }
                                        `}
                  >
                    <span className="flex-1 truncate">{func.label}</span>
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="shrink-0 order-first"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
