import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ExternalLink,
  Car,
  ChevronLeft,
  Menu,
  X,
  Layers,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateHome,
  children,
}) => {
  const { user, token, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch(console.error);
    }
  }, [token]);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'داشبورد و آمار کلی', icon: LayoutDashboard },
    { id: 'orders', label: 'مدیریت سفارش‌ها و تأمین', icon: ShoppingBag },
    { id: 'products', label: 'مدیریت کالاها و انبار', icon: Package },
    { id: 'new-product', label: 'افزودن محصول جدید', icon: PlusCircle },
    { id: 'customers', label: 'مدیریت مشتریان', icon: Users },
    { id: 'discounts', label: 'کدهای تخفیف', icon: Tag },
    { id: 'reports', label: 'گزارش سود و مالی', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات فروشگاه', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-zinc-900 border-l border-zinc-800 shrink-0 hidden md:flex flex-col justify-between">
        <div>
          {/* Admin Brand Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-sm text-white">یدک‌پارت</span>
                <span className="block text-[10px] text-amber-400 font-mono">پنل مدیریت ادمین</span>
              </div>
            </div>

            <button
              onClick={onNavigateHome}
              title="مشاهده سایت اصلی"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full p-2.5 rounded-xl font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onNavigateHome}
              className="flex-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium text-center transition-colors"
            >
              فروشگاه
            </button>
            <button
              onClick={logout}
              className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-lg text-[11px] font-medium transition-colors"
              title="خروج از حساب"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h2 className="text-sm font-bold text-white hidden sm:block">
              {navItems.find((n) => n.id === currentTab)?.label || 'داشبورد مدیریت'}
            </h2>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifPopover && (
                <div className="absolute left-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
                    <span className="font-bold text-white">اعلان‌های سیستم</span>
                    <span className="text-[10px] text-zinc-400">{unreadNotifCount} خوانده نشده</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500">اعلانی وجود ندارد</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-right cursor-pointer transition-colors ${
                            n.isRead
                              ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                              : 'bg-zinc-800 border-amber-500/40 text-white'
                          }`}
                        >
                          <div className="font-semibold text-xs text-amber-300">{n.title}</div>
                          <div className="text-[11px] mt-1 leading-relaxed">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onNavigateHome}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5"
            >
              <span>مشاهده سایت</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileSidebarOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800 p-4 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl font-medium flex items-center gap-2.5 ${
                    currentTab === item.id
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:bg-zinc-800 text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Admin View */}
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
