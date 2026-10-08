import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Product } from '../../types/index.ts';
import { formatPrice } from '../../utils/formatters.ts';

interface AdminProductsProps {
  onNavigateTab: (tab: string, param?: string) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onNavigateTab,
  onEditProduct,
}) => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadProducts = () => {
    setLoading(true);
    fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف محصول «${name}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionMsg({ type: 'success', text: `محصول «${name}» با موفقیت حذف شد.` });
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setActionMsg({ type: 'error', text: 'خطا در حذف محصول' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'خطای سرور' });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brandName && p.brandName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت محصولات، قیمت‌ها و حاشیه سود</h1>
          <p className="text-zinc-400 mt-1">
            {products.length} کالا ثبت شده است · قیمت خرید و سود فقط برای مدیران نمایش داده می‌شود
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('new-product')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام قطعه، کد فنی SKU یا برند..."
            className="w-full px-3.5 py-2.5 pr-9 bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">در حال بارگذاری کاتالوگ قطعات...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">محصولی با این مشخصات یافت نشد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/50">
                  <th className="py-3 px-4">تصویر و نام قطعه</th>
                  <th className="py-3 px-3">کد فنی SKU</th>
                  <th className="py-3 px-3">دسته‌بندی و برند</th>
                  <th className="py-3 px-3 text-zinc-300">قیمت خرید (تأمین)</th>
                  <th className="py-3 px-3 text-white">قیمت فروش</th>
                  <th className="py-3 px-3 text-amber-400">سود ناخالص</th>
                  <th className="py-3 px-3">موجودی</th>
                  <th className="py-3 px-3">وضعیت</th>
                  <th className="py-3 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filtered.map((p) => {
                  const profit = (p.sellingPrice || 0) - (p.purchasePrice || 0);
                  const margin = p.sellingPrice ? Math.round((profit / p.sellingPrice) * 100) : 0;
                  const isLowStock = p.stock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                          />
                          <div className="max-w-[200px] truncate">
                            <span className="font-bold text-white block truncate">{p.name}</span>
                            <span className="text-[10px] text-zinc-500 block truncate">
                              {p.compatibleModels?.map((m) => m.modelName).slice(0, 2).join('، ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono text-zinc-400">{p.sku}</td>

                      {/* Category & Brand */}
                      <td className="py-3 px-3">
                        <span className="block text-zinc-300 font-semibold">{p.categoryName}</span>
                        <span className="text-[10px] text-amber-400">{p.brandName}</span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 font-mono text-zinc-400">
                        {formatPrice(p.purchasePrice || 0)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {formatPrice(p.discountPrice || p.sellingPrice)}
                      </td>

                      {/* Profit & Margin */}
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-emerald-400 block">{formatPrice(profit)}</span>
                        <span className="text-[10px] text-zinc-400">مارجین: {margin}٪</span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold ${
                            isLowStock ? 'text-rose-400' : 'text-zinc-200'
                          }`}
                        >
                          {p.stock} عدد
                        </span>
                        {isLowStock && (
                          <span className="block text-[10px] text-rose-400 font-semibold">
                            کمبود موجودی!
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}
                        >
                          {p.status === 'active' ? 'فعال در فروشگاه' : 'غیرفعال'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                            title="ویرایش محصول"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="حذف محصول"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
