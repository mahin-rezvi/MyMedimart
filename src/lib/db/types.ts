// Database types matching the Neon PostgreSQL schema

export interface Category {
  id: string;
  name: string;
  icon?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  description?: string;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  images?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name?: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  name: string;
  variant?: string | null;
  qty: number;
  price: number;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  area?: string;
  city?: string;
  notes?: string;
  paymentMethod?: string;
  shippingCost?: number;
  subtotal?: number;
  totalAmount?: number;
  orderNumber?: string;
  invoiceNo?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price?: number;
  status: string;
  items?: OrderItem[];
  shipping_address?: ShippingAddress;
  created_at: Date;
  updated_at: Date;
}

export interface Banner {
  id: string;
  title?: string;
  image_url?: string;
  link?: string;
  is_active: boolean;
  position?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent?: number;
  discount_fixed?: number;
  max_usage?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: Date;
  unsubscribed_at?: Date;
}
