import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, VehicleModel } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';

interface VehicleGarage {
  make: string;
  model: VehicleModel | null;
  year?: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  couponCode: string;
  couponMessage: string;
  selectedVehicle: VehicleGarage | null;
  shippingMethod: 'standard' | 'express';
  setShippingMethod: (method: 'standard' | 'express') => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setSelectedVehicle: (vehicle: VehicleGarage | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('yp_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem('yp_coupon_code') || '';
  });
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const [selectedVehicle, setSelectedVehicleState] = useState<VehicleGarage | null>(() => {
    try {
      const saved = localStorage.getItem('yp_selected_vehicle');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save cart items to local storage
  useEffect(() => {
    localStorage.setItem('yp_cart_items', JSON.stringify(items));
    // Also sync to backend if user is logged in
    if (user && token) {
      fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }
  }, [items, user, token]);

  const setSelectedVehicle = (v: VehicleGarage | null) => {
    setSelectedVehicleState(v);
    if (v) {
      localStorage.setItem('yp_selected_vehicle', JSON.stringify(v));
    } else {
      localStorage.removeItem('yp_selected_vehicle');
    }
  };

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id);
      const unitPrice = product.discountPrice || product.sellingPrice;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          product,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
    localStorage.removeItem('yp_cart_items');
    localStorage.removeItem('yp_coupon_code');
  };

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'لطفاً کد تخفیف را وارد نمایید' };
    }

    try {
      const res = await fetch('/api/cart/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), cartAmount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponDiscount(0);
        setCouponMessage(data.error || 'کد تخفیف معتبر نیست');
        return { success: false, message: data.error || 'کد تخفیف نامعتبر است' };
      }

      setCouponCode(data.code);
      setCouponDiscount(data.discountAmount);
      setCouponMessage(data.message);
      localStorage.setItem('yp_coupon_code', data.code);
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'خطا در اعتبارسنجی کد تخفیف' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
    localStorage.removeItem('yp_coupon_code');
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping threshold = 2,500,000 Tomans
  let shippingFee = 0;
  if (items.length > 0) {
    if (shippingMethod === 'express') {
      shippingFee = 75000;
    } else {
      shippingFee = subtotal >= 2500000 ? 0 : 49000;
    }
  }

  const total = Math.max(0, subtotal - couponDiscount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount: couponDiscount,
        shippingFee,
        total,
        couponCode,
        couponMessage,
        selectedVehicle,
        shippingMethod,
        setShippingMethod,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        setSelectedVehicle,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
