"use client";

import React from "react";

interface MenuSystemWrapperProps {
  currentUser?: any;
  onToggleContent?: (isOpen: boolean) => void;
  onlyAccountButton?: boolean;
}

/**
 * 🎨 Reusable Menu System Wrapper
 * Packages gradient overlays + MenuDuoi for consistent styling across all pages
 * Usage: <MenuSystemWrapper currentUser={user} onlyAccountButton={true} />
 */
export default function MenuSystemWrapper({
  currentUser,
  onToggleContent,
  onlyAccountButton,
}: MenuSystemWrapperProps) {
  return (
    <>
      {/* GRADIENT BẢO VỆ MENU - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent z-[4900] pointer-events-none"></div>
    </>
  );
}
