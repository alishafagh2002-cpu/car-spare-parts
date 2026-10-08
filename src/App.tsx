import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProductsPage } from './pages/ProductsPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { PaymentMockPage } from './pages/PaymentMockPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { TrackOrderPage } from './pages/TrackOrderPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { AboutPage, ContactPage, FAQPage } from './pages/StaticPages.tsx';
import { AdminLayout } from './pages/admin/AdminLayout.tsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminProducts } from './pages/admin/AdminProducts.tsx';
import { AdminProductForm } from './pages/admin/AdminProductForm.tsx';
import { AdminOrders } from './pages/admin/AdminOrders.tsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.tsx';
import { AdminDiscounts } from './pages/admin/AdminDiscounts.tsx';
import { AdminReports } from './pages/admin/AdminReports.tsx';
import { AdminSettings } from './pages/admin/AdminSettings.tsx';
import type { Product } from './types/index.ts';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, isLoading } = useAuth();
  const [route, setRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string>('');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Sync with browser hash / location on mount
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      navigate(hash, false);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: string, updateHash = true) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let mainRoute = newRoute;
    let param = '';

    if (newRoute.includes('/')) {
      const parts = newRoute.split('/');
      mainRoute = parts[0];
      param = parts.slice(1).join('/');
    } else if (newRoute.includes('?')) {
      const parts = newRoute.split('?');
      mainRoute = parts[0];
      param = parts[1];
    }

    setRoute(mainRoute);
    setRouteParam(param);

    if (updateHash) {
      window.location.hash = newRoute;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-black text-amber-400">یدک‌پارت</span>
        <span className="text-xs text-zinc-500 mt-1">در حال آماده‌سازی سامانه...</span>
      </div>
    );
  }

  // --- Admin Route Handler ---
  if (route === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold">دسترسی غیرمجاز به پنل مدیریت</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              این بخش صرفاً برای مدیران سیستم قابل دسترسی است. لطفاً با حساب کاربری ادمین وارد شوید.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate('login')}
                className="w-full py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs"
              >
                ورود با حساب مدیر (Admin Demo)
              </button>
              <button
                onClick={() => navigate('home')}
                className="w-full py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium"
              >
                بازگشت به فروشگاه
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render Admin Views
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          if (tab === 'new-product') setProductToEdit(null);
          setAdminTab(tab);
        }}
        onNavigateHome={() => navigate('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'products' && (
          <AdminProducts
            onNavigateTab={setAdminTab}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setAdminTab('new-product');
            }}
          />
        )}
        {adminTab === 'new-product' && (
          <AdminProductForm
            productToEdit={productToEdit}
            onSuccess={() => {
              setProductToEdit(null);
              setAdminTab('products');
            }}
            onCancel={() => {
              setProductToEdit(null);
              setAdminTab('products');
            }}
          />
        )}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'discounts' && <AdminDiscounts />}
        {adminTab === 'reports' && <AdminReports />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // --- Customer Store Views ---
  const renderCustomerPage = () => {
    switch (route) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'products':
        return <ProductsPage onNavigate={navigate} initialParams={routeParam} />;
      case 'product':
        return <ProductDetailPage slug={routeParam} onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} />;
      case 'payment-mock':
        return <PaymentMockPage orderId={routeParam} onNavigate={navigate} />;
      case 'order-success':
        return <OrderSuccessPage orderId={routeParam} onNavigate={navigate} />;
      case 'track-order':
        return <TrackOrderPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} initialTab="login" />;
      case 'register':
        return <LoginPage onNavigate={navigate} initialTab="register" />;
      case 'account':
        return <AccountPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'terms':
      case 'privacy':
        return <AboutPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-amber-500 selection:text-white">
      <Header onNavigate={navigate} currentRoute={route} />
      <main className="flex-1">{renderCustomerPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
