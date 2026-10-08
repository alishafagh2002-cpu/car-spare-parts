import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  ShoppingCart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  Truck,
  PhoneCall,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { formatPrice } from '../../utils/formatters.ts';
import { VehicleSelectorModal } from './VehicleSelectorModal.tsx';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, subtotal, selectedVehicle } = useCart();

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetch(`/api/products/suggestions?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          })
          .catch(() => setSuggestions([]))
          .finally(() => setIsSearching(false));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate(`products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    onNavigate(`product/${slug}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-zinc-950 text-white shadow-md border-b border-zinc-800/80">
        {/* Top Info Bar */}
        <div className="bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 py-1.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                تضمین اصالت و ضمانت سلامت فیزیکی قطعات
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-400">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                ارسال اکسپرس به سراسر کشور
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:02188990011"
                className="hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3 text-amber-500" />
                پشتیبانی فنی: ۰۲۱-۸۸۹۹۰۰۱۱
              </a>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <button
                onClick={() => onNavigate('track-order')}
                className="hover:text-amber-400 transition-colors hidden sm:inline"
              >
                پیگیری وضعیت سفارش
              </button>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              aria-label="منو"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-right focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  یدک‌پارت
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-normal">
                    PRO
                  </span>
                </span>
                <span className="block text-[10px] text-zinc-400">بازارگاه تخصصی لوازم یدکی خودرو</span>
              </div>
            </button>
          </div>

          {/* Vehicle Selector (گاراژ من) */}
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className={`hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              selectedVehicle?.model
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <Car className={`w-4 h-4 ${selectedVehicle?.model ? 'text-amber-400' : 'text-zinc-400'}`} />
            <div className="text-right">
              <span className="block text-[10px] text-zinc-400">خودروی من:</span>
              <span className="font-bold">
                {selectedVehicle?.model
                  ? `${selectedVehicle.model.vehicleMake} - ${selectedVehicle.model.modelName}`
                  : 'انتخاب خودرو جهت فیلتر قطعات'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 mr-1" />
          </button>

          {/* Search Bar with autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="جستجوی نام قطعه، کد فنی SKU، برند یا خودرو..."
                className="w-full px-4 py-2.5 pr-10 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              {isSearching && (
                <div className="absolute left-3 top-2.5 text-[10px] text-zinc-500 animate-pulse">
                  در حال جستجو...
                </div>
              )}
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
                  <span>پیشنهادات مرتبط:</span>
                  <span className="text-amber-400">{suggestions.length} مورد</span>
                </div>
                <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.slug)}
                      className="w-full p-2.5 text-right flex items-center gap-3 hover:bg-zinc-800/80 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>کد: {item.sku}</span>
                          <span>·</span>
                          <span className="text-amber-400">{item.brand}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-amber-400 whitespace-nowrap">
                        {formatPrice(item.sellingPrice)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User & Cart CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-white transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 text-xs text-zinc-200 divide-y divide-zinc-800">
                      <div className="px-4 py-2.5">
                        <p className="font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.phone}</p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-right px-4 py-2 hover:bg-zinc-800 flex items-center gap-2 text-amber-400 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            پنل مدیریت ادمین
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onNavigate('account');
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-zinc-400" />
                          سفارش‌های من و حساب کاربری
                        </button>
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onNavigate('track-order');
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4 text-zinc-400" />
                          پیگیری سفارش
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          خروج از حساب
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">ورود / ثبت‌نام</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/10"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">سبد خرید</span>
              {itemCount > 0 ? (
                <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-zinc-950 text-amber-400 font-mono">
                  {itemCount}
                </span>
              ) : (
                <span className="text-[11px] opacity-75">۰</span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar (Desktop) */}
        <div className="hidden lg:block bg-zinc-900/60 border-t border-zinc-800/60 px-8 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-6 text-zinc-300">
              <button
                onClick={() => onNavigate('home')}
                className={`hover:text-amber-400 transition-colors ${currentRoute === 'home' ? 'text-amber-400 font-semibold' : ''}`}
              >
                صفحه اصلی
              </button>
              <button
                onClick={() => onNavigate('products')}
                className={`hover:text-amber-400 transition-colors ${currentRoute === 'products' ? 'text-amber-400 font-semibold' : ''}`}
              >
                فروشگاه و تمام قطعات
              </button>
              <button
                onClick={() => onNavigate('products?category=cat_brakes')}
                className="hover:text-amber-400 transition-colors"
              >
                لنت و ترمز
              </button>
              <button
                onClick={() => onNavigate('products?category=cat_engine')}
                className="hover:text-amber-400 transition-colors"
              >
                موتور و شمع
              </button>
              <button
                onClick={() => onNavigate('products?category=cat_filters')}
                className="hover:text-amber-400 transition-colors"
              >
                انواع فیلترها
              </button>
              <button
                onClick={() => onNavigate('products?category=cat_suspension')}
                className="hover:text-amber-400 transition-colors"
              >
                جلوبندی و کمک‌فنر
              </button>
              <button
                onClick={() => onNavigate('products?category=cat_oils')}
                className="hover:text-amber-400 transition-colors"
              >
                روغن و سیالات
              </button>
              <button
                onClick={() => onNavigate('track-order')}
                className={`hover:text-amber-400 transition-colors ${currentRoute === 'track-order' ? 'text-amber-400 font-semibold' : ''}`}
              >
                سامانه پیگیری سفارش
              </button>
            </nav>

            <div className="text-[11px] text-zinc-400">
              {subtotal > 0 && (
                <span>
                  مبلغ سبد: <strong className="text-amber-400 font-mono">{formatPrice(subtotal)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-3 animate-fade-in text-xs">
            {/* Mobile Vehicle Selector */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsVehicleModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-right"
            >
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>
                  {selectedVehicle?.model
                    ? `${selectedVehicle.model.vehicleMake} - ${selectedVehicle.model.modelName}`
                    : 'انتخاب خودروی من (گاراژ)'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی قطعه، برند یا کد فنی..."
                className="w-full px-3 py-2.5 pr-9 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
            </form>

            <nav className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="p-2 text-right hover:text-amber-400"
              >
                صفحه اصلی
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('products');
                }}
                className="p-2 text-right hover:text-amber-400"
              >
                مشاهده تمام قطعات و محصولات
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('track-order');
                }}
                className="p-2 text-right hover:text-amber-400"
              >
                پیگیری سفارش با کد رهگیری
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="p-2 text-right text-amber-400 font-bold"
                >
                  ورود به پنل مدیریت ادمین
                </button>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('about');
                }}
                className="p-2 text-right text-zinc-400"
              >
                درباره ما و رویه خرید
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="p-2 text-right text-zinc-400"
              >
                تماس با پشتیبانی
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Vehicle Garage Modal */}
      <VehicleSelectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
      />
    </>
  );
};
