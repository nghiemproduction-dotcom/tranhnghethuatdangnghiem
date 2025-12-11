'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type NgonNgu = 'vi' | 'en' | 'zh' | 'fr' | 'de' | 'ja';

interface NgonNguContextType {
  ngonNgu: NgonNgu;
  setNgonNgu: (lang: NgonNgu) => void;
  t: (key: string) => string; // Hàm dịch
}

const NgonNguContext = createContext<NgonNguContextType | undefined>(undefined);

// TỪ ĐIỂN DỊCH (Ông có thể thêm từ vào đây sau này)
const tuDien: Record<NgonNgu, Record<string, string>> = {
  vi: {
    canTho: 'Cần Thơ', vn: 'Việt Nam',
    tieuDe: 'ĐĂNG NGHIÊM', phuDe: 'Art Gallery',
    chuTri: 'Chủ trì bởi Nghệ nhân', tenNgheNhan: 'Trần Đăng Nghiêm',
    kyLuc: 'Kỷ lục Tranh gạo ST25 lớn nhất Việt Nam',
    nutKhach: 'THAM QUAN', moTaKhach: 'Dành cho Khách & Đối tác',
    nutNoiBo: 'NỘI BỘ', moTaNoiBo: 'Dành cho Nhân sự & Quản lý',
    banQuyen: '© 2024 Dang Nghiem Art. Bảo lưu mọi quyền.'
  },
  en: {
    canTho: 'Can Tho', vn: 'Vietnam',
    tieuDe: 'DANG NGHIEM', phuDe: 'Art Gallery',
    chuTri: 'Curated by Artisan', tenNgheNhan: 'Tran Dang Nghiem',
    kyLuc: 'Record: Largest ST25 Rice Painting in Vietnam',
    nutKhach: 'VISIT', moTaKhach: 'For Guests & Partners',
    nutNoiBo: 'INTERNAL', moTaNoiBo: 'For Staff & Management',
    banQuyen: '© 2024 Dang Nghiem Art. All rights reserved.'
  },
  zh: {
    canTho: '芹苴', vn: '越南',
    tieuDe: '登 严', phuDe: '艺术画廊',
    chuTri: '由工匠主持', tenNgheNhan: '陈登严',
    kyLuc: '越南最大的 ST25 大米画纪录',
    nutKhach: '参观', moTaKhach: '适用于访客和合作伙伴',
    nutNoiBo: '内部', moTaNoiBo: '适用于员工和管理层',
    banQuyen: '© 2024 Dang Nghiem Art. 版权所有.'
  },
  fr: {
    canTho: 'Can Tho', vn: 'Vietnam',
    tieuDe: 'DANG NGHIEM', phuDe: 'Galerie d\'Art',
    chuTri: 'Présidé par l\'Artisan', tenNgheNhan: 'Tran Dang Nghiem',
    kyLuc: 'Record : La plus grande peinture de riz ST25',
    nutKhach: 'VISITER', moTaKhach: 'Pour invités et partenaires',
    nutNoiBo: 'INTERNE', moTaNoiBo: 'Pour le personnel',
    banQuyen: '© 2024 Dang Nghiem Art. Tous droits réservés.'
  },
  de: {
    canTho: 'Cần Thơ', vn: 'Vietnam',
    tieuDe: 'DANG NGHIEM', phuDe: 'Kunstgalerie',
    chuTri: 'Kuratiert von Kunsthandwerker', tenNgheNhan: 'Tran Dang Nghiem',
    kyLuc: 'Rekord: Größtes ST25-Reisgemälde in Vietnam',
    nutKhach: 'BESUCHEN', moTaKhach: 'Für Gäste und Partner',
    nutNoiBo: 'INTERN', moTaNoiBo: 'Für Mitarbeiter',
    banQuyen: '© 2024 Dang Nghiem Art. Alle Rechte vorbehalten.'
  },
  ja: {
    canTho: 'カントー', vn: 'ベトナム',
    tieuDe: 'ダン・ギエム', phuDe: 'アートギャラリー',
    chuTri: '職人による主宰', tenNgheNhan: 'チャン・ダン・ギエム',
    kyLuc: 'ベトナム最大のST25米絵画記録',
    nutKhach: '見学', moTaKhach: 'ゲストとパートナー向け',
    nutNoiBo: '内部', moTaNoiBo: 'スタッフと管理者向け',
    banQuyen: '© 2024 Dang Nghiem Art. 無断複写・転載を禁じます。'
  }
};

export function NgonNguProvider({ children }: { children: React.ReactNode }) {
  const [ngonNgu, setNgonNgu] = useState<NgonNgu>('vi');

  // Load ngôn ngữ đã lưu khi mở web
  useEffect(() => {
    const saved = localStorage.getItem('ngon_ngu_chon') as NgonNgu;
    if (saved && tuDien[saved]) setNgonNgu(saved);
  }, []);

  const doiNgonNgu = (lang: NgonNgu) => {
    setNgonNgu(lang);
    localStorage.setItem('ngon_ngu_chon', lang);
  };

  const t = (key: string) => {
    return tuDien[ngonNgu][key] || key;
  };

  return (
    <NgonNguContext.Provider value={{ ngonNgu, setNgonNgu: doiNgonNgu, t }}>
      {children}
    </NgonNguContext.Provider>
  );
}

export function useNgonNgu() {
  const context = useContext(NgonNguContext);
  if (!context) throw new Error('useNgonNgu phải dùng bên trong NgonNguProvider');
  return context;
}