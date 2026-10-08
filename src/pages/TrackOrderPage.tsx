import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  ShoppingBag,
} from 'lucide-react';
import type { Order, OrderStatus } from '../types/index.ts';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../utils/formatters.ts';

interface TrackOrderPageProps {
  onNavigate: (route: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ onNavigate }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('لطفاً هم شماره سفارش و هم شماره موبایل را وارد فرمایید.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'سفارشی با این اطلاعات یافت نشد.');
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'خطا در پیگیری سفارش');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (num: string, ph: string) => {
    setOrderNumber(num);
    setPhone(ph);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sourcing pipeline timeline steps
  const TIMELINE_STEPS: { key: OrderStatus; title: string; desc: string }[] = [
    { key: 'pending', title: 'ثبت اولیه سفارش', desc: 'سفارش ثبت شده و منتظر پرداخت است' },
    { key: 'confirmed', title: 'تأیید سفارش و پرداخت', desc: 'مبلغ پرداخت شده و سفارش تأیید گردید' },
    { key: 'sourcing', title: 'در حال تأمین از تأمین‌کننده', desc: 'کارشناس یدک‌پارت در حال تهیه کالا از بنکدار است' },
    { key: 'purchased', title: 'خریداری شد', desc: 'کالا خریداری شده و به انبار منتقل شد' },
    { key: 'preparing', title: 'آماده‌سازی و بسته‌بندی', desc: 'کنترل کیفیت سلامت فیزیکی انجام شد' },
    { key: 'shipped', title: 'ارسال شد', desc: 'بسته تحویل اداره پست یا تیپاکس شد' },
    { key: 'delivered', title: 'تحویل داده شد', desc: 'مرسوله با موفقیت تحویل خریدار گردید' },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';

    const orderIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);
    const thisIndex = TIMELINE_STEPS.findIndex((s) => s.key === stepKey);

    if (thisIndex < orderIndex) return 'completed';
    if (thisIndex === orderIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950">سامانه رهگیری و پیگیری سفارش</h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          با وارد کردن شماره سفارش و شماره موبایل ثبت شده، از آخرین وضعیت پردازش، تأمین و ارسال قطعات خود مطلع شوید.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                شماره سفارش (مانند YP-100844):
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="YP-XXXXXX"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                شماره موبایل خریدار:
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912XXXXXXX"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-right focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Quick Demo Helper */}
            <div className="text-[11px] text-zinc-400 flex items-center gap-2">
              <span>نمونه تستی:</span>
              <button
                type="button"
                onClick={() => handleFillDemo('YP-100844', '09351234567')}
                className="font-mono text-amber-600 hover:underline"
              >
                YP-100844 (در حال تأمین)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => handleFillDemo('YP-100843', '09197778899')}
                className="font-mono text-amber-600 hover:underline"
              >
                YP-100843 (ارسال شده)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'در حال استعلام...' : 'استعلام وضعیت سفارش'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Status Result */}
      {order && (
        <div className="space-y-6 animate-fade-in">
          {/* Status Header Banner */}
          <div className="bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">سفارش شماره:</span>
                <span className="font-mono font-bold text-base text-amber-400">{order.orderNumber}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                ثبت شده در: {formatDate(order.createdAt)} | تحویل‌گیرنده: {order.customerName}
              </p>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-zinc-400">وضعیت فعلی:</span>
              <span className="text-sm font-bold text-white mt-0.5">
                {ORDER_STATUS_MAP[order.orderStatus].label}
              </span>
            </div>
          </div>

          {/* Tracking Code Box if shipped */}
          {order.trackingCode && (
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between text-xs text-cyan-900">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-cyan-700" />
                <span>
                  کد رهگیری مرسوله پستی / باربری:{' '}
                  <strong className="font-mono text-sm">{order.trackingCode}</strong>
                </span>
              </div>
              <button
                onClick={() => handleCopy(order.trackingCode!)}
                className="px-3 py-1 bg-white border border-cyan-300 rounded-lg font-medium hover:bg-cyan-100 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی کد</span>
              </button>
            </div>
          )}

          {/* Visual Step-by-Step Dropshipping Timeline */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 mb-6 pb-3 border-b border-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              تایم‌لاین گردش کار تأمین و ارسال قطعات
            </h2>

            <div className="relative space-y-8 pr-4 border-r-2 border-zinc-200 mr-2">
              {TIMELINE_STEPS.map((step, idx) => {
                const status = getStepStatus(step.key, order.orderStatus);
                const isCompleted = status === 'completed';
                const isActive = status === 'active';

                return (
                  <div key={step.key} className="relative">
                    {/* Circle icon marker */}
                    <div
                      className={`absolute -right-[23px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : isActive ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-xs sm:text-sm font-bold ${
                            isActive
                              ? 'text-amber-600'
                              : isCompleted
                              ? 'text-zinc-900'
                              : 'text-zinc-400'
                          }`}
                        >
                          {step.title}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            مرحله کنونی
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchased Items & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                قطعات موجود در این سفارش
              </h3>
              <div className="divide-y divide-zinc-100 text-xs">
                {order.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-900">{it.productName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        کد: {it.sku} · تعداد: {it.quantity}
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900">{formatPrice(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
              <h3 className="text-xs font-bold text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                نشانی مقصد تحویل
              </h3>
              <p className="text-zinc-700 leading-relaxed">
                استان {order.province}، شهر {order.city}، {order.address}
                {order.unit && `، ${order.unit}`}
              </p>
              <div className="pt-2 text-zinc-500 space-y-1">
                <div>کد پستی: <span className="font-mono font-bold text-zinc-800">{order.postalCode}</span></div>
                <div>شماره تماس: <span className="font-mono font-bold text-zinc-800">{order.customerPhone}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
