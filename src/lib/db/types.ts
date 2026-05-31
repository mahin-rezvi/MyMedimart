// Database types matching the Neon PostgreSQL schema

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  is_active: boolean;
  isActive?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  discount_price?: number | null;
  discountPrice?: number | null;
  stock?: number;
  category_id?: string;
  category?: string;
  brand?: string;
  description?: string;
  short_desc?: string;
  shortDesc?: string;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  images?: string[];
  specs?: Record<string, string>;
  tags?: string[];
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
  notificationStatus?: {
    emailSent?: boolean;
    whatsappSent?: boolean;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_price?: number;
  status: string;
  items?: OrderItem[];
  shipping_address?: ShippingAddress;
  tracking_number?: string | null;
  admin_note?: string | null;
  customer?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id?: string | null;
  name: string;
  variant?: string | null;
  quantity: number;
  price: number;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Cart {
  id: string;
  user_id: string;
  coupon_code?: string | null;
  items: CartItem[];
  subtotal: number;
  item_count: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSettings {
  user_id: string;
  display_name?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  default_address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  marketing_opt_in: boolean;
  order_updates_opt_in: boolean;
  theme: string;
  language: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label?: string | null;
  full_name?: string | null;
  phone?: string | null;
  street?: string | null;
  area?: string | null;
  city?: string | null;
  postal_code?: string | null;
  notes?: string | null;
  is_default: boolean;
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
