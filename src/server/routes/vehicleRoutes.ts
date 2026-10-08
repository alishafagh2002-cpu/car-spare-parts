import { Router } from 'express';
import { db } from '../db.ts';
import { requireAdmin, type AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/vehicles - list makes
router.get('/', (req, res) => {
  res.json({ vehicles: db.getVehicles() });
});

// GET /api/vehicles/models - list models
router.get('/models', (req, res) => {
  const vehicleId = req.query.vehicleId as string;
  const models = db.getVehicleModels(vehicleId);
  res.json({ models });
});

// GET /api/categories
router.get('/categories', (req, res) => {
  res.json({ categories: db.getCategories() });
});

// Admin: POST /api/categories
router.post('/categories', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { name, slug, icon, description } = req.body;
  if (!name) return res.status(400).json({ error: 'نام دسته الزامی است' });
  const cat = db.addCategory({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    icon: icon || 'Tag',
    description: description || '',
  });
  res.status(201).json({ category: cat });
});

// Admin: DELETE /api/categories/:id
router.delete('/categories/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const ok = db.deleteCategory(req.params.id);
  if (!ok) return res.status(404).json({ error: 'دسته‌بندی یافت نشد' });
  res.json({ message: 'دسته حذف شد' });
});

// GET /api/brands
router.get('/brands', (req, res) => {
  res.json({ brands: db.getBrands() });
});

// Admin: POST /api/brands
router.post('/brands', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { name, slug, logo, country } = req.body;
  if (!name) return res.status(400).json({ error: 'نام برند الزامی است' });
  const brand = db.addBrand({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    logo: logo || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=120&q=80',
    country: country || 'ایران',
  });
  res.status(201).json({ brand });
});

// Admin: DELETE /api/brands/:id
router.delete('/brands/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const ok = db.deleteBrand(req.params.id);
  if (!ok) return res.status(404).json({ error: 'برند یافت نشد' });
  res.json({ message: 'برند حذف شد' });
});

export default router;
