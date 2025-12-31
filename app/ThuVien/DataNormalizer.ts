'use client';

/**
 * 🔧 DATA NORMALIZER - Xử lý dữ liệu Vietnamese với:
 * - Trim whitespace
 * - Normalize case (UPPERCASE, lowercase, Title Case)
 * - Chuẩn hóa giá trị phân loại
 */

export class DataNormalizer {
  /**
   * Các vị trí hợp lệ trong bảng nhan_su
   */
  static VALID_VI_TRI = {
    ADMIN: 'Admin',
    QUAN_LY: 'Quản lý',
    SALES: 'Sales',
  } as const;

  /**
   * Các phân loại hợp lệ trong bảng khach_hang
   */
  static VALID_PHAN_LOAI = {
    VIP: 'VIP',
    KH_TRONG_TAM: 'KH Trọng tâm',
  } as const;

  /**
   * Normalize vị trí (vi_tri)
   * Chuyển đầu vào thành một giá trị chuẩn
   * Ví dụ: "  ADMIN  " → "Admin"
   *        "quản lý" → "Quản lý"
   *        "sales" → "Sales"
   */
  static normalizeViTri(value: string | null | undefined): string | null {
    if (!value) return null;

    const normalized = value.trim().toLowerCase();

    // Check Admin
    if (['admin', 'ad', 'administrator'].includes(normalized)) {
      return this.VALID_VI_TRI.ADMIN;
    }

    // Check Quản lý
    if (['quản lý', 'ql', 'quan ly', 'manager'].includes(normalized)) {
      return this.VALID_VI_TRI.QUAN_LY;
    }

    // Check Sales
    if (['sales', 'sale', 'bán hàng'].includes(normalized)) {
      return this.VALID_VI_TRI.SALES;
    }

    return null; // Giá trị không hợp lệ
  }

  /**
   * Normalize phân loại khách hàng (phan_loai)
   * Ví dụ: "  VIP  " → "VIP"
   *        "kh trọng tâm" → "KH Trọng tâm"
   */
  static normalizePhanLoai(value: string | null | undefined): string | null {
    if (!value) return null;

    const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');

    // Check VIP
    if (normalized === 'vip') {
      return this.VALID_PHAN_LOAI.VIP;
    }

    // Check KH Trọng tâm
    if (
      ['kh trọng tâm', 'kh trong tam', 'khách trọng tâm', 'khach trong tam'].includes(normalized)
    ) {
      return this.VALID_PHAN_LOAI.KH_TRONG_TAM;
    }

    return null; // Giá trị không hợp lệ
  }

  /**
   * Trim và normalize text chung
   */
  static normalizeText(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.trim();
  }

  /**
   * Check xem vi_tri có phải Admin không
   */
  static isAdmin(viTri: string | null | undefined): boolean {
    const normalized = this.normalizeViTri(viTri);
    return normalized === this.VALID_VI_TRI.ADMIN;
  }

  /**
   * Check xem vi_tri có phải Quản lý không
   */
  static isQuanLy(viTri: string | null | undefined): boolean {
    const normalized = this.normalizeViTri(viTri);
    return normalized === this.VALID_VI_TRI.QUAN_LY;
  }

  /**
   * Check xem vi_tri có phải Sales không
   */
  static isSales(viTri: string | null | undefined): boolean {
    const normalized = this.normalizeViTri(viTri);
    return normalized === this.VALID_VI_TRI.SALES;
  }

  /**
   * Check xem phan_loai có phải VIP không
   */
  static isVIP(phanLoai: string | null | undefined): boolean {
    const normalized = this.normalizePhanLoai(phanLoai);
    return normalized === this.VALID_PHAN_LOAI.VIP;
  }

  /**
   * Check xem phan_loai có phải KH Trọng tâm không
   */
  static isKHTrongTam(phanLoai: string | null | undefined): boolean {
    const normalized = this.normalizePhanLoai(phanLoai);
    return normalized === this.VALID_PHAN_LOAI.KH_TRONG_TAM;
  }

  /**
   * Get tất cả valid vi_tri values
   */
  static getAllViTri(): string[] {
    return Object.values(this.VALID_VI_TRI);
  }

  /**
   * Get tất cả valid phan_loai values
   */
  static getAllPhanLoai(): string[] {
    return Object.values(this.VALID_PHAN_LOAI);
  }
}

export type ViTri = typeof DataNormalizer.VALID_VI_TRI[keyof typeof DataNormalizer.VALID_VI_TRI];
export type PhanLoai = typeof DataNormalizer.VALID_PHAN_LOAI[keyof typeof DataNormalizer.VALID_PHAN_LOAI];
