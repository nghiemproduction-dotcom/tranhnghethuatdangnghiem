'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// =====================================================
// TYPES
// =====================================================
export type ThemeMode = 'dark' | 'light';
export type LanguageCode = 'vi' | 'en';

interface AppSettings {
  theme: ThemeMode;
  language: LanguageCode;
}

interface AppSettingsContextType {
  // State
  theme: ThemeMode;
  language: LanguageCode;
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageCode) => void;
  toggleTheme: () => void;
  
  // Helpers
  isDark: boolean;
  isVietnamese: boolean;
  
  // Translation function
  t: (key: string) => string;
}// =====================================================
// TRANSLATIONS (ĐÃ THỔI HỒN NGHỆ THUẬT)
// =====================================================
const translations: Record<LanguageCode, Record<string, string>> = {
  vi: {
    // Chung - Tông giọng trang trọng
    'app.name': 'ArtSpace Management',
    'app.loading': 'Đang khởi tạo...',
    'app.error': 'Đã có sự cố',
    'app.save': 'Lưu Tác Phẩm',
    'app.cancel': 'Hủy Bỏ',
    'app.confirm': 'Xác Nhận',
    'app.close': 'Đóng Lại',
    'app.back': 'Trở Về',
    'app.next': 'Tiếp Tục',
    'app.done': 'Hoàn Tất',
    'app.edit': 'Hiệu Chỉnh',
    'app.delete': 'Loại Bỏ',
    'app.search': 'Tìm kiếm tinh hoa...',
    'app.refresh': 'Làm Mới',
    'app.noData': 'Chưa có dữ liệu trưng bày',
    
    // Navigation - Định danh không gian
    'nav.home': 'Sảnh Chính',
    'nav.account': 'Hồ Sơ Nghệ Nhân',
    'nav.notifications': 'Thư Tín',
    'nav.department': 'Không Gian',
    
    // Auth - Lời chào mời
    'auth.login': 'Tiếp Bước',
    'auth.loginRegister': 'Đăng Nhập / Gia Nhập',
    'auth.logout': 'Rời Cõi Nghệ',
    'auth.logoutConfirm': 'Quý vị muốn kết thúc phiên làm việc?',
    'auth.loggingOut': 'Đang đăng xuất...',
    'auth.loginFailed': 'Chưa thể truy cập',
    'auth.loginError': 'Thông tin định danh chưa chính xác.',
    'auth.needHelp': 'Cần hỗ trợ kỹ thuật?',
    'auth.enterEmail': 'Email định danh',
    'auth.enterPassword': 'Mật khẩu bảo mật',
    'auth.forgotPassword': 'Quên mật khẩu?',
    'auth.rememberMe': 'Ghi nhớ phiên này',
    
    // Profile Modal
    'profile.title': 'Hồ Sơ Cá Nhân',
    'profile.settings': 'Thiết Lập Hệ Thống',
    'profile.settingsDesc': 'Ngôn ngữ & Giao diện',
    'profile.myProfile': 'Thông Tin Của Tôi',
    'profile.myProfileDescStaff': 'Chức vụ & Thành tựu',
    'profile.myProfileDescCustomer': 'Lịch sử sưu tầm',
    'profile.personalInfo': 'Sơ Yếu Lý Lịch',
    'profile.personalInfoDesc': 'Thông tin liên hệ chính',
    'profile.achievements': 'Bảng Vàng',
    'profile.achievementsDesc': 'Ghi nhận đóng góp',
    'profile.orders': 'Bộ Sưu Tập Đã Mua',
    'profile.ordersDesc': 'Các tác phẩm sở hữu',
    'profile.editInfo': 'Cập nhật thông tin',
    'profile.user': 'Thành viên',
    
    // Fields
    'field.fullName': 'Họ và Tên',
    'field.email': 'Thư điện tử',
    'field.phone': 'Số điện thoại',
    'field.address': 'Địa chỉ liên hệ',
    'field.idCard': 'Định danh công dân',
    'field.notUpdated': '---',
    
    // Settings
    'settings.language': 'Ngôn Ngữ',
    'settings.theme': 'Sắc Thái',
    'settings.themeDark': 'Huyền Bí (Tối)',
    'settings.themeDarkDesc': 'Tăng chiều sâu, dịu mắt',
    'settings.themeLight': 'Thanh Tao (Sáng)',
    'settings.themeLightDesc': 'Rực rỡ, rõ ràng',
    
    // Orders
    'orders.title': 'Đơn Đặt Tác Phẩm',
    'orders.empty': 'Chưa có tác phẩm nào',
    'orders.emptyDesc': 'Quý khách chưa sở hữu tác phẩm nào.',
    
    // Achievements
    'achievements.title': 'Thành Tựu',
    'achievements.developing': 'Đang kiến tạo...',
    'achievements.points': 'Điểm Cống Hiến',
    'achievements.badges': 'Huân Chương',
    'achievements.noBadges': 'Chưa đạt',
    
    // Notifications
    'notifications.title': 'Thông Báo',
    'notifications.empty': 'Hộp thư trống',
    'notifications.markAllRead': 'Đã xem tất cả',
    'notifications.new': 'Mới',
    
    // Homepage
    'home.welcome': 'Hân hạnh đón tiếp',
    'home.goodMorning': 'Chúc ngày mới rực rỡ',
    'home.goodAfternoon': 'Chúc buổi chiều an lành',
    'home.goodEvening': 'Chúc buổi tối ấm áp',
    'home.guest': 'Quý Thưởng Khách',
    
    // Rooms/Departments - Tên phòng ban nghệ thuật
    'room.admin': 'Đài Quản Trị',
    'room.manager': 'Phòng Điều Hành',
    'room.parttime': 'Không Gian Sáng Tạo',
    'room.showroom': 'Phòng Trưng Bày',
    'room.vip': 'Phòng Thượng Khách',
  },
  en: {
    // Common
    'app.name': 'ArtSpace System',
    'app.loading': 'Initializing...',
    'app.error': 'An error occurred',
    'app.save': 'Save Artwork',
    'app.cancel': 'Cancel',
    'app.confirm': 'Confirm',
    'app.close': 'Close',
    'app.back': 'Return',
    'app.next': 'Next',
    'app.done': 'Completed',
    'app.edit': 'Modify',
    'app.delete': 'Remove',
    'app.search': 'Search masterpieces...',
    'app.refresh': 'Refresh',
    'app.noData': 'No data available',
    
    // Navigation
    'nav.home': 'Grand Hall',
    'nav.account': 'Artisan Profile',
    'nav.notifications': 'Messages',
    'nav.department': 'Studio',
    
    // Auth
    'auth.login': 'Enter',
    'auth.loginRegister': 'Login / Join',
    'auth.logout': 'Leave Studio',
    'auth.logoutConfirm': 'Do you wish to end your session?',
    'auth.loggingOut': 'Leaving...',
    'auth.loginFailed': 'Access Denied',
    'auth.loginError': 'Incorrect credentials.',
    'auth.needHelp': 'Need assistance?',
    'auth.enterEmail': 'Your Email',
    'auth.enterPassword': 'Your Password',
    'auth.forgotPassword': 'Lost Key?',
    'auth.rememberMe': 'Remember me',
    
    // Profile
    'profile.title': 'My Dossier',
    'profile.settings': 'Configuration',
    'profile.settingsDesc': 'Language & Aesthetics',
    'profile.myProfile': 'My Portfolio',
    'profile.myProfileDescStaff': 'Career & Awards',
    'profile.myProfileDescCustomer': 'Collection History',
    'profile.personalInfo': 'Biography',
    'profile.personalInfoDesc': 'Contact details',
    'profile.achievements': 'Honors',
    'profile.achievementsDesc': 'Points & Medals',
    'profile.orders': 'Acquisitions',
    'profile.ordersDesc': 'Artwork history',
    'profile.editInfo': 'Update Bio',
    'profile.user': 'Member',
    
    // Fields
    'field.fullName': 'Full Name',
    'field.email': 'Email',
    'field.phone': 'Contact Number',
    'field.address': 'Address',
    'field.idCard': 'ID / Passport',
    'field.notUpdated': '---',
    
    // Settings
    'settings.language': 'Language',
    'settings.theme': 'Ambiance',
    'settings.themeDark': 'Mystic (Dark)',
    'settings.themeDarkDesc': 'Deep & Elegant',
    'settings.themeLight': 'Radiant (Light)',
    'settings.themeLightDesc': 'Bright & Clear',
    
    // Orders
    'orders.title': 'Orders',
    'orders.empty': 'No acquisitions yet',
    'orders.emptyDesc': 'Your collection is empty',
    
    // Achievements
    'achievements.title': 'Achievements',
    'achievements.developing': 'Coming soon...',
    'achievements.points': 'Tribute Points',
    'achievements.badges': 'Badges',
    'achievements.noBadges': 'None',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.empty': 'Silence',
    'notifications.markAllRead': 'Mark all read',
    'notifications.new': 'New',
    
    // Homepage
    'home.welcome': 'Welcome',
    'home.goodMorning': 'Splendid Morning',
    'home.goodAfternoon': 'Good Afternoon',
    'home.goodEvening': 'Tranquil Evening',
    'home.guest': 'Distinguished Guest',
    
    // Rooms
    'room.admin': 'Command Center',
    'room.manager': 'Operations',
    'room.parttime': 'Creative Space',
    'room.showroom': 'Gallery',
    'room.vip': 'VIP Lounge',
  },
};
// =====================================================
// LOCAL STORAGE KEYS
// =====================================================
const STORAGE_KEYS = {
  theme: 'app_theme',
  language: 'app_language',
};

// =====================================================
// CONTEXT
// =====================================================
const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [language, setLanguageState] = useState<LanguageCode>('vi');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings từ localStorage khi mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode;
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.language) as LanguageCode;
    
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedLanguage && ['vi', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    
    setIsHydrated(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isHydrated) return;
    
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      body.style.backgroundColor = '#f5f5f5';
      body.style.color = '#1a1a1a';
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
    }
    
    // Lưu vào localStorage
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme, isHydrated]);

  // Save language to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEYS.language, language);
    document.documentElement.lang = language;
  }, [language, isHydrated]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: AppSettingsContextType = {
    theme,
    language,
    setTheme,
    setLanguage,
    toggleTheme,
    isDark: theme === 'dark',
    isVietnamese: language === 'vi',
    t,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================
export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}

// =====================================================
// CSS VARIABLES (thêm vào globals.css)
// =====================================================
/*
Thêm vào globals.css:

:root {
  --bg-primary: #000000;
  --bg-secondary: #0A0A0A;
  --bg-tertiary: #1A1A1A;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.3);
  --border-color: rgba(255, 255, 255, 0.1);
  --accent: #C69C6D;
  --accent-light: #F2D3A0;
}

.light-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --text-primary: #1a1a1a;
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-muted: rgba(0, 0, 0, 0.3);
  --border-color: rgba(0, 0, 0, 0.1);
  --accent: #C69C6D;
  --accent-light: #F2D3A0;
}
*/
