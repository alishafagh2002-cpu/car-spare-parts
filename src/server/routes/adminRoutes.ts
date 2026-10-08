import { Router } from 'express';
import { db } from '../db.ts';
import { requireAdmin, type AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/admin/dashboard - Core statistics and charts
router.get('/dashboard', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const stats = db.getAdminDashboardStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'خطا در بارگذاری اطلاعات داشبورد' });
  }
});

// GET /api/admin/customers - Customer overview
router.get('/customers', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const customers = db.getCustomersSummary();
    res.json({ customers });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در بارگذاری مشتریان' });
  }
});

// GET /api/admin/notifications
router.get('/notifications', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ notifications: db.getNotifications() });
});

// PUT /api/admin/notifications/:id/read
router.put('/notifications/:id/read', requireAdmin, (req: AuthenticatedRequest, res) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

// GET /api/admin/logs
router.get('/logs', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ logs: db.getAdminLogs() });
});

// GET /api/admin/settings
router.get('/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ settings: db.getSettings() });
});

// PUT /api/admin/settings
router.put('/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ message: 'تنظیمات ذخیره شد.', settings: updated });
});

export default router;
