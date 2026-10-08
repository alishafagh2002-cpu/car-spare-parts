import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Car,
  ChevronLeft,
  ArrowRight,
  PackageCheck,
  Zap,
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatPrice } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { addItem, selectedVehicle } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.images[0] || '');
          setRelated(data.related || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 mt-4">در حال دریافت مشخصات قطعه...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-xl font-bold text-zinc-900">محصول مورد نظر یافت نشد</h2>
        <p className="text-xs text-zinc-500">ممکن است قطعه حذف شده یا آدرس را اشتباه وارد کرده باشید.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
        >
          بازگشت به لیست کالاها
        </button>
      </div>
    );
  }

  const isCompatibleWithSelected = selectedVehicle?.model
    ? product.compatibleModels?.some((m) => m.id === selectedVehicle.model?.id)
    : null;

  const currentPrice = product.discountPrice || product.sellingPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;

  const handleAddToCart = () => {
    if (product.stock >= quantity) {
      addItem(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product.stock >= quantity) {
      addItem(product, quantity);
      onNavigate('checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <button onClick={() => onNavigate('home')} className="hover:text-zinc-900">
          صفحه اصلی
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('products')} className="hover:text-zinc-900">
          قطعات خودرو
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate(`products?category=${product.categoryId}`)}
          className="hover:text-zinc-900"
        >
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-4/3 w-full bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-zinc-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees Box */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 text-xs text-zinc-600">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ضمانت اصالت فیزیکی و هولوگرام خط تولید</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ارسال ۲۴ الی ۴۸ ساعته از طریق پست پیشتاز و تیپاکس</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>امکان مرجوعی کالا در صورت عدم تطابق با خودرو</span>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Purchase (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* Metadata tags */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="font-semibold text-zinc-700">برند: {product.brandName}</span>
              <span>·</span>
              <span>دسته‌بندی: {product.categoryName}</span>
              <span>·</span>
              <span className="font-mono">کد فنی: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 leading-snug">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 mt-3 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Vehicle Match Banner if active */}
          {selectedVehicle?.model && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                isCompatibleWithSelected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>
                  خودروی شما ({selectedVehicle.model.vehicleMake} {selectedVehicle.model.modelName}):{' '}
                  {isCompatibleWithSelected ? 'کاملاً سازگار با این قطعه است' : 'این قطعه با خودروی شما سازگار نیست!'}
                </span>
              </div>
            </div>
          )}

          {/* Price & Stock Box */}
          <div className="p-5 bg-zinc-900 text-white rounded-2xl space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">قیمت نهایی قطعه:</span>
                {hasDiscount && (
                  <span className="text-xs text-zinc-400 line-through block">
                    {formatPrice(product.sellingPrice)}
                  </span>
                )}
                <span className="text-2xl font-black text-amber-400">
                  {formatPrice(currentPrice)}
                </span>
              </div>

              <div className="text-right">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <PackageCheck className="w-3.5 h-3.5" />
                    موجود در انبار ({product.stock} عدد)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold">
                    ناموجود در انبار
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Action Buttons */}
            {product.stock > 0 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-zinc-700 rounded-xl bg-zinc-950 p-1 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex-1 w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>به سبد خرید اضافه شد</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>افزودن به سبد خرید</span>
                    </>
                  )}
                </button>

                {/* Buy now direct */}
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>خرید سریع</span>
                </button>
              </div>
            )}
          </div>

          {/* Compatible Vehicles List */}
          {product.compatibleModels && product.compatibleModels.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-zinc-900 mb-2.5 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-600" />
                خودروهای کاملاً سازگار با این قطعه:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.compatibleModels.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-zinc-800">{m.vehicleMake} {m.modelName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {m.yearStart} - {m.yearEnd}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="pt-4 border-t border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-900 mb-3">مشخصات فنی و استانداردهای قطعه:</h3>
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 text-xs">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <span className="text-zinc-500">{spec.key}</span>
                    <span className="font-semibold text-zinc-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="pt-4 border-t border-zinc-200">
            <h3 className="text-xs font-bold text-zinc-900 mb-2">توضیحات و راهنمای نصب:</h3>
            <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-zinc-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-zinc-900">سایر قطعات این دسته‌بندی</h2>
            <button
              onClick={() => onNavigate(`products?category=${product.categoryId}`)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
