import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-zinc-950">درباره فروشگاه تخصصی یدک‌پارت</h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto">
          پل ارتباطی مطمئن و واسطه هوشمند بین خریدار و معتبرترین واردکنندگان و بنکداران بازار قطعات خودرو
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-8 space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
          مدل تجاری ما: شفافیت، اصالت و حذف دلالان خرده‌پا
        </h2>
        <p>
          بازار سنتی لوازم یدکی خودرو در ایران همواره با چالش‌هایی نظیر قیمت‌گذاری‌های سلیقه‌ای، عرضه کالاهای تقلبی در بسته‌بندی‌های مشابه اصل، و فقدان شفافیت در فرآیند تهیه قطعه روبه‌رو بوده است.
        </p>
        <p>
          مجموعه <strong>«یدک‌پارت»</strong> با هدف تغییر این ساختار تأسیس شده است. ما به عنوان یک بازارگاه هوشمند (Sourcing & Dropship Marketplace)، مستقیماً با بزرگترین بنکداران چراغ‌برق تهران، شرکت‌های رسمی واردکننده و خطوط تولید ایران‌خودرو و سایپا قرارداد همکاری داریم.
        </p>
        <p>
          هنگامی که شما سفارشی را در سایت ثبت می‌نمایید، سیستم هوشمند ما کمترین نرخ تأمین را از میان تأمین‌کنندگان بررسی کرده، قطعه فیزیکی را با بررسی بارکد و هولوگرام خریداری و پس از تأیید کیفیت نهایی در انبار مرکزی، آن را با حاشیه سود مشخص و تضمین‌شده برای شما ارسال می‌کند.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
          <div className="p-4 bg-zinc-50 rounded-2xl text-center">
            <ShieldCheck className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-zinc-900 text-xs">تضمین اصالت کالا</h3>
            <p className="text-[11px] text-zinc-500 mt-1">تطابق کامل با نمونه خط تولید شرکتی</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl text-center">
            <Truck className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-zinc-900 text-xs">ارسال سریع کشوری</h3>
            <p className="text-[11px] text-zinc-500 mt-1">پست پیشتاز، تیپاکس و باربری ایمن</p>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl text-center">
            <RotateCcw className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold text-zinc-900 text-xs">ضمانت بازگشت وجه</h3>
            <p className="text-[11px] text-zinc-500 mt-1">۷ روز مهلت تعویض در صورت عدم تطابق</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-zinc-950">ارتباط با پشتیبانی یدک‌پارت</h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto">
          تیم کارشناسان فنی ما آماده پاسخگویی به سوالات شما درباره سازگاری قطعات، مشاوره خرید و پیگیری سفارشات هستند
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 space-y-6">
          <h2 className="text-base font-bold border-b border-zinc-800 pb-3">اطلاعات دفاتر و انبار مرکزی</h2>

          <div className="space-y-4 text-xs text-zinc-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">آدرس دفتر مرکزی و انبار:</strong>
                <span>تهران، خیابان امیرکبیر (چراغ‌برق)، پاساژ کاشانی، طبقه ۲، واحد ۲۴</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">تلفن‌های تماس مستقیم:</strong>
                <span dir="ltr">۰۲۱-۸۸۹۹۰۰۱۱ | ۰۲۱-۸۸۹۹۰۰۱۲</span>
                <span className="block mt-1">همراه پشتیبانی: ۰۹۱۲۱۱۱۲۲۳۳</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">پست الکترونیکی:</strong>
                <span className="font-mono">support@yadakpart.ir</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">ساعات پاسخگویی تلفنی:</strong>
                <span>شنبه تا چهارشنبه: ۹:۰۰ الی ۱۸:۰۰</span>
                <span className="block">پنج‌شنبه‌ها: ۹:۰۰ الی ۱۴:۰۰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-zinc-900 text-sm">پیام شما با موفقیت ثبت شد</h3>
              <p className="text-xs text-zinc-500">کارشناسان ما به زودی با شماره تماس شما تماس خواهند گرفت.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 text-xs"
            >
              <h3 className="font-bold text-zinc-900 text-sm pb-2 border-b border-zinc-100">
                ارسال پیام یا استعلام قطعه خاص
              </h3>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  placeholder="علی محمدی"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">شماره تماس:</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="09123456789"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">متن پیام یا مشخصات خودرو:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="نام قطعه، مدل خودرو و سال ساخت..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                ارسال پیام به واحد فنی
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'چگونه می‌توانم از سازگاری دقیق قطعه با خودروی خود مطمئن شوم؟',
      a: 'شما می‌توانید در بالای سایت از منوی «گاراژ من / انتخاب خودرو»، برند و مدل خودروی خود را انتخاب کنید تا کلیه قطعات فیلتر شوند. همچنین در صفحه هر قطعه، لیست دقیق خودروهای پشتیبانی‌شده و مشخصات فنی قید شده است. در صورت هرگونه تردید، می‌توانید پیش از خرید با پشتیبانی فنی تماس بگیرید.',
    },
    {
      q: 'سفارش‌ها چگونه ارسال می‌شوند و چند روز کاری زمان می‌برد؟',
      a: 'سفارش‌های شهر تهران معمولاً در همان روز یا حداکثر ۲۴ ساعت آینده با پیک تحویل می‌گردند. برای سایر استان‌ها و شهرها، ارسال از طریق پست پیشتاز و تیپاکس ظرف ۲۴ الی ۴۸ ساعت کاری به نشانی شما انجام می‌شود.',
    },
    {
      q: 'آیا قطعات دارای ضمانت اصالت و سلامت هستند؟',
      a: 'بله، کلیه قطعات عرضه شده در یدک‌پارت دارای هولوگرام و لیبل شرکت‌های اصلی (ایساکو، سایپایدک، بوش، والئو، تکستار و ...) هستند و در صورت باز نشدن پلمپ و مغایرت فیزیکی، تا ۷ روز امکان عودت کالا وجود دارد.',
    },
    {
      q: 'اگر قطعه‌ای را در سایت پیدا نکردم چه کنم؟',
      a: 'به دلیل وسعت بالای بازار قطعات یدکی، ممکن است برخی قطعات کمیاب در سایت هنوز ثبت نشده باشند. با کارشناسان ما تماس بگیرید تا ظرف چند ساعت قطعه را از انبار همکاران برای شما استعلام و تأمین کنیم.',
    },
    {
      q: 'کد رهگیری پستی مرسوله را چگونه دریافت کنم؟',
      a: 'به محض آماده‌سازی و تحویل بسته به مأمور پست یا تیپاکس، کد رهگیری در صفحه پیگیری سفارش (/track-order) و همچنین بخش «سفارش‌های من» در حساب کاربری شما درج خواهد شد.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-zinc-950">سوالات متداول خریداران</h1>
        <p className="text-xs text-zinc-500">پاسخ به پرتکرارترین پرسش‌های کاربران درباره خرید و ارسال لوازم یدکی</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-right flex items-center justify-between font-bold text-xs sm:text-sm text-zinc-900 hover:text-amber-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-amber-500' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
