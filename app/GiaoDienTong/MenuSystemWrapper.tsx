"use client";

import React from "react";

interface MenuSystemWrapperProps {
  currentUser?: any;
  onToggleContent?: (isOpen: boolean) => void;
  onlyAccountButton?: boolean;
  children?: React.ReactNode; // ✅ [MỚI] Thêm dòng này
}

export default function MenuSystemWrapper({
  currentUser,
  onToggleContent,
  onlyAccountButton,
  children, // ✅ [MỚI] Lấy children ra
}: MenuSystemWrapperProps) {
  return (
    <div className="relative w-full h-full">
        {/* Render nội dung bên trong */}
        {children}

      {/* GRADIENT BẢO VỆ MENU - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent z-[4900] pointer-events-none"></div>
    </div>
  );
}