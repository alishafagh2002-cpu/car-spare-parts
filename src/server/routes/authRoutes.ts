import { Router } from 'express';
import { db, generateId } from '../db.ts';
import { hashPassword, comparePassword, generateToken, requireAuth, type AuthenticatedRequest } from '../auth.ts';

const router = Router();

// Register new user
router.post('/register', (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'نام، شماره موبایل و رمز عبور الزامی است.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
    }

    // Check duplicate phone or email
    const existing = db.findUserByEmailOrPhone(phone) || (email ? db.findUserByEmailOrPhone(email) : null);
    if (existing) {
      return res.status(400).json({ error: 'کاربری با این شماره موبایل یا ایمیل قبلاً ثبت‌نام کرده است.' });
    }

    const now = new Date().toISOString();
    const newUser = db.createUser({
      id: generateId('usr'),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : `${phone.trim()}@yadakpart.ir`,
      passwordHash: hashPassword(password),
      role: 'customer',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const token = generateToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'ثبت‌نام با موفقیت انجام شد.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'لطفاً شماره موبایل/ایمیل و رمز عبور را وارد کنید.' });
    }

    const user = db.findUserByEmailOrPhone(identifier);
    if (!user) {
      return res.status(401).json({ error: 'کاربری با این مشخصات یافت نشد.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'حساب کاربری شما مسدود شده است.' });
    }

    const match = comparePassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'رمز عبور وارد شده نادرست است.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'ورود موفقیت‌آمیز بود.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'خطای سرور در فرآیند ورود.' });
  }
});

// Get current user profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'کاربر یافت نشد.' });
  }
  const { passwordHash: _, ...safeUser } = req.user as any;
  return res.json({ user: safeUser });
});

// Update profile
router.put('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'عدم دسترسی' });
    const { name, email, phone, currentPassword, newPassword } = req.body;

    const fullUser = db.findUserById(req.user.id);
    if (!fullUser) return res.status(404).json({ error: 'کاربر یافت نشد.' });

    // If changing password, verify old password
    if (newPassword) {
      if (!currentPassword || !comparePassword(currentPassword, fullUser.passwordHash)) {
        return res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' });
      }
      fullUser.passwordHash = hashPassword(newPassword);
    }

    const updated = db.updateUser(req.user.id, {
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone,
    });

    const { passwordHash: _, ...safeUser } = updated as any;
    return res.json({ message: 'اطلاعات با موفقیت بروزرسانی شد.', user: safeUser });
  } catch (error: any) {
    return res.status(500).json({ error: 'خطا در بروزرسانی اطلاعات.' });
  }
});

export default router;
