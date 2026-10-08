import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Layers,
  Wrench,
  Disc,
  Filter,
  Thermometer,
  Zap,
  Droplet,
  Cog,
} from 'lucide-react';
import type { Product, Category, Vehicle } from '../types/index.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { useCart } from '../context/CartContext.tsx';
import { VehicleSelectorModal } from '../components/common/VehicleSelectorModal.tsx';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { setSelectedVehicle } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hero Quick Finder states
  const [quickMake, setQuickMake] = useState('');
  const [quickModels, setQuickModels] = useState<any[]>([]);
  const [quickModelId, setQuickModelId] = useState('');
  const [quickCategory, setQuickCategory] = useState('');

  useEffect(() => {
    // Fetch featured
    fetch('/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.products?.slice(0, 8) || []))
      .catch(console.error);

    // Fetch best sellers
    fetch('/api/products?bestSeller=true')
      .then((res) => res.json())
      .then((data) => setBestSellers(data.products?.slice(0, 8) || []))
      .catch(console.error);

    // Fetch categories
    fetch('/api/vehicles/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);

    // Fetch vehicles
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(console.error);
  }, []);

  // When quick make changes in hero, fetch models
  useEffect(() => {
    if (quickMake) {
      fetch('/api/vehicles/models')
        .then((res) => res.json())
        .then((data) => {
          const filtered = (data.models || []).filter((m: any) => m.vehicleMake === quickMake);
          setQuickModels(filtered);
        })
        .catch(console.error);
    } else {
      setQuickModels([]);
      setQuickModelId('');
    }
  }, [quickMake]);

  const handleHeroQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let url = 'products?';
    if (quickModelId) url += `vehicleModelId=${quickModelId}&`;
    if (quickCategory) url += `category=${quickCategory}&`;
    onNavigate(url);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'brakes':
        return <Disc className="w-5 h-5 text-amber-500" />;
      case 'engine':
        return <Cog className="w-5 h-5 text-amber-500" />;
      case 'filters':
        return <Filter className="w-5 h-5 text-amber-500" />;
      case 'suspension':
        return <Layers className="w-5 h-5 text-amber-500" />;
      case 'cooling':
        return <Thermometer className="w-5 h-5 text-amber-500" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'oils':
        return <Droplet className="w-5 h-5 text-amber-500" />;
      default:
        return <Wrench className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-14 sm:py-20 border-b border-zinc-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>سامانه هوشمند تطابق و تأمین قطعات یدکی خودرو</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-snug">
                لوازم یدکی خودرو با <span className="text-amber-500">قیمت مناسب</span> و تضمین اصالت
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                قطعات مورد نیاز خودروی خود را سریع و مطمئن پیدا کنید. تأمین مستقیم از واردکنندگان و بنکداران معتبر بازار، با قیمت رقابتی، ارسال فوق‌سریع و ضمانت تطابق ۱۰۰ درصدی با خودروی شما.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('products')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>مشاهده همه محصولات</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>انتخاب خودرو و فیلتر قطعات</span>
                </button>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>بیش از ۵,۰۰۰ قطعه موجود</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ضمانت اصالت قطعات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>پیگیری لحظه‌ای سفارش</span>
                </div>
              </div>
            </div>

            {/* Quick Part Finder Card */}
            <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">جستجوی سریع قطعه سازگار</h3>
                  <p className="text-[11px] text-zinc-400">انتخاب خودرو و دسته برای نمایش فوری</p>
                </div>
              </div>

              <form onSubmit={handleHeroQuickSearch} className="space-y-4">
                {/* 1. Brand / Make */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    ۱. برند خودروساز:
                  </label>
                  <select
                    value={quickMake}
                    onChange={(e) => setQuickMake(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- انتخاب خودروساز (پژو، سایپا، ...) --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.make}>
                        {v.make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Model */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    ۲. مدل یا تیپ خودرو:
                  </label>
                  <select
                    value={quickModelId}
                    onChange={(e) => setQuickModelId(e.target.value)}
                    disabled={!quickMake}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white disabled:opacity-50 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- همه مدل‌های این خودروساز --</option>
                    {quickModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.modelName} ({m.yearStart} تا {m.yearEnd})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Category */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    ۳. دسته‌بندی قطعه (اختیاری):
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- همه قطعات و دسته‌ها --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md mt-2"
                >
                  <Search className="w-4 h-4" />
                  <span>جستجو و مشاهده قطعات</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900">دسته‌بندی‌های اصلی لوازم یدکی</h2>
            <p className="text-xs text-zinc-500 mt-1">انتخاب قطعه بر اساس بخش‌های فنی و مصرفی خودرو</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`products?category=${cat.id}`)}
              className="group p-4 bg-white border border-zinc-200 hover:border-amber-500 rounded-2xl text-right transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 group-hover:bg-amber-500/10 flex items-center justify-center mb-3 transition-colors">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  {cat.productCount ? `${cat.productCount} قطعه` : 'تنوع قطعات'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Parts Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900">محصولات ویژه و تخفیف‌دار</h2>
              <p className="text-xs text-zinc-500 mt-0.5">قطعات مصرفی با قیمت رقابتی و بیشترین حاشیه تخفیف</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products?featured=true')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>مشاهده بیشتر</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Car Brand Selector Section (Interactive Garage) */}
      <section className="bg-zinc-900 text-white py-12 px-4 sm:px-8 rounded-3xl max-w-7xl mx-auto my-8 border border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              انتخاب بر اساس خودرو
            </span>
            <h2 className="text-xl sm:text-2xl font-black">خودروی شما چیست؟</h2>
            <p className="text-xs text-zinc-400 mt-1">
              با انتخاب مدل خودرو، تمام قطعات ناسازگار به طور خودکار فیلتر می‌شوند
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <Car className="w-4 h-4" />
            <span>باز کردن پنجره انتخاب خودرو</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVehicle({ make: v.make, model: null });
                onNavigate('products');
              }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/60 text-center transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-amber-400 transition-colors">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300">
                {v.make}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{v.country}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900">پرفروش‌ترین قطعات بازار</h2>
              <p className="text-xs text-zinc-500 mt-0.5">قطعات مصرفی دارای بیشترین تقاضا در این ماه</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('products?bestSeller=true')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* How It Works (Sourcing / Dropshipping Transparency) */}
      <section className="bg-zinc-100 py-12 px-4 sm:px-8 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-600">فرآیند شفاف خرید و ارسال</span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-1">
              سفارش شما چگونه تأمین و ارسال می‌شود؟
            </h2>
            <p className="text-xs text-zinc-600 mt-2">
              ما به عنوان بازارگاه تخصصی، بهترین قطعات اصل را مستقیماً از بنکداران و واردکنندگان تهیه و با بسته‌بندی ایمن برای شما ارسال می‌کنیم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-right">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm mb-4">
                ۱
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1.5">انتخاب و ثبت سفارش</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                قطعه را بر اساس خودرو یا کد فنی انتخاب کرده و سفارش را به صورت آنلاین ثبت می‌کنید.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-right">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm mb-4">
                ۲
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1.5">تأمین مستقیم و بازرسی</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                قطعه فورا از تأمین‌کننده رسمی خریداری و کارشناسان ما اصالت فیزیکی و هولوگرام آن را تایید می‌کنند.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-right">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm mb-4">
                ۳
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1.5">بسته‌بندی ایمن و ارسال</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                کالا با محافظ ضدضربه بسته‌بندی شده و با کد رهگیری پستی یا تیپاکس به آدرس شما ارسال می‌شود.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-right">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm mb-4">
                ۴
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1.5">پیگیری شفاف تا تحویل</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                در تمام مراحل می‌توانید وضعیت سفارش خود را در سامانه پیگیری سفارش سایت مشاهده کنید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Garage Modal */}
      <VehicleSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
