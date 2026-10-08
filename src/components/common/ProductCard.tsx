import React, { useState } from 'react';
import { ShoppingCart, Check, Car, Eye } from 'lucide-react';
import type { Product } from '../../types/index.ts';
import { formatPrice } from '../../utils/formatters.ts';
import { useCart } from '../../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addItem, selectedVehicle } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const isCompatibleWithSelected = selectedVehicle?.model
    ? product.compatibleModels?.some((m) => m.id === selectedVehicle.model?.id)
    : false;

  const currentPrice = product.discountPrice || product.sellingPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.sellingPrice - product.discountPrice!) / product.sellingPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onNavigate(`product/${product.slug}`)}
      className="group relative bg-white border border-zinc-200/80 hover:border-zinc-400 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col cursor-pointer"
    >
      {/* Compatibility Banner (if matched with garage car) */}
      {selectedVehicle?.model && isCompatibleWithSelected && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-1 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            سازگار با {selectedVehicle.model.modelName}
          </span>
          <Car className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            {discountPercent}٪ تخفیف
          </div>
        )}

        {/* Quick View Button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`product/${product.slug}`);
          }}
          className="absolute bottom-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 hover:bg-zinc-950"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>مشاهده جزئیات</span>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category & Brand */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
            <span>{product.brandName}</span>
            <span aria-hidden="true">·</span>
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-zinc-400">{product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Compatible cars count */}
          {product.compatibleModels && product.compatibleModels.length > 0 && (
            <p className="text-[11px] text-zinc-500 mt-2 line-clamp-1">
              مناسب: {product.compatibleModels.map((m) => m.modelName).slice(0, 2).join('، ')}
              {product.compatibleModels.length > 2 && ` و ${product.compatibleModels.length - 2} مدل دیگر`}
            </p>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            {hasDiscount && (
              <div className="text-[11px] text-zinc-400 line-through">
                {formatPrice(product.sellingPrice)}
              </div>
            )}
            <div className="text-xs sm:text-sm font-black text-zinc-950">
              {formatPrice(currentPrice)}
            </div>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 text-white active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ثبت شد</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">افزودن</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
              ناموجود
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
