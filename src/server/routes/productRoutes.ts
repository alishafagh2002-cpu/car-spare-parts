import { Router } from 'express';
import { db } from '../db.ts';
import { optionalAuth, requireAdmin, type AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/products - list products with rich filtering
router.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    const {
      category,
      brand,
      vehicleModelId,
      search,
      minPrice,
      maxPrice,
      inStock,
      featured,
      bestSeller,
      sort,
    } = req.query;

    const products = db.getProducts({
      isAdmin,
      categoryId: category as string,
      brandId: brand as string,
      vehicleModelId: vehicleModelId as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStockOnly: inStock === 'true',
      featured: featured === 'true' ? true : undefined,
      bestSeller: bestSeller === 'true' ? true : undefined,
      sort: sort as any,
    });

    res.json({
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست کالاها' });
  }
});

// GET /api/products/suggestions - Fast search autocomplete
router.get('/suggestions', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const all = db.getProducts({ isAdmin: false });
    const matched = all
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brandName && p.brandName.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        sellingPrice: p.discountPrice || p.sellingPrice,
        image: p.images[0] || '',
        brand: p.brandName,
      }));

    res.json({ suggestions: matched });
  } catch (error: any) {
    res.status(500).json({ error: 'خطای سرچ' });
  }
});

// GET /api/products/:identifier - Single product details
router.get('/:identifier', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const product = db.getProductByIdOrSlug(req.params.identifier, isAdmin);

    if (!product) {
      return res.status(404).json({ error: 'محصول مورد نظر یافت نشد.' });
    }

    // Also get related products in same category
    const related = db
      .getProducts({ isAdmin, categoryId: product.categoryId })
      .filter((p) => p.id !== product.id)
      .slice(0, 4);

    res.json({ product, related });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت جزئیات محصول' });
  }
});

// Admin: POST /api/products - Create new product
router.post('/', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const {
      name,
      slug,
      sku,
      brandId,
      categoryId,
      shortDescription,
      fullDescription,
      purchasePrice,
      sellingPrice,
      discountPrice,
      stock,
      minStock,
      status,
      isFeatured,
      isBestSeller,
      images,
      specs,
      compatibleModelIds,
    } = req.body;

    if (!name || !sku || !brandId || !categoryId || !sellingPrice) {
      return res.status(400).json({ error: 'لطفاً نام، کد فنی، برند، دسته‌بندی و قیمت فروش را تکمیل کنید.' });
    }

    const pPrice = Number(purchasePrice) || 0;
    const sPrice = Number(sellingPrice) || 0;

    if (sPrice < pPrice) {
      return res.status(400).json({
        error: 'خطای تجاری: قیمت فروش نمی‌تواند کمتر از قیمت خرید (تأمین) باشد.',
      });
    }

    const generatedSlug = slug ? slug.trim() : name.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');

    const newProd = db.addProduct({
      name: name.trim(),
      slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
      sku: sku.trim().toUpperCase(),
      brandId,
      categoryId,
      shortDescription: shortDescription || '',
      fullDescription: fullDescription || '',
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5,
      status: status || 'active',
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'],
      specs: Array.isArray(specs) ? specs : [],
      compatibleModelIds: Array.isArray(compatibleModelIds) ? compatibleModelIds : [],
    });

    res.status(201).json({ message: 'محصول با موفقیت ثبت شد.', product: newProd });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'خطا در ثبت محصول جدید' });
  }
});

// Admin: PUT /api/products/:id - Update product
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (updates.sellingPrice !== undefined && updates.purchasePrice !== undefined) {
      if (Number(updates.sellingPrice) < Number(updates.purchasePrice)) {
        return res.status(400).json({ error: 'قیمت فروش نمی‌تواند کمتر از قیمت خرید باشد.' });
      }
    }

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'محصول یافت نشد.' });
    }

    res.json({ message: 'محصول با موفقیت بروزرسانی شد.', product: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در بروزرسانی محصول' });
  }
});

// Admin: DELETE /api/products/:id
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'محصول یافت نشد.' });
    }
    res.json({ message: 'محصول با موفقیت حذف شد.' });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در حذف محصول' });
  }
});

export default router;
