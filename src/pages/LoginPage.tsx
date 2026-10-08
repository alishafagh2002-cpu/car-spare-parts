import React, { useState } from 'react';
import {
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldAlert,
  Car,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  initialTab?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialTab = 'login' }) => {
  const { login, register, demoLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onNavigate('home');
    } else {
      setError(res.error || 'ورود ناموفق بود');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, regPhone, regEmail, regPassword);
    setLoading(false);

    if (res.success) {
      onNavigate('home');
    } else {
      setError(res.error || 'ثبت‌نام ناموفق بود');
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'customer') => {
    setLoading(true);
    await demoLogin(role);
    setLoading(false);
    if (role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto text-zinc-950 font-black shadow-md">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-zinc-950">ورود به سامانه یدک‌پارت</h1>
          <p className="text-xs text-zinc-500">حساب کاربری خریداران و مدیران فروشگاه قطعات</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'login' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            ورود به حساب
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'register' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            ثبت‌نام کاربر جدید
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1.5">
                شماره موبایل یا ایمیل:
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="0912... یا admin@yadakpart.ir"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1.5">رمز عبور:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl transition-colors shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'در حال بررسی...' : 'ورود به حساب کاربری'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">نام و نام خانوادگی:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی کریمی"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">شماره موبایل:</label>
              <input
                type="tel"
                required
                dir="ltr"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0912XXXXXXX"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">ایمیل (اختیاری):</label>
              <input
                type="email"
                dir="ltr"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-right focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">رمز عبور (حداقل ۶ نویسه):</label>
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام و ورود'}
            </button>
          </form>
        )}

        {/* Demo Fast Login Helper */}
        <div className="pt-4 border-t border-zinc-200 space-y-2">
          <span className="block text-[11px] text-zinc-400 font-medium text-center">
            ورود سریع با حساب‌های آزمایشی دمو:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded-xl text-center font-bold text-[11px] transition-colors"
            >
              ورود مدیر سیستم (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-center font-semibold text-[11px] transition-colors"
            >
              ورود مشتری دمو (User)
            </button>
          </div>
          <div className="text-[10px] text-zinc-400 text-center font-mono pt-1">
            اطلاعات ادمین: admin@yadakpart.ir / admin123456
          </div>
        </div>
      </div>
    </div>
  );
};
