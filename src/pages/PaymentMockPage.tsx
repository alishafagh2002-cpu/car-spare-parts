import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatPrice } from '../utils/formatters.ts';
import type { Order } from '../types/index.ts';

interface PaymentMockPageProps {
  orderId: string;
  onNavigate: (route: string) => void;
}

export const PaymentMockPage: React.FC<PaymentMockPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Mock card inputs
  const [cardNumber, setCardNumber] = useState('6037-9971-8842-1054');
  const [cvv2, setCvv2] = useState('456');
  const [month, setMonth] = useState('08');
  const [year, setYear] = useState('05');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulatePayment = async (success: boolean) => {
    if (!order) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          success,
          refNumber: `SHP-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      const data = await res.json();
      setProcessing(false);

      if (success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onNavigate(`order-success/${order.id}`);
      } else {
        alert('تراکنش پرداخت ناموفق بود یا توسط کاربر لغو گردید.');
        onNavigate(`cart`);
      }
    } catch (err) {
      setProcessing(false);
      alert('خطا در پردازش درگاه پرداخت');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 mt-4">در حال اتصال به سامانه پرداخت الکترونیک شاپرک...</p>
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
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-zinc-100">
      <div className="w-full max-w-xl bg-white border border-zinc-300 rounded-3xl shadow-xl overflow-hidden">
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">درگاه پرداخت الکترونیک شاپرک</h1>
                <p className="text-[11px] text-zinc-400">پذیرنده: یدک‌پارت (بازارگاه قطعات خودرو)</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-amber-400 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Amount & Order details bar */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between text-xs text-zinc-800">
          <div>
            <span className="text-zinc-500 block text-[10px]">شماره سفارش:</span>
            <span className="font-bold font-mono text-zinc-900">{order.orderNumber}</span>
          </div>

          <div className="text-left">
            <span className="text-zinc-500 block text-[10px]">مبلغ قابل کسر:</span>
            <span className="text-base font-black text-zinc-950 font-mono">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Card Form Mock */}
        <div className="p-6 space-y-5">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              این صفحه شبیه‌ساز پرداخت جهت تست سناریوهای سفارش است. اطلاعات بانکی واقعی لازم نیست.
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Card number */}
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">شماره کارت بانکی:</label>
              <input
                type="text"
                dir="ltr"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-center tracking-widest text-zinc-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* CVV2 and Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">کد CVV2:</label>
                <input
                  type="password"
                  dir="ltr"
                  maxLength={4}
                  value={cvv2}
                  onChange={(e) => setCvv2(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-center tracking-widest text-zinc-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">تاریخ انقضا (ماه / سال):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={2}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="ماه"
                    className="w-1/2 px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-center text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={2}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="سال"
                    className="w-1/2 px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-center text-zinc-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <button
              onClick={() => handleSimulatePayment(true)}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span>پرداخت موفق (تایید تراکنش و ثبت قطعی سفارش)</span>
            </button>

            <button
              onClick={() => handleSimulatePayment(false)}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-rose-50 text-rose-600 border border-zinc-200 hover:border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>پرداخت ناموفق / انصراف از خرید</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>پروتکل امن SSL شاپرک</span>
          </div>
          <button onClick={() => onNavigate('cart')} className="hover:text-zinc-900">
            انصراف و بازگشت به فروشگاه
          </button>
        </div>
      </div>
    </div>
  );
};
