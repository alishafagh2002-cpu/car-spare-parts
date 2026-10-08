import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import type { Order } from '../types/index.ts';
import { formatPrice, formatDate, ORDER_STATUS_MAP } from '../utils/formatters.ts';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (route: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 mt-4">در حال دریافت فاکتور و وضعیت سفارش...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <h2 className="text-base font-bold text-zinc-900">سفارش یافت نشد</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Success Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-black text-zinc-950">پرداخت موفقیت‌آمیز بود!</h1>
        <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
          سفارش شما با موفقیت در سیستم ثبت گردید و هم‌اکنون در اولویت تأمین و بسته‌بندی قرار گرفته است.
        </p>

        {/* Order Number & Tracking details */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs">
          <div>
            <span className="text-zinc-500 text-[10px] block">شماره سفارش شما:</span>
            <span className="font-bold font-mono text-zinc-900 text-sm">{order.orderNumber}</span>
          </div>

          <button
            onClick={() => handleCopy(order.orderNumber)}
            className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 transition-colors"
            title="کپی شماره سفارش"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sourcing Timeline Info Box */}
      <div className="bg-zinc-900 text-white border border-zinc-800 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold">مراحل تأمین و ارسال قطعات شما</h2>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            وضعیت: {ORDER_STATUS_MAP[order.orderStatus].label}
          </span>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          <p className="leading-relaxed">
            تیم بازرگانی یدک‌پارت فورا خرید مستقیم قطعات شما را از بنکدار مربوطه نهایی کرده و پس از بازرسی سلامت فیزیکی، آن را به مأمور ارسال تحویل خواهد داد.
          </p>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between text-[11px]">
            <span>شماره موبایل جهت پیگیری آنلاین:</span>
            <span className="font-mono text-white font-bold">{order.customerPhone}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('track-order')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>سامانه پیگیری لحظه‌ای سفارش</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl text-xs transition-colors"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </div>

      {/* Order Summary Details */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-500" />
          اقلام خریداری شده
        </h3>

        <div className="divide-y divide-zinc-100 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-zinc-400">{item.quantity}×</span>
                <span className="text-zinc-800 font-semibold">{item.productName}</span>
              </div>
              <span className="font-mono font-bold text-zinc-900">{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-xs">
          <span className="text-zinc-500">مجموع پرداختی با احتساب حمل:</span>
          <span className="font-black text-sm text-zinc-950 font-mono">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
