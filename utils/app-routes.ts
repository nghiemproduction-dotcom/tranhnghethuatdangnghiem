// FILE NÀY ĐƯỢC CẬP NHẬT TỰ ĐỘNG BỞI GENESIS ENGINE
// KHÔNG SỬA THỦ CÔNG NẾU KHÔNG CẦN THIẾT

export const ROLE_REDIRECTS: Record<string, string> = {
  'admin': '/phongadmin',
  'dev': '/phongadmin',};

// Hàm tiện ích để lấy đường dẫn dựa trên Role
export function getRouteByRole(role: string): string {
  return ROLE_REDIRECTS[role] || '/';
}