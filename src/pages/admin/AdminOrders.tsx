import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  ArrowRight,
  Package,
  MapPin,
  X,
  Send,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Order, OrderStatus } from '../../types/index.ts';
import { formatPrice, formatDate, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from '../../utils/formatters.ts';

export const AdminOrders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected Order Drawer / Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [newTrackingCode, setNewTrackingCode] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    let url = '/api/orders?';
    if (selectedStatus !== 'all') url += `status=${selectedStatus}&`;
    if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [token, selectedStatus, search]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingStatus(true);
    setStatusSuccessMsg('');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          trackingCode: newTrackingCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      setUpdatingStatus(false);

      if (res.ok) {
        setStatusSuccessMsg(`وضعیت سفارش با موفقیت به «${ORDER_STATUS_MAP[status].label}» تغییر یافت.`);
        setActiveOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      } else {
        alert(data.error || 'خطا در تغییر وضعیت');
      }
    } catch {
      setUpdatingStatus(false);
      alert('خطای سرور');
    }
  };

  const statusFilterTabs = [
    { id: 'all', label: 'همه سفارش‌ها' },
    { id: 'confirmed', label: 'تأیید شده / آماده تأمین' },
    { id: 'sourcing', label: 'در حال تهیه از بنکدار (Sourcing)' },
    { id: 'purchased', label: 'خریداری شده از تأمین‌کننده' },
    { id: 'preparing', label: 'در حال آماده‌سازی' },
    { id: 'shipped', label: 'ارسال شده' },
    { id: 'delivered', label: 'تحویل داده شده' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت سفارش‌ها و چرخه تأمین کالا</h1>
          <p className="text-zinc-400 mt-1">
            پیگیری سفارش‌های مشتریان از لحظه خرید تا تهیه از بنکدار و تحویل نهایی
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی شماره سفارش، نام خریدار یا کد رهگیری..."
            className="w-full px-3.5 py-2.5 pr-9 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">در حال بارگذاری سفارش‌ها...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">سفارشی در این بخش وجود ندارد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/50">
                  <th className="py-3 px-4">شماره سفارش</th>
                  <th className="py-3 px-3">خریدار</th>
                  <th className="py-3 px-3">مبلغ فروش</th>
                  <th className="py-3 px-3 text-emerald-400">سود شما</th>
                  <th className="py-3 px-3">وضعیت پرداخت</th>
                  <th className="py-3 px-3">وضعیت چرخه تأمین</th>
                  <th className="py-3 px-3">کد رهگیری پستی</th>
                  <th className="py-3 px-3">تاریخ ثبت</th>
                  <th className="py-3 px-4 text-center">جزئیات و تغییر وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {orders.map((ord) => {
                  const sMeta = ORDER_STATUS_MAP[ord.orderStatus];
                  const pMeta = PAYMENT_STATUS_MAP[ord.paymentStatus];

                  return (
                    <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{ord.customerPhone}</div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {formatPrice(ord.totalAmount)}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {formatPrice(ord.totalProfit || 0)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pMeta.bgColor} ${pMeta.color}`}>
                          {pMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${sMeta.bgColor} ${sMeta.color}`}>
                          {sMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-400">
                        {ord.trackingCode || '-'}
                      </td>

                      <td className="py-3 px-3 text-zinc-500">
                        {formatDate(ord.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setActiveOrder(ord);
                            setNewTrackingCode(ord.trackingCode || '');
                            setStatusSuccessMsg('');
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده و اقدام</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal / Drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>سفارش شماره:</span>
                  <span className="font-mono text-amber-400">{activeOrder.orderNumber}</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  ثبت شده در: {formatDate(activeOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {statusSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-semibold">
                  {statusSuccessMsg}
                </div>
              )}

              {/* Sourcing Status Progression Pipeline */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-amber-400 block">
                  گردش کار و پیشبرد چرخه تأمین (Dropship Pipeline):
                </span>
                <p className="text-zinc-400 text-[11px]">
                  وضعیت فعلی: <strong className="text-white">{ORDER_STATUS_MAP[activeOrder.orderStatus].label}</strong>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'sourcing')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 font-semibold text-center"
                  >
                    ۱. شروع تأمین (Sourcing)
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'purchased')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-purple-300 font-semibold text-center"
                  >
                    ۲. خریداری شد از بنکدار
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'preparing')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-orange-950/60 hover:bg-orange-900 border border-orange-700/50 text-orange-300 font-semibold text-center"
                  >
                    ۳. آماده‌سازی و بسته‌بندی
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'shipped')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 font-semibold text-center"
                  >
                    ۴. تحویل به پست/تیپاکس
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'delivered')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 font-semibold text-center"
                  >
                    ۵. تحویل نهایی به خریدار
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, 'cancelled')}
                    disabled={updatingStatus}
                    className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 font-semibold text-center"
                  >
                    لغو سفارش
                  </button>
                </div>

                {/* Tracking Code input */}
                <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={newTrackingCode}
                    onChange={(e) => setNewTrackingCode(e.target.value)}
                    placeholder="کد رهگیری پستی (جهت ارسال به خریدار)..."
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleUpdateStatus(activeOrder.id, activeOrder.orderStatus)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl"
                  >
                    ثبت کد رهگیری
                  </button>
                </div>
              </div>

              {/* Items & Profit Breakdown */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-white block">اقلام خریداری شده و سود این سفارش:</span>
                <div className="divide-y divide-zinc-800">
                  {activeOrder.items.map((item) => {
                    const itemProfit = (item.sellingPrice - (item.purchasePrice || 0)) * item.quantity;
                    return (
                      <div key={item.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            تعداد: {item.quantity} · قیمت تأمین: {formatPrice(item.purchasePrice || 0)} · قیمت فروش: {formatPrice(item.sellingPrice)}
                          </div>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-white font-bold block">{formatPrice(item.totalPrice)}</span>
                          <span className="text-[10px] text-emerald-400">سود: +{formatPrice(itemProfit)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-between items-center font-mono">
                  <span className="text-zinc-400 font-sans">سود کل این فاکتور:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    +{formatPrice(activeOrder.totalProfit || 0)}
                  </span>
                </div>
              </div>

              {/* Customer Address Details */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 text-zinc-300">
                <span className="font-bold text-white block">اطلاعات گیرنده و نشانی:</span>
                <div>نام خریدار: <strong className="text-white">{activeOrder.customerName}</strong></div>
                <div>شماره تماس: <strong className="font-mono text-white">{activeOrder.customerPhone}</strong></div>
                <div>نشانی: استان {activeOrder.province}، شهر {activeOrder.city}، {activeOrder.address}</div>
                <div>کد پستی: <span className="font-mono">{activeOrder.postalCode}</span></div>
                {activeOrder.notes && (
                  <div className="text-amber-400">یادداشت خریدار: {activeOrder.notes}</div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
