'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import { 
  X, User, Package, Phone, Mail, MapPin, CreditCard, 
  ChevronRight, LogOut, ChevronLeft, Settings, Trophy,
  Globe, Moon, Sun, Palette, Check
} from 'lucide-react';
import { OrderService, Order } from '@/lib/OrderService';
import { Z_INDEX } from '@/app/constants/zIndex';
import { LoggerService } from '@/lib/LoggerService';
import { xuLyDangXuat } from './ChucNang';
import { useAppSettings, ThemeMode, LanguageCode } from '@/lib/AppSettingsContext';

// Inline ConfirmDialog component
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  icon,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          {icon && <div>{icon}</div>}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-white/70 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-[#C69C6D] hover:bg-[#C69C6D]/80'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalProfileProps {
  isOpen: boolean;
  onClose: () => void;
  nguoiDung: any;
}

// Các màn hình
type ScreenType = 
  | 'main'           // Màn chính: Cài Đặt, Hồ Sơ Của Tôi
  | 'caidat'         // Cài Đặt: Ngôn Ngữ, Giao Diện
  | 'hosocuatoi'     // Hồ Sơ: Thông Tin, Thành Tích/Đơn Hàng
  | 'thongtincanhan' // Chi tiết thông tin cá nhân
  | 'thanhtich'      // Thành tích (nhan_su)
  | 'donhang'        // Đơn hàng (khach_hang)
  | 'ngonngu'        // Chọn ngôn ngữ
  | 'giaodien';      // Chọn giao diện

export default function ModalProfile({ isOpen, onClose, nguoiDung }: ModalProfileProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 🌐 Hook settings cho theme + language
  const { t, language } = useAppSettings();
  
  // Xác định loại user
  const isNhanSu = nguoiDung?.userType === 'nhan_su' || nguoiDung?.vi_tri;
  const isKhachHang = nguoiDung?.userType === 'khach_hang' || nguoiDung?.phan_loai;

  // Reset về màn chính khi mở lại
  useEffect(() => {
    if (isOpen) {
      setCurrentScreen('main');
    }
  }, [isOpen]);

  // Load orders khi vào màn đơn hàng
  useEffect(() => {
    if (isOpen && currentScreen === 'donhang') {
      loadOrders();
    }
  }, [isOpen, currentScreen]);

  // ✅ ESC KEY HANDLING - Close modal on ESC press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { orders: data } = await OrderService.getMyOrders(20);
      setOrders(data);
    } catch (error) {
      LoggerService.error('ModalProfile', 'Error loading orders', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await xuLyDangXuat();
    } catch (error) {
      LoggerService.error('ModalProfile', 'Logout error', error);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Xử lý nút back - quay về màn cha
  const handleBack = () => {
    switch (currentScreen) {
      case 'ngonngu':
      case 'giaodien':
        setCurrentScreen('caidat');
        break;
      case 'thongtincanhan':
      case 'thanhtich':
      case 'donhang':
        setCurrentScreen('hosocuatoi');
        break;
      default:
        setCurrentScreen('main');
    }
  };

  // Lấy tiêu đề màn hình
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'caidat': return t('profile.settings');
      case 'hosocuatoi': return t('profile.myProfile');
      case 'thongtincanhan': return t('profile.personalInfo');
      case 'thanhtich': return t('profile.achievements');
      case 'donhang': return t('profile.orders');
      case 'ngonngu': return t('settings.language');
      case 'giaodien': return t('settings.theme');
      default: return t('profile.title');
    }
  };

  if (!isOpen) return null;

  // =====================================================
  // MÀN HÌNH CON (không phải main)
  // =====================================================
  if (currentScreen !== 'main') {
    return (
      <div className="fixed inset-0 flex items-center justify-center sm:items-start sm:justify-end" style={{ zIndex: Z_INDEX.modal }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full h-full sm:h-[100dvh] sm:max-w-md bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border-l border-white/20 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header màn con */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft size={24} className="text-white" />
              </button>
              <h2 className="text-lg font-bold text-white">{getScreenTitle()}</h2>
            </div>
          </div>

          {/* Content màn con */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentScreen === 'caidat' && (
              <ScreenCaiDat 
                onGoToNgonNgu={() => setCurrentScreen('ngonngu')}
                onGoToGiaoDien={() => setCurrentScreen('giaodien')}
              />
            )}
            {currentScreen === 'hosocuatoi' && (
              <ScreenHoSoCuaToi 
                isNhanSu={isNhanSu}
                isKhachHang={isKhachHang}
                onGoToThongTin={() => setCurrentScreen('thongtincanhan')}
                onGoToThanhTich={() => setCurrentScreen('thanhtich')}
                onGoToDonHang={() => setCurrentScreen('donhang')}
              />
            )}
            {currentScreen === 'thongtincanhan' && <ScreenThongTinCaNhan nguoiDung={nguoiDung} />}
            {currentScreen === 'thanhtich' && <ScreenThanhTich nguoiDung={nguoiDung} />}
            {currentScreen === 'donhang' && <ScreenDonHang orders={orders} isLoading={isLoadingOrders} onReload={loadOrders} />}
            {currentScreen === 'ngonngu' && <ScreenNgonNgu />}
            {currentScreen === 'giaodien' && <ScreenGiaoDien />}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MÀN HÌNH CHÍNH
  // =====================================================
  return (
    <div className="fixed inset-0 flex items-center justify-center sm:items-start sm:justify-end" style={{ zIndex: Z_INDEX.modal }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-full sm:h-[100dvh] sm:max-w-md bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border-l border-white/20 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header - Avatar & Tên */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C69C6D] to-[#F2D3A0] flex items-center justify-center text-black font-bold text-xl">
                {nguoiDung?.ho_ten?.[0]?.toUpperCase() || nguoiDung?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {nguoiDung?.ho_ten || (language === 'vi' ? 'Người dùng' : 'User')}
                </h2>
                <p className="text-white/60 text-sm">{nguoiDung?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg font-medium text-sm transition-all hover:bg-white/10"
          >
            <LogOut size={18} />
            <span>{isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}</span>
          </button>
        </div>

        {/* Content - 2 mục chính */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* KHỐI MENU CHÍNH */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <KhoiMenuChon 
              icon={<Settings size={20} className="text-[#C69C6D]" />}
              label={t('profile.settings')}
              subtitle={t('profile.settingsDesc')}
              onClick={() => setCurrentScreen('caidat')}
            />
            <KhoiMenuChon 
              icon={<User size={20} className="text-[#C69C6D]" />}
              label={t('profile.myProfile')}
              subtitle={isNhanSu ? t('profile.myProfileDescStaff') : t('profile.myProfileDescCustomer')}
              onClick={() => setCurrentScreen('hosocuatoi')}
              isLast
            />
          </div>

        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title={t('auth.logout')}
        message={t('auth.logoutConfirm')}
        icon={<LogOut className="text-[#C69C6D]" size={24} />}
        confirmText={t('auth.logout')}
        cancelText={t('app.cancel')}
        isDangerous={false}
        isLoading={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => !isLoggingOut && setShowLogoutConfirm(false)}
      />
    </div>
  );
}

// =====================================================
// COMPONENT: KHỐI MENU CHỌN
// =====================================================
function KhoiMenuChon({ 
  icon, 
  label, 
  subtitle,
  onClick, 
  isLast = false 
}: { 
  icon: ReactNode; 
  label: string; 
  subtitle?: string;
  onClick?: () => void; 
  isLast?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-white font-medium">{label}</p>
        {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
      </div>
      {onClick && <ChevronRight size={20} className="text-white/30" />}
    </button>
  );
}

// =====================================================
// MÀN HÌNH: CÀI ĐẶT
// =====================================================
function ScreenCaiDat({ 
  onGoToNgonNgu, 
  onGoToGiaoDien 
}: { 
  onGoToNgonNgu: () => void;
  onGoToGiaoDien: () => void;
}) {
  const { language, theme, t } = useAppSettings();
  
  const languageDisplay = language === 'vi' ? 'Tiếng Việt' : 'English';
  const themeDisplay = theme === 'dark' 
    ? (language === 'vi' ? 'Tối' : 'Dark')
    : (language === 'vi' ? 'Sáng' : 'Light');

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <KhoiMenuChon 
          icon={<Globe size={20} className="text-blue-400" />}
          label={t('settings.language')}
          subtitle={languageDisplay}
          onClick={onGoToNgonNgu}
        />
        <KhoiMenuChon 
          icon={<Palette size={20} className="text-purple-400" />}
          label={t('settings.theme')}
          subtitle={themeDisplay}
          onClick={onGoToGiaoDien}
          isLast
        />
      </div>
    </div>
  );
}

// =====================================================
// MÀN HÌNH: HỒ SƠ CỦA TÔI
// =====================================================
function ScreenHoSoCuaToi({ 
  isNhanSu,
  isKhachHang,
  onGoToThongTin, 
  onGoToThanhTich,
  onGoToDonHang
}: { 
  isNhanSu: boolean;
  isKhachHang: boolean;
  onGoToThongTin: () => void;
  onGoToThanhTich: () => void;
  onGoToDonHang: () => void;
}) {
  const { t } = useAppSettings();
  
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <KhoiMenuChon 
          icon={<User size={20} className="text-[#C69C6D]" />}
          label={t('profile.personalInfo')}
          subtitle={t('profile.personalInfoDesc')}
          onClick={onGoToThongTin}
        />
        
        {/* Thành Tích - chỉ hiện cho nhân sự */}
        {isNhanSu && (
          <KhoiMenuChon 
            icon={<Trophy size={20} className="text-yellow-400" />}
            label={t('profile.achievements')}
            subtitle={t('profile.achievementsDesc')}
            onClick={onGoToThanhTich}
          />
        )}
        
        {/* Đơn Hàng - chỉ hiện cho khách hàng */}
        {isKhachHang && (
          <KhoiMenuChon 
            icon={<Package size={20} className="text-green-400" />}
            label={t('profile.orders')}
            subtitle={t('profile.ordersDesc')}
            onClick={onGoToDonHang}
            isLast
          />
        )}
        
        {/* Nếu là nhân sự thì Thành Tích là last */}
        {isNhanSu && !isKhachHang && (
          <div className="hidden" /> // Placeholder để isLast hoạt động đúng
        )}
      </div>
    </div>
  );
}

// =====================================================
// MÀN HÌNH: THÔNG TIN CÁ NHÂN
// =====================================================
function ScreenThongTinCaNhan({ nguoiDung }: { nguoiDung: any }) {
  const { t } = useAppSettings();
  
  const fields = [
    { icon: User, label: t('field.fullName'), value: nguoiDung?.ho_ten },
    { icon: Mail, label: t('field.email'), value: nguoiDung?.email },
    { icon: Phone, label: t('field.phone'), value: nguoiDung?.so_dien_thoai },
    { icon: MapPin, label: t('field.address'), value: nguoiDung?.dia_chi },
    { icon: CreditCard, label: t('field.idCard'), value: nguoiDung?.cccd },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          const isLast = idx === fields.length - 1;
          return (
            <div key={idx} className={`px-4 py-4 ${!isLast ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon size={20} className="text-[#C69C6D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs">{field.label}</p>
                  <p className="text-white font-medium truncate">
                    {field.value || <span className="text-white/30 italic">{t('field.notUpdated')}</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full py-4 bg-gradient-to-r from-[#C69C6D] to-[#F2D3A0] text-black rounded-2xl font-bold">
        {t('profile.editInfo')}
      </button>
    </div>
  );
}

// =====================================================
// MÀN HÌNH: THÀNH TÍCH (nhan_su)
// =====================================================
function ScreenThanhTich({ nguoiDung }: { nguoiDung: any }) {
  const { t } = useAppSettings();
  
  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">{t('achievements.title')}</h3>
        <p className="text-white/60 text-sm">{t('achievements.developing')}</p>
      </div>
      
      {/* Placeholder cho các thành tích */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{t('achievements.points')}</p>
              <p className="text-white/50 text-sm">0</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Trophy size={20} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{t('achievements.badges')}</p>
              <p className="text-white/50 text-sm">{t('achievements.noBadges')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MÀN HÌNH: ĐƠN HÀNG (khach_hang)
// =====================================================
function ScreenDonHang({ orders, isLoading, onReload }: { orders: Order[]; isLoading: boolean; onReload: () => void }) {
  const { t, language } = useAppSettings();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#C69C6D]/30 border-t-[#C69C6D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">{t('orders.empty')}</h3>
        <p className="text-white/60 text-sm mb-4">{t('orders.emptyDesc')}</p>
        <button onClick={onReload} className="px-4 py-2 bg-[#C69C6D] text-black rounded-lg font-medium">
          {t('app.refresh')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#C69C6D] font-bold">{order.ma_don}</span>
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/80">
              {OrderService.formatStatus(order.trang_thai)}
            </span>
          </div>
          <p className="text-white/60 text-sm">{new Date(order.tao_luc).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</p>
          <p className="text-white font-bold mt-2">{OrderService.formatMoney(order.tong_tien)}</p>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// MÀN HÌNH: NGÔN NGỮ
// =====================================================
function ScreenNgonNgu() {
  const { language, setLanguage, t } = useAppSettings();
  
  const languages: { code: LanguageCode; name: string; flag: string }[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {languages.map((lang, idx) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-[var(--hover-bg)] transition-colors ${idx < languages.length - 1 ? 'border-b border-[var(--border-light)]' : ''}`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="flex-1 text-left text-[var(--text-primary)] font-medium">{lang.name}</span>
            {language === lang.code && (
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Check size={14} className="text-black" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <p className="text-[var(--text-muted)] text-xs text-center">
        {language === 'vi' ? 'Thay đổi ngôn ngữ sẽ được áp dụng ngay lập tức' : 'Language change will be applied immediately'}
      </p>
    </div>
  );
}

// =====================================================
// MÀN HÌNH: GIAO DIỆN
// =====================================================
function ScreenGiaoDien() {
  const { theme, setTheme, t } = useAppSettings();
  
  const themes: { code: ThemeMode; name: string; icon: typeof Moon; desc: string }[] = [
    { code: 'dark', name: t('settings.themeDark'), icon: Moon, desc: t('settings.themeDarkDesc') },
    { code: 'light', name: t('settings.themeLight'), icon: Sun, desc: t('settings.themeLightDesc') },
  ];

  const handleSelect = (code: ThemeMode) => {
    setTheme(code);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {themes.map((themeOption, idx) => {
          const Icon = themeOption.icon;
          return (
            <button
              key={themeOption.code}
              onClick={() => handleSelect(themeOption.code)}
              className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-[var(--hover-bg)] transition-colors ${idx < themes.length - 1 ? 'border-b border-[var(--border-light)]' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
                <Icon size={20} className={themeOption.code === 'dark' ? 'text-purple-400' : 'text-yellow-400'} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[var(--text-primary)] font-medium">{themeOption.name}</p>
                <p className="text-[var(--text-secondary)] text-sm">{themeOption.desc}</p>
              </div>
              {theme === themeOption.code && (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <Check size={14} className="text-black" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-[var(--text-muted)] text-xs text-center">
        {t('settings.language') === 'Ngôn Ngữ' ? 'Thay đổi giao diện sẽ được áp dụng ngay lập tức' : 'Theme change will be applied immediately'}
      </p>
    </div>
  );
}
