import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Car,
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import type { Product, Category, Brand } from '../types/index.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';
import { useCart } from '../context/CartContext.tsx';
import { VehicleSelectorModal } from '../components/common/VehicleSelectorModal.tsx';

interface ProductsPageProps {
  onNavigate: (route: string) => void;
  initialParams?: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, initialParams = '' }) => {
  const { selectedVehicle, setSelectedVehicle } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Parse initial query params
  useEffect(() => {
    const params = new URLSearchParams(initialParams);
    const cat = params.get('category');
    const brand = params.get('brand');
    const search = params.get('search');
    const featured = params.get('featured');
    const bestSeller = params.get('bestSeller');

    if (cat) setSelectedCategory(cat);
    if (brand) setSelectedBrand(brand);
    if (search) setSearchQuery(search);
    if (bestSeller) setSortOption('popular');
  }, [initialParams]);

  // Load categories and brands
  useEffect(() => {
    fetch('/api/vehicles/categories')
      .then((res) => res.json())
      .then((d) => setCategories(d.categories || []))
      .catch(console.error);

    fetch('/api/vehicles/brands')
      .then((res) => res.json())
      .then((d) => setBrands(d.brands || []))
      .catch(console.error);
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    let url = '/api/products?';

    if (selectedCategory) url += `category=${selectedCategory}&`;
    if (selectedBrand) url += `brand=${selectedBrand}&`;
    if (selectedVehicle?.model) url += `vehicleModelId=${selectedVehicle.model.id}&`;
    if (inStockOnly) url += `inStock=true&`;
    if (sortOption) url += `sort=${sortOption}&`;
    if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBrand, selectedVehicle, inStockOnly, sortOption, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setInStockOnly(false);
    setSearchQuery('');
    setSortOption('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">فروشگاه قطعات و لوازم یدکی خودرو</h1>
          <p className="text-xs text-zinc-500 mt-1">
            {products.length} کالا در حال حاضر موجود است
          </p>
        </div>

        {/* Selected vehicle active filter pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
              selectedVehicle?.model
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-900'
                : 'bg-white border-zinc-300 hover:border-zinc-400 text-zinc-700'
            }`}
          >
            <Car className="w-4 h-4 text-amber-500" />
            <span>
              {selectedVehicle?.model
                ? `فیلتر خودرو: ${selectedVehicle.model.vehicleMake} ${selectedVehicle.model.modelName}`
                : 'فیلتر بر اساس مدل خودرو (انتخاب)'}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {selectedVehicle?.model && (
            <button
              onClick={() => setSelectedVehicle(null)}
              className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100"
              title="حذف فیلتر خودرو"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden px-3 py-2 bg-zinc-900 text-white rounded-xl text-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترها</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <span className="font-bold text-sm text-zinc-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-600" />
              فیلترهای پیشرفته
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              پاکسازی
            </button>
          </div>

          {/* Search inside catalog */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">جستجو در نتایج:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام کالا، برند یا کد فنی..."
                className="w-full px-3 py-2 pr-9 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* In Stock Only */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span>فقط کالاهای موجود در انبار</span>
            </label>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-2.5">دسته‌بندی‌ها:</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`w-full text-right px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedCategory === '' ? 'bg-amber-500/10 text-amber-900 font-bold' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>همه دسته‌ها</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-right px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === c.id
                      ? 'bg-amber-500/10 text-amber-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.productCount !== undefined && (
                    <span className="text-[10px] text-zinc-400 font-mono">({c.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-2.5">برند قطعه:</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedBrand('')}
                className={`w-full text-right px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedBrand === '' ? 'bg-amber-500/10 text-amber-900 font-bold' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <span>همه برندها</span>
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrand(b.id)}
                  className={`w-full text-right px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedBrand === b.id
                      ? 'bg-amber-500/10 text-amber-900 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <span>{b.name}</span>
                  <span className="text-[10px] text-zinc-400">{b.country}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid & Sort Header */}
        <div className="md:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="bg-white p-3 border border-zinc-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-600">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <span>مرتب‌سازی بر اساس:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'newest', label: 'جدیدترین' },
                { id: 'price_asc', label: 'ارزان‌ترین' },
                { id: 'price_desc', label: 'گران‌ترین' },
                { id: 'popular', label: 'محبوب‌ترین / پرفروش' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortOption(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    sortOption === tab.id
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 mt-3">در حال جستجو و دریافت قطعات...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-zinc-300 rounded-3xl space-y-4">
              <Car className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="text-base font-bold text-zinc-800">هیچ قطعه‌ای مطابق با فیلترها یافت نشد</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                ممکن است برای خودروی انتخابی یا دسته‌بندی مشخص شده کالایی موجود نباشد. لطفاً فیلترها را ریست کنید یا مدل خودرو را تغییر دهید.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs"
              >
                پاکسازی تمام فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Garage Modal */}
      <VehicleSelectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
      />
    </div>
  );
};
