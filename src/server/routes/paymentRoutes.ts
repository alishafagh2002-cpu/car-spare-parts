import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

// POST /api/payments/verify - Mock payment gateway processor
router.post('/verify', (req, res) => {
  try {
    const { orderId, success, refNumber } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'شناسه سفارش الزامی است.' });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'سفارش یافت نشد.' });
    }

    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const reference = refNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    if (success) {
      const payment = db.createPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        gateway: 'درگاه پرداخت شاپرک (شبیه‌ساز تستی)',
        transactionId: txnId,
        refNumber: reference,
        status: 'paid',
        paidAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'پرداخت با موفقیت انجام شد و سفارش تایید گردید.',
        transactionId: txnId,
        refNumber: reference,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } else {
      // Failed payment
      const payment = db.createPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        gateway: 'درگاه پرداخت شاپرک (شبیه‌ساز تستی)',
        transactionId: txnId,
        refNumber: reference,
        status: 'failed',
      });

      return res.json({
        success: false,
        message: 'تراکنش توسط کاربر یا بانک لغو شد یا ناموفق بود.',
        transactionId: txnId,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'خطای سرور در پردازش پرداخت' });
  }
});

export default router;
