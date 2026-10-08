import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { AdminDashboardStats, Order, OrderStatus } from '../../types/index.ts';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../../utils/formatters.ts';

interface AdminDashboardProps {
  onNavigateTab: (tab: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data.stats))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-zinc-500">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p>در حال بارگذاری آمار و اطلاعات فروشگاه...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-xs text-rose-400">خطا در دریافت اطلاعات داشبورد</div>;
  }

  const sourcingOrdersCount = stats.ordersByStatus?.sourcing || 0;
  const confirmedOrdersCount = stats.ordersByStatus?.confirmed || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">پیشخوان و آمار عملکرد فروشگاه</h1>
          <p className="text-xs text-zinc-400 mt-1">
            گزارش زنده فروش، حاشیه سود بازرگانی و وضعیت سفارش‌های در حال تأمین
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('new-product')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow-md"
          >
            + ثبت قطعه جدید
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            مدیریت سفارش‌ها
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>مجموع فروش خالص</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ت
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatPrice(stats.totalSales)}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>پرداخت موفق کلیه سفارش‌ها</span>
            </div>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="text-amber-400 font-bold">سود خالص شما (مارجین)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ٪
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {formatPrice(stats.totalProfit)}
            </div>
            <div className="text-[11px] text-zinc-300 flex items-center gap-1 mt-1">
              <span>حاشیه سود میانگین: </span>
              <strong className="text-amber-400 font-mono">{stats.profitMarginPercent}٪</strong>
            </div>
          </div>
        </div>

        {/* Sourcing queue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>در صف تأمین و خرید</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {sourcingOrdersCount + confirmedOrdersCount} سفارش
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {sourcingOrdersCount} در حال خرید از بنکدار
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>هشدار کمبود موجودی</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {stats.lowStockCount} قلم کالا
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              موجودی کمتر از حداقل تعیین‌شده
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart and Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Profit Chart (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-white">نمودار روند فروش و سود ناخالص ماهانه</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">مقایسه فروش کل در مقابل سود خالص کسب‌شده</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-zinc-600 inline-block" />
                <span className="text-zinc-400">فروش کل</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span className="text-amber-400 font-bold">سود خالص</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4 pt-2">
            {stats.monthlySales.map((m) => {
              const maxSales = 60000000;
              const salesWidth = Math.min(100, Math.round((m.sales / maxSales) * 100));
              const profitWidth = Math.min(100, Math.round((m.profit / maxSales) * 100));

              return (
                <div key={m.month} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-300">{m.month}</span>
                    <div className="text-[11px] space-x-3 space-x-reverse font-mono">
                      <span className="text-zinc-400">فروش: {formatPrice(m.sales)}</span>
                      <span className="text-amber-400 font-bold">سود: {formatPrice(m.profit)}</span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="h-6 w-full bg-zinc-950 rounded-lg overflow-hidden flex items-center p-1 gap-1">
                    <div
                      className="h-full bg-zinc-700 rounded-md transition-all duration-500"
                      style={{ width: `${salesWidth}%` }}
                    />
                    <div
                      className="h-full bg-amber-500 rounded-md transition-all duration-500"
                      style={{ width: `${profitWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dropship Pipeline Status Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            وضعیت زنجیره تأمین سفارش‌ها
          </h2>

          <div className="space-y-2.5 text-xs">
            {Object.entries(ORDER_STATUS_MAP).map(([key, meta]) => {
              const count = stats.ordersByStatus[key as OrderStatus] || 0;
              return (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-zinc-300">{meta.label}</span>
                  </div>
                  <span className="font-bold font-mono text-white">{count} سفارش</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-white">آخرین سفارش‌های ثبت شده</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">مشاهده و انتقال وضعیت به مرحله تأمین یا ارسال</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-3 px-3">شماره سفارش</th>
                <th className="py-3 px-3">مشتری</th>
                <th className="py-3 px-3">تعداد اقلام</th>
                <th className="py-3 px-3">مبلغ فروش</th>
                <th className="py-3 px-3 text-amber-400">سود ناخالص</th>
                <th className="py-3 px-3">وضعیت چرخه تأمین</th>
                <th className="py-3 px-3">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {stats.recentOrders.map((ord) => {
                const meta = ORDER_STATUS_MAP[ord.orderStatus];
                return (
                  <tr key={ord.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-200">
                      {ord.customerName}
                      <span className="block text-[10px] text-zinc-500 font-mono">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{ord.items.length} قلم</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatPrice(ord.totalProfit || 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.bgColor} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500">{formatDate(ord.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
