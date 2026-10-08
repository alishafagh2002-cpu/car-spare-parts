import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { CustomerSummary } from '../../types/index.ts';
import { formatPrice, formatDate } from '../../utils/formatters.ts';

export const AdminCustomers: React.FC = () => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (token) {
      fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCustomers(data.customers || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت مشتریان و خریداران</h1>
        <p className="text-zinc-400 mt-1">مشاهده مشخصات خریداران، تعداد سفارش‌ها و مجموع خرید ثبت‌شده</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام خریدار، شماره موبایل یا ایمیل..."
            className="w-full px-3.5 py-2.5 pr-9 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">در حال بارگذاری اطلاعات مشتریان...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">مشتری‌ای یافت نشد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/50">
                  <th className="py-3 px-4">نام خریدار</th>
                  <th className="py-3 px-3">شماره تماس</th>
                  <th className="py-3 px-3">ایمیل</th>
                  <th className="py-3 px-3">تعداد سفارش‌ها</th>
                  <th className="py-3 px-3 text-white">مجموع خرید</th>
                  <th className="py-3 px-3">تاریخ آخرین سفارش</th>
                  <th className="py-3 px-3">وضعیت حساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-zinc-300">{c.phone}</td>
                    <td className="py-3 px-3 font-mono text-zinc-400">{c.email}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {c.ordersCount} سفارش
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-3 px-3 text-zinc-500">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : 'بدون سفارش'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        فعال
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
