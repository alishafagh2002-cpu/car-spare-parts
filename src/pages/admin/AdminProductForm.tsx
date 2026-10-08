import React, { useState, useEffect } from 'react';
import {
  Package,
  Save,
  ArrowRight,
  AlertTriangle,
  Plus,
  Trash2,
  Car,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Product, Category, Brand, VehicleModel } from '../../types/index.ts';
import { formatPrice } from '../../utils/formatters.ts';

interface AdminProductFormProps {
  productToEdit?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productToEdit,
  onSuccess,
  onCancel,
}) => {
  const { token } = useAuth();
  const isEditing = !!productToEdit;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  // Form Fields
  const [name, setName] = useState(productToEdit?.name || '');
  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [brandId, setBrandId] = useState(productToEdit?.brandId || '');
  const [categoryId, setCategoryId] = useState(productToEdit?.categoryId || '');
  const [shortDescription, setShortDescription] = useState(productToEdit?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(productToEdit?.fullDescription || '');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(productToEdit?.purchasePrice || '');
  const [sellingPrice, setSellingPrice] = useState<number | ''>(productToEdit?.sellingPrice || '');
  const [discountPrice, setDiscountPrice] = useState<number | ''>(productToEdit?.discountPrice || '');
  const [stock, setStock] = useState<number | ''>(productToEdit?.stock ?? 10);
  const [minStock, setMinStock] = useState<number | ''>(productToEdit?.minStock ?? 3);
  const [status, setStatus] = useState<'active' | 'inactive'>(productToEdit?.status || 'active');
  const [isFeatured, setIsFeatured] = useState<boolean>(productToEdit?.isFeatured || false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(productToEdit?.isBestSeller || false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.images?.[0] || 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80');

  // Multi vehicle selection
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
    productToEdit?.compatibleModels?.map((m) => m.id) || []
  );

  // Specifications key-value pairs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    productToEdit?.specs || [
      { key: 'موقعیت نصب', value: 'چرخ جلو' },
      { key: 'کشور سازنده', value: 'ایران' },
    ]
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/vehicles/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));

    fetch('/api/vehicles/brands')
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []));

    fetch('/api/vehicles/models')
      .then((r) => r.json())
      .then((d) => setVehicleModels(d.models || []));
  }, []);

  // Compute live profit and margin
  const pPrice = Number(purchasePrice) || 0;
  const sPrice = Number(sellingPrice) || 0;
  const profit = sPrice - pPrice;
  const profitMargin = sPrice > 0 ? Math.round((profit / sPrice) * 100) : 0;
  const isLoss = sPrice > 0 && pPrice > 0 && sPrice < pPrice;

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', text: string) => {
    const updated = [...specs];
    updated[index][field] = text;
    setSpecs(updated);
  };

  const handleToggleModel = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId));
    } else {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !sku || !brandId || !categoryId || !sellingPrice) {
      setErrorMsg('لطفاً فیلدهای الزامی نام، کد فنی، برند، دسته‌بندی و قیمت فروش را تکمیل فرمایید.');
      return;
    }

    if (isLoss) {
      setErrorMsg('خطای تجاری: قیمت فروش نمی‌تواند کمتر از قیمت خرید (تأمین) باشد!');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      sku,
      brandId,
      categoryId,
      shortDescription,
      fullDescription,
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5,
      status,
      isFeatured,
      isBestSeller,
      images: [imageUrl],
      specs: specs.filter((s) => s.key.trim() && s.value.trim()),
      compatibleModelIds: selectedModelIds,
    };

    try {
      const url = isEditing ? `/api/products/${productToEdit.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطا در ثبت محصول');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ذخیره‌سازی محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs text-zinc-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-black text-white">
            {isEditing ? `ویرایش محصول: ${productToEdit.name}` : 'ثبت قطعه و محصول جدید'}
          </h1>
          <p className="text-zinc-400 mt-0.5">مشخصات فنی، قیمت خرید و فروش و سازگاری با مدل خودروها</p>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>انصراف</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/50 rounded-2xl flex items-center gap-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            ۱. اطلاعات پایه محصول
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                نام قطعه: <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: لنت ترمز جلو تکستار مدل پژو ۴۰۵"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                کد فنی / SKU: <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="مثال: BP-TXT-405F"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                دسته‌بندی قطعه: <span className="text-amber-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- انتخاب دسته‌بندی --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                برند قطعه: <span className="text-amber-500">*</span>
              </label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- انتخاب برند --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.country})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">توضیح کوتاه (معرفی سریع):</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="یک جمله خلاصه درباره ویژگی و اصالت کالا..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">توضیحات کامل و راهنمای نصب:</label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="توضیحات تفصیلی، نحوه تعویض و استانداردهای کیفی..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Profit Margins */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
            <span>۲. قیمت‌گذاری و محاسبه هوشمند حاشیه سود</span>
            <span className="text-[11px] text-amber-400 font-normal">قیمت خرید برای مشتری پنهان است</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                قیمت خرید از تأمین‌کننده (تومان):
              </label>
              <input
                type="number"
                dir="ltr"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="1000000"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                قیمت فروش به مشتری (تومان): <span className="text-amber-500">*</span>
              </label>
              <input
                type="number"
                dir="ltr"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="1250000"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                قیمت تخفیف‌دار فروش (اختیاری):
              </label>
              <input
                type="number"
                dir="ltr"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="1190000"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live Profit Margin Calculator Alert */}
          {sPrice > 0 && pPrice > 0 && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between font-mono ${
                isLoss
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-zinc-950 border-amber-500/40 text-amber-400'
              }`}
            >
              <div>
                <span className="block text-xs font-sans text-zinc-400">سود شما در هر عدد قطعه:</span>
                <span className="text-base font-bold">
                  {isLoss ? 'زیان‌ده!' : formatPrice(profit)}
                </span>
              </div>
              <div className="text-left">
                <span className="block text-xs font-sans text-zinc-400">درصد حاشیه سود (مارجین):</span>
                <span className="text-base font-bold">{profitMargin}٪</span>
              </div>
            </div>
          )}

          {isLoss && (
            <p className="text-rose-400 text-[11px] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              هشدار: قیمت فروش کمتر از قیمت خرید تعیین شده است و سیستم اجازه ثبت نخواهد داد.
            </p>
          )}

          {/* Inventory & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">موجودی فعلی در انبار:</label>
              <input
                type="number"
                dir="ltr"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="20"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">حداقل موجودی هشدار (نقطه سفارش):</label>
              <input
                type="number"
                dir="ltr"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="5"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vehicle Compatibility Multi-Select */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" />
              ۳. انتخاب خودروهای کاملاً سازگار با این قطعه
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {selectedModelIds.length} مدل انتخاب شده
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {vehicleModels.map((m) => {
              const isChecked = selectedModelIds.includes(m.id);
              return (
                <label
                  key={m.id}
                  className={`p-2.5 rounded-xl border text-right cursor-pointer transition-colors flex items-center justify-between ${
                    isChecked
                      ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="block text-xs truncate">{m.modelName}</span>
                    <span className="text-[10px] text-zinc-500">{m.vehicleMake}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleModel(m.id)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Specifications Builder & Image */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
            ۴. تصویر محصول و مشخصات فنی
          </h2>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">آدرس اینترنتی تصویر (Image URL):</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500 text-left"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">جدول مشخصات فنی (ویژگی و مقدار):</span>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن ردیف
              </button>
            </div>

            {specs.map((s, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={s.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  placeholder="عنوان مشخصه (مثلاً: موقعیت)"
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs"
                />
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  placeholder="مقدار (مثلاً: چرخ جلو)"
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-2 text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span className="font-semibold text-white">فعال و قابل نمایش در فروشگاه</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span className="text-zinc-300">نمایش در محصولات ویژه</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span className="text-zinc-300">نمایش در پرفروش‌ترین‌ها</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading || isLoss}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'در حال ذخیره‌سازی...' : isEditing ? 'ذخیره تغییرات محصول' : 'ثبت و انتشار محصول'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
