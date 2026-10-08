import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  Clock,
  Truck,
  CheckCircle,
  KeyRound,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Order } from '../types/index.ts';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../utils/formatters.ts';

interface AccountPageProps {
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, token, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile update form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg(null);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUpdateMsg({ type: 'error', text: data.error || 'خطا در ویرایش اطلاعات' });
      } else {
        setUpdateMsg({ type: 'success', text: 'اطلاعات با موفقیت ذخیره شد.' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setUpdateMsg({ type: 'error', text: 'خطای سرور' });
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-base font-bold text-zinc-900">لطفاً ابتدا وارد حساب کاربری خود شوید</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          ورود به حساب کاربری
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{user.name}</h1>
              {isAdmin && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  مدیر سیستم
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">{user.phone} · {user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ورود به پنل مدیریت ادمین</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-zinc-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>تاریخچه سفارش‌های من ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>اطلاعات پروفایل و امنیت</span>
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-20 text-center text-xs text-zinc-500">در حال دریافت سفارش‌ها...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-zinc-200 rounded-3xl space-y-3">
              <Package className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800">شما هنوز سفارشی ثبت نکرده‌اید</h3>
              <button
                onClick={() => onNavigate('products')}
                className="px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
              >
                مشاهده محصولات
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const statusMeta = ORDER_STATUS_MAP[ord.orderStatus];
                return (
                  <div
                    key={ord.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-900 font-mono text-sm">
                          {ord.orderNumber}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-zinc-500">{formatDate(ord.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.bgColor} ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>

                        <button
                          onClick={() => onNavigate(`track-order?orderNumber=${ord.orderNumber}&phone=${ord.customerPhone}`)}
                          className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                        >
                          <span>پیگیری</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-zinc-100 text-xs">
                      {ord.items.map((it) => (
                        <div key={it.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-400 font-bold">{it.quantity}×</span>
                            <span className="font-semibold text-zinc-800">{it.productName}</span>
                          </div>
                          <span className="font-bold text-zinc-900 font-mono">
                            {formatPrice(it.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">مبلغ نهایی:</span>
                      <span className="font-black text-sm text-zinc-950 font-mono">
                        {formatPrice(ord.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
            ویرایش اطلاعات کاربری
          </h2>

          {updateMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs mb-4 font-semibold ${
                updateMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {updateMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1.5">نام و نام خانوادگی:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1.5">شماره موبایل:</label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1.5">ایمیل:</label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <span className="block font-bold text-zinc-800">تغییر رمز عبور (در صورت تمایل):</span>
              <div>
                <label className="block text-zinc-600 mb-1">رمز عبور فعلی:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1">رمز عبور جدید:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              ذخیره تغییرات
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
