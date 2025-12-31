'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCircle2, MessageCircle, Heart, Users, Zap, AlertCircle, ShoppingBag, Calendar, Award } from 'lucide-react';
import { Notification, NotificationGroup, NOTIFICATION_CONFIG, NotificationType } from './NotificationTypes';
import { useAppSettings } from '@/app/ThuVien/AppSettingsContext';

interface Props {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationCenter({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete,
  onNotificationClick 
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategory, setFilteredCategory] = useState<string | null>(null);
  const { t, language } = useAppSettings(); // 🌐 Hook ngôn ngữ

  // Nhóm thông báo theo category
  const groupedNotifications: NotificationGroup[] = React.useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notif => {
      if (!groups[notif.category]) {
        groups[notif.category] = [];
      }
      groups[notif.category].push(notif);
    });

    return Object.entries(groups).map(([category, notifs]) => ({
      category: category as any,
      label: getCategoryLabel(category),
      notifications: notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      unread_count: notifs.filter(n => !n.is_read).length,
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));
  }, [notifications]);

  const displayedNotifications = filteredCategory 
    ? groupedNotifications.find(g => g.category === filteredCategory)?.notifications || []
    : notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="relative">
      {/* Notification Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 backdrop-blur-sm group active:scale-95"
      >
        <Bell size={18} className="text-[#C69C6D]" />
        
        {/* Badge - Unread count */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Indicator dot */}
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed md:absolute top-[85px] md:top-[120%] left-0 md:left-auto md:right-0 w-screen md:w-[450px] md:max-h-[600px] bg-[#0a0807]/95 border-t md:border border-[#8B5E3C]/30 rounded-none md:rounded-xl shadow-2xl overflow-hidden z-[5100] backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="sticky top-0 px-4 py-3 border-b border-[#8B5E3C]/20 bg-black/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} {t('notifications.new')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button 
                  onClick={onMarkAllAsRead}
                  className="p-1.5 text-[#C69C6D] hover:bg-white/10 rounded transition-all active:scale-95"
                  title={t('notifications.markAllRead')}
                >
                  <CheckCircle2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all md:hidden active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {groupedNotifications.length > 0 && (
            <div className="sticky top-[53px] px-3 py-2 bg-black/30 border-b border-[#8B5E3C]/10 overflow-x-auto flex gap-2">
              <button
                onClick={() => setFilteredCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                  filteredCategory === null
                    ? 'bg-[#C69C6D] text-black'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {language === 'vi' ? 'Tất cả' : 'All'}
              </button>
              {groupedNotifications.map(group => (
                <button
                  key={group.category}
                  onClick={() => setFilteredCategory(group.category)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 active:scale-95 ${
                    filteredCategory === group.category
                      ? 'bg-[#C69C6D] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {group.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {group.unread_count}
                    </span>
                  )}
                  {group.label}
                </button>
              ))}
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            {displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={32} className="text-gray-500 mb-2 opacity-50" />
                <p className="text-sm text-gray-400">{t('notifications.empty')}</p>
              </div>
            ) : (
              displayedNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => {
                    onMarkAsRead(notification.id);
                  }}
                  onDelete={() => onDelete(notification.id)}
                  onClick={() => {
                    onNotificationClick(notification);
                    setIsOpen(false);
                  }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#8B5E3C]/20 px-4 py-3 bg-black/50 text-center">
              <button className="text-xs text-[#C69C6D] hover:text-white font-bold uppercase tracking-widest transition-all active:scale-95">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[5099] md:hidden"
        />
      )}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onClick 
}: {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type as NotificationType];
  const IconComponent = getIconComponent(notification.type);

  return (
    <div
      onClick={onClick}
      className={`group relative p-3 rounded-lg transition-all cursor-pointer ${
        notification.is_read
          ? 'bg-white/5 hover:bg-white/10'
          : 'bg-[#C69C6D]/10 border border-[#C69C6D]/30 hover:bg-[#C69C6D]/20'
      }`}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute top-3 left-3 w-2 h-2 bg-red-500 rounded-full"></div>
      )}

      <div className="flex gap-3 pl-4">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {notification.from_user_avatar ? (
            <img
              src={notification.from_user_avatar}
              alt={notification.from_user_name}
              className="w-10 h-10 rounded-full object-cover border border-[#C69C6D]/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
              <IconComponent size={18} style={{ color: config.color }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-bold text-white truncate">
              {notification.title}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {formatTime(notification.created_at)}
            </span>
          </div>
          
          <p className="text-xs text-gray-300 line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.is_read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="text-[10px] text-[#C69C6D] hover:text-white font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1"
              >
                <Check size={12} /> Đã đọc
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[10px] text-gray-400 hover:text-red-400 font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'from_users': 'Từ người dùng',
    'from_system': 'Từ hệ thống',
    'from_business': 'Từ đơn hàng',
    'from_events': 'Từ sự kiện',
    'from_content': 'Từ nội dung',
    'from_security': 'Bảo mật'
  };
  return labels[category] || category;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'from_users': '#3B82F6',
    'from_system': '#6366F1',
    'from_business': '#8B5E3C',
    'from_events': '#F59E0B',
    'from_content': '#C69C6D',
    'from_security': '#EF4444'
  };
  return colors[category] || '#C69C6D';
}

function getCategoryIcon(category: string): any {
  const icons: Record<string, any> = {
    'from_users': Users,
    'from_system': Zap,
    'from_business': ShoppingBag,
    'from_events': Calendar,
    'from_content': Award,
    'from_security': AlertCircle
  };
  return icons[category] || Bell;
}

function getIconComponent(type: NotificationType): any {
  const icons: Record<NotificationType, any> = {
    'user_follow': Users,
    'user_comment': MessageCircle,
    'user_like': Heart,
    'user_message': MessageCircle,
    'user_mention': MessageCircle,
    'user_tag': MessageCircle,
    'system_update': Zap,
    'system_announcement': Zap,
    'system_alert': AlertCircle,
    'order_created': ShoppingBag,
    'order_confirmed': CheckCircle2,
    'order_shipped': ShoppingBag,
    'order_delivered': CheckCircle2,
    'payment_received': CheckCircle2,
    'event_new': Calendar,
    'event_reminder': Calendar,
    'workshop_new': Users,
    'workshop_reminder': Bell,
    'achievement_unlocked': Award,
    'milestone_reached': Award,
    'product_new': ShoppingBag,
    'artwork_new': Award,
    'artwork_featured': Award,
    'security_alert': AlertCircle,
    'login_new_device': AlertCircle
  };
  return icons[type] || Bell;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes}p trước`;
  if (hours < 24) return `${hours}h trước`;
  if (days < 7) return `${days}d trước`;
  
  return date.toLocaleDateString('vi-VN');
}
