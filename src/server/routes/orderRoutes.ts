import { Router } from 'express';
import { db } from '../db.ts';
import { optionalAuth, requireAuth, requireAdmin, type AuthenticatedRequest } from '../auth.ts';
import type { OrderStatus } from '../../types/index.ts';

const router = Router();

// POST /api/orders - Create new order from checkout
router.post('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      province,
      city,
      address,
      unit,
      postalCode,
      notes,
      shippingMethod,
      items,
      couponCode,
      paymentMethod,
    } = req.body;

    if (!customerName || !customerPhone || !province || !city || !address || !postalCode) {
      return res.status(400).json({ error: 'لطفاً تمامی فیلدهای الزامی آدرس و مشخصات را تکمیل فرمایید.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'سبد خرید شما خالی است.' });
    }

    // Verify stock and compute subtotal
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const product = db.getProductByIdOrSlug(item.productId);
      if (!product) {
        throw new Error(`کالای ${item.productId} در انبار یافت نشد.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`موجودی کالای «${product.name}» کافی نیست (موجود در انبار: ${product.stock} عدد).`);
      }
      const unitPrice = product.discountPrice || product.sellingPrice;
      const totalItemPrice = unitPrice * item.quantity;
      subtotal += totalItemPrice;

      return {
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId: '',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        quantity: item.quantity,
        sellingPrice: unitPrice,
        totalPrice: totalItemPrice,
      };
    });

    const settings = db.getSettings();
    let shippingFee = shippingMethod === 'express' ? settings.expressShippingFee : settings.standardShippingFee;
    if (subtotal >= settings.freeShippingThreshold && shippingMethod !== 'express') {
      shippingFee = 0;
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.findDiscountByCode(couponCode);
      if (coupon && coupon.status === 'active') {
        if (coupon.type === 'percent') {
          discountAmount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.value;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const userId = req.user?.id || 'guest_user';

    const order = db.createOrder({
      userId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      province: province.trim(),
      city: city.trim(),
      address: address.trim(),
      unit: unit ? unit.trim() : '',
      postalCode: postalCode.trim(),
      notes: notes ? notes.trim() : '',
      shippingMethod: shippingMethod || 'standard',
      shippingFee,
      discountAmount,
      couponCode: couponCode || undefined,
      subtotal,
      totalAmount,
      paymentMethod: paymentMethod || 'online',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      items: validatedItems,
    });

    // Clear cart if user has a cart
    const cartId = req.user?.id || req.body.sessionId;
    if (cartId) {
      db.clearCart(cartId);
    }

    res.status(201).json({
      message: 'سفارش با موفقیت ایجاد شد.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'خطا در ثبت سفارش' });
  }
});

// GET /api/orders/track - Public track order by orderNumber + phone
router.get('/track', (req, res) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: 'شماره سفارش و شماره موبایل الزامی است.' });
  }

  const order = db.getOrderByTracking(orderNumber as string, phone as string);
  if (!order) {
    return res.status(404).json({ error: 'سفارشی با این شماره سفارش و شماره موبایل یافت نشد.' });
  }

  // Sanitize purchasePrice for security
  const safeOrder = {
    ...order,
    totalCost: undefined,
    totalProfit: undefined,
    items: order.items.map((i) => ({ ...i, purchasePrice: undefined })),
  };

  res.json({ order: safeOrder });
});

// GET /api/orders/my-orders - Authenticated customer's orders
router.get('/my-orders', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'عدم دسترسی' });

  const orders = db.getOrders({ userId: req.user.id });
  const safeOrders = orders.map((o) => ({
    ...o,
    totalCost: undefined,
    totalProfit: undefined,
    items: o.items.map((i) => ({ ...i, purchasePrice: undefined })),
  }));

  res.json({ orders: safeOrders });
});

// GET /api/orders/:id - Single order details
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'سفارش یافت نشد' });

  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
  if (!isAdmin && req.user?.id !== order.userId) {
    // Only owner or admin can view
    return res.status(403).json({ error: 'عدم دسترسی به این سفارش' });
  }

  if (!isAdmin) {
    const safeOrder = {
      ...order,
      totalCost: undefined,
      totalProfit: undefined,
      items: order.items.map((i) => ({ ...i, purchasePrice: undefined })),
    };
    return res.json({ order: safeOrder });
  }

  res.json({ order });
});

// Admin: GET /api/orders - List all orders with filters
router.get('/', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status, search } = req.query;
  const orders = db.getOrders({
    status: status as OrderStatus,
    search: search as string,
  });
  res.json({ orders, count: orders.length });
});

// Admin: PUT /api/orders/:id/status - Update order status (dropshipping workflow)
router.put('/:id/status', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status, trackingCode } = req.body;
  if (!status) return res.status(400).json({ error: 'وضعیت جدید سفارش الزامی است.' });

  const validStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'sourcing',
    'purchased',
    'preparing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'وضعیت سفارش نامعتبر است.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status, trackingCode, req.user?.id);
  if (!updated) {
    return res.status(404).json({ error: 'سفارش یافت نشد.' });
  }

  res.json({ message: 'وضعیت سفارش با موفقیت بروز شد.', order: updated });
});

export default router;
