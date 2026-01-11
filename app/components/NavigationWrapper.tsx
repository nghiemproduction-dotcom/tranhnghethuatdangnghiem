"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MenuTren from "@/app/GiaoDienTong/MenuTren/MenuTren";
import MenuSystemWrapper from "@/app/GiaoDienTong/MenuSystemWrapper";
import KhungGiaoDienTong from "./KhungGiaoDienTong"; 

interface Props {
  user: any;
  isNhanSu: boolean;
  children: React.ReactNode;
}

export default function NavigationWrapper({ user, isNhanSu, children }: Props) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHiddenPage = 
    !pathname || 
    pathname === "/login" || 
    pathname === "/" || 
    pathname.startsWith("/phongadmin"); 

  if (isHiddenPage) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <KhungGiaoDienTong>
      <MenuSystemWrapper
        currentUser={user}
        onlyAccountButton={false}
      >
        {mounted && (
          <div className="fixed top-0 left-0 right-0 z-[5000]">
            <MenuTren nguoiDung={user} loiChao="" />
          </div>
        )}
        
        {/* ✅ FIX: Kéo lên sát rạt! 
            Menu cao 80px (desktop) / 60px (mobile) -> Padding đúng y chang số đó.
            Không cộng thêm pixel nào nữa.
        */}
        <div className="pt-[60px] md:pt-[80px] h-full overflow-hidden">
           {children}
        </div>
      </MenuSystemWrapper>
    </KhungGiaoDienTong>
  );
}