import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { DiscountCoupon } from '../../types/index.ts';
import { formatPrice } from '../../utils/formatters.ts';

export const AdminDiscounts: React.FC = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(500000);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(200000);
  const [usageLimit, setUsageLimit] = useState<number | ''>(100);
  const [showAddForm, setShowAddForm] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/cart/coupons', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!code || value === '') {
      setMsg({ type: 'error', text: 'کد و مقدار تخفیف الزامی است' });
      return;
    }

    try {
      const res = await fetch('/api/cart/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          minOrderAmount: Number(minOrderAmount) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          usageLimit: Number(usageLimit) || 100,
          status: 'active',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `کوپن ${code} با موفقیت افزوده شد.` });
        setCode('');
        setValue('');
        setShowAddForm(false);
        fetchCoupons();
      } else {
        setMsg({ type: 'error', text: data.error || 'خطا در ثبت کوپن' });
      }
    } catch {
      setMsg({ type: 'error', text: 'خطای سرور' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کوپن اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/cart/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت کدهای تخفیف و جشنواره‌ها</h1>
          <p className="text-zinc-400 mt-1">تعریف تخفیف‌های درصدی یا ثابت نقدی با سقف استفاده و حداقل سفارش</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'بستن فرم' : 'تعریف کد تخفیف جدید'}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl font-semibold ${
            msg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            ایجاد کد تخفیف جدید
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">کد تخفیف (لاتین):</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: SPRING20"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">نوع تخفیف:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="percent">درصدی (٪)</option>
                  <option value="fixed">مبلغ ثابت (تومان)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  مقدار تخفیف {type === 'percent' ? '(درصد)' : '(تومان)'}:
                </label>
                <input
                  type="number"
                  required
                  dir="ltr"
                  value={value}
                  onChange={(e) => setValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder={type === 'percent' ? '15' : '100000'}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">حداقل مبلغ سفارش (تومان):</label>
                <input
                  type="number"
                  dir="ltr"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="500000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">حداکثر سقف تخفیف درصدی (تومان):</label>
                <input
                  type="number"
                  dir="ltr"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="200000"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">حداکثر تعداد دفعات استفاده:</label>
                <input
                  type="number"
                  dir="ltr"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                  placeholder="100"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl"
            >
              ذخیره و فعال‌سازی کوپن
            </button>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">در حال دریافت کدهای تخفیف...</div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">هیچ کد تخفیفی یافت نشد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/50">
                  <th className="py-3 px-4">کد کوپن</th>
                  <th className="py-3 px-3">نوع تخفیف</th>
                  <th className="py-3 px-3">مقدار</th>
                  <th className="py-3 px-3">حداقل مبلغ سفارش</th>
                  <th className="py-3 px-3">سقف تخفیف</th>
                  <th className="py-3 px-3">تعداد استفاده</th>
                  <th className="py-3 px-3">وضعیت</th>
                  <th className="py-3 px-4 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.code}</td>
                    <td className="py-3 px-3 font-semibold">
                      {c.type === 'percent' ? 'درصدی' : 'مبلغ ثابت'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {c.type === 'percent' ? `${c.value}٪` : formatPrice(c.value)}
                    </td>
                    <td className="py-3 px-3 font-mono">{formatPrice(c.minOrderAmount)}</td>
                    <td className="py-3 px-3 font-mono text-zinc-400">
                      {c.maxDiscount ? formatPrice(c.maxDiscount) : 'نامحدود'}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {c.usageCount} از {c.usageLimit}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        فعال
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
