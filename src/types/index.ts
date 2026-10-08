// Shared TypeScript interfaces for YadakPart e-commerce platform

export type Role = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSafe {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  parentId?: string | null;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
}

export interface Vehicle {
  id: string;
  make: string;
  logo?: string;
  country: string;
}

export interface VehicleModel {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  modelName: string;
  yearStart: number;
  yearEnd: number;
  generation?: string;
}

export interface VehicleCompatibility {
  id: string;
  productId: string;
  vehicleModelId: string;
  modelName: string;
  vehicleMake: string;
  yearFrom?: number;
  yearTo?: number;
  notes?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brandId: string;
  brandName?: string;
  categoryId: string;
  categoryName?: string;
  shortDescription: string;
  fullDescription: string;
  sellingPrice: number;
  purchasePrice?: number; // STRICTLY hidden from regular customers
  discountPrice?: number;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isBestSeller: boolean;
  images: string[];
  specs: ProductSpec[];
  compatibleModels?: VehicleModel[];
  createdAt: string;
  updatedAt: string;
  // Computed for admin
  profit?: number;
  profitMargin?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'sourcing'
  | 'purchased'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice?: number; // Only for admin
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  province: string;
  city: string;
  address: string;
  unit?: string;
  postalCode: string;
  notes?: string;
  shippingMethod: 'standard' | 'express' | 'pickup';
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  subtotal: number;
  totalAmount: number;
  paymentMethod: 'online' | 'cod';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingCode?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  // Admin stats
  totalCost?: number;
  totalProfit?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  gateway: string;
  transactionId: string;
  refNumber?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number; // e.g. 10 for 10% or 100000 for 100,000 Tomans
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive';
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AdminDashboardStats {
  totalSales: number;
  totalProfit: number;
  profitMarginPercent: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: Record<OrderStatus, number>;
  lowStockCount: number;
  monthlySales: { month: string; sales: number; profit: number; ordersCount: number }[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  topSellingProducts: { product: Product; quantitySold: number; totalRevenue: number }[];
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  supportHours: string;
  address: string;
  standardShippingFee: number;
  expressShippingFee: number;
  freeShippingThreshold: number;
  enableCod: boolean;
  lowStockThreshold: number;
}
