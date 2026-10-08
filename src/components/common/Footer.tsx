import React from 'react';
import {
  Car,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-850 mt-16 text-xs">
      {/* 4 Pillars Trust Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ضمانت اصالت ۱۰۰٪</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">تضمین سلامت فیزیکی و هولوگرام شرکتی</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ارسال سریع و مطمئن</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">پست پیشتاز و تیپاکس به سراسر کشور</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">۷ روز مهلت بازگشت</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">در صورت عدم تطابق با خودروی شما</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">مشاوره تخصصی رایگان</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">کارشناسان فنی قطعات خودرو</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-bold">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white">یدک‌پارت</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs">
            یدک‌پارت بازارگاه تخصصی و واسطه مطمئن تأمین قطعات و لوازم یدکی خودرو در ایران است. ما با شبکه گسترده‌ای از واردکنندگان اصلی و بنکداران معتبر بازار چراغ‌برق تهران همکاری می‌کنیم تا قطعات کمیاب و مصرفی انواع خودروهای داخلی و وارداتی را با حاشیه سود منصفانه و اصالت قطعی به دست شما برسانیم.
          </p>
          <div className="pt-2 text-[11px] text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>تهران، خیابان امیرکبیر (چراغ‌برق)، پاساژ کاشانی، پلاک ۲۴</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>تلفن تماس: ۰۲۱-۸۸۹۹۰۰۱۱ | ۰۹۱۲۱۱۱۲۲۳۳</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>ساعات کاری: شنبه تا چهارشنبه ۹ الی ۱۸ | پنج‌شنبه ۹ الی ۱۴</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">دسترسی سریع</h4>
          <ul className="space-y-2 text-zinc-400">
            <li>
              <button onClick={() => onNavigate('products')} className="hover:text-amber-400 transition-colors">
                کاتالوگ تمامی محصولات
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('track-order')} className="hover:text-amber-400 transition-colors">
                پیگیری و استعلام سفارش
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-amber-400 transition-colors">
                درباره ما و فرآیند تأمین
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
                تماس با پشتیبانی فروشگاه
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('faq')} className="hover:text-amber-400 transition-colors">
                سوالات متداول خریداران
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Categories */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">دسته‌بندی‌های پرطرفدار</h4>
          <ul className="space-y-2 text-zinc-400">
            <li>
              <button onClick={() => onNavigate('products?category=cat_brakes')} className="hover:text-amber-400 transition-colors">
                لنت و دیسک ترمز
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products?category=cat_engine')} className="hover:text-amber-400 transition-colors">
                شمع و قطعات فنی موتور
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products?category=cat_suspension')} className="hover:text-amber-400 transition-colors">
                جلوبندی و کمک‌فنر
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products?category=cat_filters')} className="hover:text-amber-400 transition-colors">
                فیلتر روغن و هوا
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('products?category=cat_oils')} className="hover:text-amber-400 transition-colors">
                روغن موتور تمام سنتتیک
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Trust Marks */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">اعتماد و مجوزها</h4>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            دارای نماد اعتماد الکترونیکی و عضو رسمی اتحادیه صنف فروشندگان لوازم یدکی خودرو و ماشین‌آلات تهران.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center flex-1">
              <span className="block text-amber-500 font-bold text-sm">ای‌نماد</span>
              <span className="text-[10px] text-zinc-400">ستاره‌دار الکترونیکی</span>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center flex-1">
              <span className="block text-amber-500 font-bold text-sm">سامانه صدف</span>
              <span className="text-[10px] text-zinc-400">کدرهگیری قطعات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-850 py-4 px-4 sm:px-8 bg-zinc-950 text-zinc-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <p>© تمامی حقوق مادی و معنوی این وبسایت متعلق به «یدک‌پارت» است.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => onNavigate('terms')} className="hover:text-white">
              قوانین و مقررات
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white">
              حریم خصوصی
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
