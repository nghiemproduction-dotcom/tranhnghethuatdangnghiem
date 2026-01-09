"use client";

import { usePathname } from "next/navigation";
import MenuTren from "@/app/GiaoDienTong/MenuTren/MenuTren";
import ThanhPhongChucNang from "@/components/ThanhPhongChucNang";
import MenuSystemWrapper from "@/app/GiaoDienTong/MenuSystemWrapper";

export default function NavigationWrapper({
  children,
  user,
  isNhanSu,
}: {
  children: React.ReactNode;
  user: any;
  isNhanSu: boolean;
}) {
  const pathname = usePathname();

  // Danh sách các trang KHÔNG muốn hiện Menu (Trang chủ, Trang login...)
  const hiddenRoutes = ["/", "/CongDangNhap", "/login"];
  const shouldHide = hiddenRoutes.includes(pathname);

  return (
    <>
      {/* 1. Menu Trên (Chỉ hiện nếu không phải trang ẩn) */}
      {!shouldHide && <MenuTren nguoiDung={user} loiChao="Xin chào" />}

      {/* 2. Nội dung chính */}
      <MenuSystemWrapper>{children}</MenuSystemWrapper>

      {/* 3. Thanh Chức Năng (Chỉ hiện nếu là Nhân sự + Không phải trang ẩn) */}
      {!shouldHide && isNhanSu && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <ThanhPhongChucNang
            tenPhong={user?.role ? `PHÒNG ${user.role.toUpperCase()}` : ""}
            userRole={user?.role}
          />
        </div>
      )}
    </>
  );
}