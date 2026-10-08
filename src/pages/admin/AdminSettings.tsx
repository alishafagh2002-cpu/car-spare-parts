import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { StoreSettings } from '../../types/index.ts';

export const AdminSettings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setSettings(d.settings))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
      }
    } catch (e) {
      alert('خطا در ذخیره تنظیمات');
    }
  };

  if (loading || !settings) {
    return <div className="py-24 text-center text-xs text-zinc-500">در حال دریافت تنظیمات...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in text-xs text-zinc-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">تنظیمات اصلی فروشگاه</h1>
        <p className="text-zinc-400 mt-1">نرخ‌های حمل و نقل، مشخصات تماس و سقف ارسال رایگان</p>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تنظیمات با موفقیت ذخیره شد.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            اطلاعات فروشگاه و تماس
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">نام فروشگاه:</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">شماره تلفن پشتیبانی:</label>
              <input
                type="text"
                dir="ltr"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono text-right focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">نشانی دفتر مرکزی و انبار:</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            تعرفه‌های ارسال و قوانین خرید
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                هزینه ارسال عادی پیشتاز (تومان):
              </label>
              <input
                type="number"
                dir="ltr"
                value={settings.standardShippingFee}
                onChange={(e) =>
                  setSettings({ ...settings, standardShippingFee: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                هزینه ارسال اکسپرس تیپاکس (تومان):
              </label>
              <input
                type="number"
                dir="ltr"
                value={settings.expressShippingFee}
                onChange={(e) =>
                  setSettings({ ...settings, expressShippingFee: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                سقف خرید برای ارسال رایگان (تومان):
              </label>
              <input
                type="number"
                dir="ltr"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                آستانه هشدار کمبود موجودی (تعداد):
              </label>
              <input
                type="number"
                dir="ltr"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تنظیمات فروشگاه</span>
        </button>
      </form>
    </div>
  );
};
