import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { AdminDashboardStats } from '../../types/index.ts';
import { formatPrice } from '../../utils/formatters.ts';

export const AdminReports: React.FC = () => {
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

  if (loading || !stats) {
    return <div className="py-24 text-center text-xs text-zinc-500">در حال تهیه گزارشات مالی...</div>;
  }

  const averageOrderValue = stats.totalOrders > 0 ? Math.round(stats.totalSales / stats.totalOrders) : 0;
  const cancellationRate = 0; // 0%

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">گزارشات تحلیلی، مالی و بازرگانی</h1>
        <p className="text-zinc-400 mt-1">بررسی سود، میانگین ارزش سبد خرید و پرفروش‌ترین قطعات بازار</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <span className="text-zinc-400">میانگین مبلغ هر سفارش (AOV)</span>
          <div className="text-xl font-bold font-mono text-white">
            {formatPrice(averageOrderValue)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <span className="text-zinc-400">کل سود ناخالص کسب‌شده</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatPrice(stats.totalProfit)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <span className="text-zinc-400">حاشیه سود ناخالص کل (Margin)</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {stats.profitMarginPercent}٪
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
          <span className="text-zinc-400">نرخ لغو سفارشات</span>
          <div className="text-xl font-bold font-mono text-zinc-300">
            {cancellationRate}٪ (بسیار مطلوب)
          </div>
        </div>
      </div>

      {/* Best Sellers and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
            <span>پرفروش‌ترین قطعات بر اساس تعداد فروش</span>
            <span className="text-amber-400">۵ قطعه برتر</span>
          </h2>

          <div className="space-y-3">
            {stats.topSellingProducts.map((it, idx) => (
              <div
                key={it.product.id}
                className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-zinc-900 text-amber-400 font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white truncate max-w-xs">{it.product.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">کد: {it.product.sku}</div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="font-bold text-white block">{it.quantitySold} عدد فروخته شده</span>
                  <span className="text-[10px] text-emerald-400">{formatPrice(it.totalRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
            <span>دسته‌بندی‌های با بالاترین گردش مالی</span>
            <span className="text-zinc-400">سهم بازار</span>
          </h2>

          <div className="space-y-4 pt-2">
            {[
              { name: 'ترمز و متعلقات (لنت و دیسک)', share: 38, sales: 24500000 },
              { name: 'موتور و قطعات فنی (شمع و تسمه)', share: 29, sales: 18700000 },
              { name: 'روغن و سیالات', share: 18, sales: 11600000 },
              { name: 'انتقال قدرت و گیربکس', share: 15, sales: 9600000 },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-zinc-200">{cat.name}</span>
                  <span className="font-mono text-zinc-400">{cat.share}٪ ({formatPrice(cat.sales)})</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
