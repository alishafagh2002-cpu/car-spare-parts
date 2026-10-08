import { Router } from 'express';
import { db } from '../db.ts';
import { optionalAuth, requireAdmin, type AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/cart
router.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const identifier = req.user?.id || (req.query.sessionId as string) || 'guest';
  const items = db.getCart(identifier);
  res.json({ items });
});

// POST /api/cart
router.post('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const identifier = req.user?.id || req.body.sessionId || 'guest';
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'آیتم‌ها باید آرایه باشند.' });
  }
  db.setCart(identifier, items);
  res.json({ message: 'سبد خرید ذخیره شد.', items });
});

// DELETE /api/cart
router.delete('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const identifier = req.user?.id || (req.query.sessionId as string) || 'guest';
  db.clearCart(identifier);
  res.json({ message: 'سبد خرید خالی شد.' });
});

// Coupon validation
router.post('/validate-coupon', (req, res) => {
  const { code, cartAmount } = req.body;
  if (!code) return res.status(400).json({ error: 'کد تخفیف را وارد کنید.' });

  const coupon = db.findDiscountByCode(code);
  if (!coupon || coupon.status !== 'active') {
    return res.status(404).json({ error: 'کد تخفیف نامعتبر یا منقضی شده است.' });
  }

  const now = new Date();
  if (new Date(coupon.validUntil) < now) {
    return res.status(400).json({ error: 'مهلت استفاده از این کد تخفیف به پایان رسیده است.' });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'سقف استفاده از این کد تخفیف تکمیل شده است.' });
  }

  const amount = Number(cartAmount) || 0;
  if (amount < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `حداقل مبلغ سفارش برای اعمال این کد تخفیف ${coupon.minOrderAmount.toLocaleString('fa-IR')} تومان است.`,
    });
  }

  let discountAmount = 0;
  if (coupon.type === 'percent') {
    discountAmount = Math.round((amount * coupon.value) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.value;
  }

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    message: `کد تخفیف اعمال شد (${discountAmount.toLocaleString('fa-IR')} تومان تخفیف)`,
  });
});

// Admin: GET /api/cart/coupons
router.get('/coupons', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ coupons: db.getDiscounts() });
});

// Admin: POST /api/cart/coupons
router.post('/coupons', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { code, type, value, minOrderAmount, maxDiscount, usageLimit, validUntil, status } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'کد و مقدار تخفیف الزامی است.' });
  }

  const newCoupon = db.addDiscount({
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    usageLimit: Number(usageLimit) || 100,
    validFrom: new Date().toISOString(),
    validUntil: validUntil || '2026-12-31T23:59:59Z',
    status: status || 'active',
  });

  res.status(201).json({ coupon: newCoupon });
});

// Admin: DELETE /api/cart/coupons/:id
router.delete('/coupons/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const ok = db.deleteDiscount(req.params.id);
  if (!ok) return res.status(404).json({ error: 'کوپن یافت نشد' });
  res.json({ message: 'کوپن حذف شد' });
});

export default router;
