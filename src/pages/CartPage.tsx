import React, { useState } from 'react';
import {
  Trash2,
  ShoppingCart,
  ArrowLeft,
  Truck,
  Tag,
  Check,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatPrice } from '../utils/formatters.ts';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    couponCode,
    couponMessage,
    shippingMethod,
    setShippingMethod,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponAlert, setCouponAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponAlert(null);
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);

    if (res.success) {
      setCouponAlert({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponAlert({ type: 'error', text: res.message });
    }
  };

  const freeShippingThreshold = 2500000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">سبد خرید شما در حال حاضر خالی است</h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          می‌توانید با انتخاب مدل خودرو یا جستجوی قطعه مورد نظر، لوازم یدکی مورد نیاز خود را به سبد خرید اضافه کنید.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow-md"
        >
          مشاهده قطعات و شروع خرید
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">سبد خرید شما</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{itemCount} قطعه در سبد خرید موجود است</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>خالی کردن سبد خرید</span>
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl">
        <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>
              {remainingForFreeShipping > 0
                ? `با خرید ${formatPrice(remainingForFreeShipping)} دیگر، ارسال عادی برای شما رایگان خواهد شد!`
                : 'تبریک! سفارش شما شامل ارسال عادی رایگان است.'}
            </span>
          </div>
          <span className="font-mono text-[11px]">{freeShippingProgress}٪</span>
        </div>
        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 shadow-sm">
            {items.map((item) => (
              <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                {/* Thumbnail */}
                <img
                  src={item.product.images[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&q=80'}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                />

                {/* Details */}
                <div className="flex-1 text-center sm:text-right min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-500 mb-1">
                    <span>{item.product.brandName}</span>
                    <span>·</span>
                    <span className="font-mono">{item.product.sku}</span>
                  </div>
                  <h3
                    onClick={() => onNavigate(`product/${item.product.slug}`)}
                    className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-amber-600 cursor-pointer transition-colors"
                  >
                    {item.product.name}
                  </h3>
                  <div className="text-xs text-zinc-500 mt-1">
                    قیمت واحد: <span className="font-semibold text-zinc-800">{formatPrice(item.unitPrice)}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-200"
                  >
                    -
                  </button>
                  <span className="w-9 text-center font-bold text-xs">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-200 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Total Price & Delete */}
                <div className="text-center sm:text-left min-w-[110px]">
                  <div className="text-sm font-black text-zinc-950 mb-1">
                    {formatPrice(item.totalPrice)}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[11px] text-zinc-400 hover:text-rose-600 flex items-center gap-1 mx-auto sm:mr-auto sm:ml-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف قطعه</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ادامه خرید قطعات دیگر</span>
            </button>
          </div>
        </div>

        {/* Right: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Summary Box */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-zinc-900 pb-3 border-b border-zinc-100">
              خلاصه صورت‌حساب
            </h2>

            {/* Price breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <span>جمع قیمت اقلام ({itemCount} عدد):</span>
                <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>تخفیف اعمال شده:</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              {/* Shipping method selection */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <span className="block text-zinc-700 font-semibold">روش ارسال:</span>
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 cursor-pointer text-zinc-700 hover:bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span>ارسال عادی (پست پیشتاز)</span>
                  </div>
                  <span className="font-semibold font-mono">
                    {subtotal >= 2500000 ? 'رایگان' : '۴۹,۰۰۰ تومان'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 cursor-pointer text-zinc-700 hover:bg-zinc-50">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span>ارسال سریع اکسپرس (تیپاکس)</span>
                  </div>
                  <span className="font-semibold font-mono">۷۵,۰۰۰ تومان</span>
                </label>
              </div>

              <div className="flex items-center justify-between text-zinc-600 pt-2 border-t border-zinc-100">
                <span>هزینه حمل و ارسال:</span>
                <span className="font-semibold text-zinc-900">
                  {shippingFee === 0 ? 'رایگان' : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">مبلغ نهایی قابل پرداخت:</span>
                <span className="text-xl font-black text-zinc-950">{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>ادامه فرآیند خرید و ثبت آدرس</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon Box */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" />
              کد تخفیف دارید؟
            </h3>

            {couponCode ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div>
                  <span className="font-bold font-mono">{couponCode}</span>
                  <span className="text-[11px] block text-emerald-700 mt-0.5">{couponMessage}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  حذف
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="کد تخفیف (مثلاً YADAK10)"
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs uppercase placeholder-zinc-400 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                >
                  {couponLoading ? '...' : 'اعمال'}
                </button>
              </form>
            )}

            {couponAlert && (
              <p
                className={`text-[11px] font-medium ${
                  couponAlert.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {couponAlert.text}
              </p>
            )}

            <div className="text-[11px] text-zinc-400 pt-1">
              کدهای تست فعال: <span className="font-mono text-zinc-600">YADAK10</span> یا <span className="font-mono text-zinc-600">NOWRUZ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
