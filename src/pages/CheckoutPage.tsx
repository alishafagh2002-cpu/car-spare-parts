import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatPrice } from '../../src/utils/formatters.ts';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, discountAmount, shippingFee, total, couponCode, shippingMethod, setShippingMethod } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Address
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');
  const [unit, setUnit] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim() || !address.trim() || !postalCode.trim()) {
      setErrorMessage('لطفاً تمامی فیلدهای الزامی شامل نام، تلفن همراه، آدرس و کد پستی را تکمیل نمایید.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('سبد خرید شما خالی است.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail,
        province,
        city,
        address,
        unit,
        postalCode,
        notes,
        shippingMethod,
        items,
        couponCode: couponCode || undefined,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت سفارش');
      }

      // Navigate to mock payment gateway
      onNavigate(`payment-mock/${data.order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-lg font-bold text-zinc-900">سبد خرید شما خالی است</h2>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">نهایی‌سازی و پرداخت سفارش</h1>
          <p className="text-xs text-zinc-500 mt-0.5">لطفاً مشخصات تحویل‌گیرنده و آدرس ارسال را با دقت وارد فرمایید</p>
        </div>
        <button
          onClick={() => onNavigate('cart')}
          className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به سبد خرید</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Customer Info */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ۱
                </span>
                اطلاعات تحویل‌گیرنده سفارش
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    نام و نام خانوادگی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: علیرضا شفق"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    شماره تلفن همراه (پیگیری): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-right focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    آدرس ایمیل (اختیاری):
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-right focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Address Info */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ۲
                </span>
                نشانی دقیق پستی و محل تحویل
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">استان:</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="تهران"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">شهر:</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="تهران"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  نشانی پستی (خیابان، کوچه، پلاک): <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="خیابان، کوچه، پلاک..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">واحد / طبقه:</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="واحد ۲، طبقه ۱"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    کد پستی ۱۰ رقمی: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-right focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  یادداشت یا توضیحات برای راننده/پیک (اختیاری):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: زنگ واحد خراب است، تماس گرفته شود..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 3. Shipping & Payment Method */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                  ۳
                </span>
                روش پرداخت
              </h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border border-amber-500 bg-amber-50/40 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <span className="block text-xs font-bold text-zinc-900">
                        پرداخت اینترنتی با کلیه کارت‌های عضو شتاب (شاپرک)
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        امن‌ترین روش پرداخت آنلاین با ارجاع به درگاه بانکی
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-28">
              <h2 className="text-base font-bold text-zinc-900 pb-3 border-b border-zinc-100">
                خلاصه اقلام سفارش
              </h2>

              {/* Items preview */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {items.map((i) => (
                  <div key={i.productId} className="flex items-center justify-between py-1 border-b border-zinc-100">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-zinc-400 font-mono text-[11px]">{i.quantity}×</span>
                      <span className="text-zinc-800 truncate">{i.product.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900 whitespace-nowrap mr-2">
                      {formatPrice(i.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-2.5 text-xs pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>مجموع کالاها:</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>تخفیف:</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-600">
                  <span>هزینه ارسال ({shippingMethod === 'express' ? 'اکسپرس تیپاکس' : 'پیشتاز'}):</span>
                  <span className="font-semibold text-zinc-900">
                    {shippingFee === 0 ? 'رایگان' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-zinc-900">
                  <span className="font-bold">مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-xl font-black text-amber-600 font-mono">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <span>در حال انتقال به درگاه بانکی...</span>
                ) : (
                  <>
                    <span>پرداخت و ثبت نهایی سفارش</span>
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>اتصال به شبکه پرداخت الکترونیک شاپرک</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
