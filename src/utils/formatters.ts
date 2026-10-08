import type { OrderStatus, PaymentStatus } from '../types/index.ts';

// Format numbers into Persian locale string with currency
export function formatPrice(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '۰ تومان';
  return `${amount.toLocaleString('fa-IR')} تومان`;
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null) return '۰';
  return val.toLocaleString('fa-IR');
}

// Convert ISO date string to Persian localized readable format
export function formatDate(isoString: string | undefined): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

// Order status configuration
export interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  stepIndex: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: 'در انتظار پرداخت',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'سفارش ثبت شده و منتظر پرداخت نهایی مشتری است.',
    stepIndex: 0,
  },
  confirmed: {
    label: 'تأیید شده / ثبت نهایی',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'پرداخت تایید شد و سفارش به زودی وارد چرخه تأمین می‌شود.',
    stepIndex: 1,
  },
  sourcing: {
    label: 'در حال تأمین از فروشگاه/تأمین‌کننده',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'مدیر فروشگاه در حال سفارش و تهیه قطعات از تأمین‌کننده اصلی است.',
    stepIndex: 2,
  },
  purchased: {
    label: 'خریداری شده از تأمین‌کننده',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'قطعه از بنکدار/تأمین‌کننده خریداری شده و به انبار یدک‌پارت منتقل می‌شود.',
    stepIndex: 3,
  },
  preparing: {
    label: 'در حال آماده‌سازی و بسته‌بندی',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'قطعه در انبار کنترل کیفیت شده و آماده تحویل به پست/تیپاکس است.',
    stepIndex: 4,
  },
  shipped: {
    label: 'ارسال شده',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'بسته تحویل مامور پست/باربری شده و در مسیر ارسال به نشانی شما است.',
    stepIndex: 5,
  },
  delivered: {
    label: 'تحویل داده شده',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'سفارش با موفقیت تحویل خریدار گردید.',
    stepIndex: 6,
  },
  cancelled: {
    label: 'لغو شده',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'سفارش بنا به درخواست خریدار یا عدم تأمین لغو گردید.',
    stepIndex: -1,
  },
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  paid: { label: 'پرداخت موفق', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  failed: { label: 'ناموفق', color: 'text-rose-700', bgColor: 'bg-rose-50' },
  refunded: { label: 'مسترد شده', color: 'text-slate-700', bgColor: 'bg-slate-100' },
};
