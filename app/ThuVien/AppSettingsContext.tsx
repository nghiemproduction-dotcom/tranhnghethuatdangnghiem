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
}

// =====================================================
// TRANSLATIONS
// =====================================================
const translations: Record<LanguageCode, Record<string, string>> = {
  vi: {
    // Chung
    'app.name': 'Hệ Thống Quản Lý',
    'app.loading': 'Đang tải...',
    'app.error': 'Có lỗi xảy ra',
    'app.save': 'Lưu',
    'app.cancel': 'Hủy',
    'app.confirm': 'Xác nhận',
    'app.close': 'Đóng',
    'app.back': 'Quay lại',
    'app.next': 'Tiếp theo',
    'app.done': 'Hoàn thành',
    'app.edit': 'Chỉnh sửa',
    'app.delete': 'Xóa',
    'app.search': 'Tìm kiếm',
    'app.refresh': 'Làm mới',
    'app.noData': 'Không có dữ liệu',
    
    // Navigation
    'nav.home': 'Trang Chủ',
    'nav.account': 'Tài Khoản',
    'nav.notifications': 'Thông Báo',
    'nav.department': 'Phòng Ban',
    
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.loginRegister': 'Đăng nhập / Đăng ký',
    'auth.logout': 'Đăng xuất',
    'auth.logoutConfirm': 'Bạn có chắc muốn đăng xuất khỏi hệ thống?',
    'auth.loggingOut': 'Đang xử lý...',
    'auth.loginFailed': 'Không đăng nhập được',
    'auth.loginError': 'Thông tin đăng nhập không chính xác.',
    'auth.needHelp': 'Cần hỗ trợ đăng nhập?',
    'auth.enterEmail': 'Nhập email của bạn',
    'auth.enterPassword': 'Nhập mật khẩu',
    'auth.forgotPassword': 'Quên mật khẩu?',
    'auth.rememberMe': 'Ghi nhớ đăng nhập',
    
    // Profile Modal
    'profile.title': 'Tài Khoản',
    'profile.settings': 'Cài Đặt',
    'profile.settingsDesc': 'Ngôn ngữ, giao diện',
    'profile.myProfile': 'Hồ Sơ Của Tôi',
    'profile.myProfileDescStaff': 'Thông tin, thành tích',
    'profile.myProfileDescCustomer': 'Thông tin, đơn hàng',
    'profile.personalInfo': 'Thông Tin Cá Nhân',
    'profile.personalInfoDesc': 'Họ tên, email, số điện thoại...',
    'profile.achievements': 'Thành Tích',
    'profile.achievementsDesc': 'Điểm thưởng, huy hiệu',
    'profile.orders': 'Đơn Hàng',
    'profile.ordersDesc': 'Lịch sử mua hàng',
    'profile.editInfo': 'Chỉnh sửa thông tin',
    'profile.user': 'Người dùng',
    
    // Fields
    'field.fullName': 'Họ và tên',
    'field.email': 'Email',
    'field.phone': 'Số điện thoại',
    'field.address': 'Địa chỉ',
    'field.idCard': 'CCCD/CMND',
    'field.notUpdated': 'Chưa cập nhật',
    
    // Settings
    'settings.language': 'Ngôn Ngữ',
    'settings.theme': 'Giao Diện',
    'settings.themeDark': 'Tối',
    'settings.themeDarkDesc': 'Nền tối, dễ nhìn ban đêm',
    'settings.themeLight': 'Sáng',
    'settings.themeLightDesc': 'Nền sáng, dễ nhìn ban ngày',
    
    // Orders
    'orders.title': 'Đơn Hàng',
    'orders.empty': 'Chưa có đơn hàng',
    'orders.emptyDesc': 'Bạn chưa có đơn hàng nào',
    
    // Achievements
    'achievements.title': 'Thành Tích',
    'achievements.developing': 'Tính năng đang phát triển...',
    'achievements.points': 'Điểm thưởng',
    'achievements.badges': 'Huy hiệu',
    'achievements.noBadges': 'Chưa có',
    
    // Notifications
    'notifications.title': 'Thông Báo',
    'notifications.empty': 'Không có thông báo',
    'notifications.markAllRead': 'Đánh dấu tất cả đã đọc',
    'notifications.new': 'Mới',
    
    // Homepage
    'home.welcome': 'Chào mừng',
    'home.goodMorning': 'Chào buổi sáng',
    'home.goodAfternoon': 'Chào buổi chiều',
    'home.goodEvening': 'Chào buổi tối',
    'home.guest': 'Khách',
    
    // Rooms/Departments
    'room.admin': 'Phòng Admin',
    'room.manager': 'Phòng Quản Lý',
    'room.parttime': 'Phòng Part-time',
    'room.showroom': 'Phòng Trưng Bày',
    'room.vip': 'Phòng VIP',
  },
  en: {
    // Common
    'app.name': 'Management System',
    'app.loading': 'Loading...',
    'app.error': 'An error occurred',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.confirm': 'Confirm',
    'app.close': 'Close',
    'app.back': 'Back',
    'app.next': 'Next',
    'app.done': 'Done',
    'app.edit': 'Edit',
    'app.delete': 'Delete',
    'app.search': 'Search',
    'app.refresh': 'Refresh',
    'app.noData': 'No data',
    
    // Navigation
    'nav.home': 'Home',
    'nav.account': 'Account',
    'nav.notifications': 'Notifications',
    'nav.department': 'Department',
    
    // Auth
    'auth.login': 'Login',
    'auth.loginRegister': 'Login / Register',
    'auth.logout': 'Logout',
    'auth.logoutConfirm': 'Are you sure you want to logout?',
    'auth.loggingOut': 'Processing...',
    'auth.loginFailed': 'Login failed',
    'auth.loginError': 'Invalid login credentials.',
    'auth.needHelp': 'Need help logging in?',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    
    // Profile Modal
    'profile.title': 'Account',
    'profile.settings': 'Settings',
    'profile.settingsDesc': 'Language, theme',
    'profile.myProfile': 'My Profile',
    'profile.myProfileDescStaff': 'Info, achievements',
    'profile.myProfileDescCustomer': 'Info, orders',
    'profile.personalInfo': 'Personal Information',
    'profile.personalInfoDesc': 'Name, email, phone...',
    'profile.achievements': 'Achievements',
    'profile.achievementsDesc': 'Points, badges',
    'profile.orders': 'Orders',
    'profile.ordersDesc': 'Purchase history',
    'profile.editInfo': 'Edit information',
    
    // Fields
    'field.fullName': 'Full name',
    'field.email': 'Email',
    'field.phone': 'Phone number',
    'field.address': 'Address',
    'field.idCard': 'ID Card',
    'field.notUpdated': 'Not updated',
    
    // Settings
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.themeDark': 'Dark',
    'settings.themeDarkDesc': 'Dark background, easy on eyes at night',
    'settings.themeLight': 'Light',
    'settings.themeLightDesc': 'Light background, easy on eyes during day',
    
    // Orders
    'orders.title': 'Orders',
    'orders.empty': 'No orders yet',
    'orders.emptyDesc': 'You don\'t have any orders',
    
    // Achievements
    'achievements.title': 'Achievements',
    'achievements.developing': 'Feature in development...',
    'achievements.points': 'Points',
    'achievements.badges': 'Badges',
    'achievements.noBadges': 'None yet',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.empty': 'No notifications',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.new': 'New',
    
    // Homepage
    'home.welcome': 'Welcome',
    'home.goodMorning': 'Good morning',
    'home.goodAfternoon': 'Good afternoon',
    'home.goodEvening': 'Good evening',
    'home.guest': 'Guest',
    
    // Rooms/Departments
    'room.admin': 'Admin Room',
    'room.manager': 'Manager Room',
    'room.parttime': 'Part-time Room',
    'room.showroom': 'Showroom',
    'room.vip': 'VIP Room',
    
    // Profile
    'profile.user': 'User',
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
