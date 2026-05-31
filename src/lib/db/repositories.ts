import { randomUUID } from "node:crypto";
import { normalizeOrderStatus, type OrderStatus } from "../order-status";
import { slugify } from "../utils";
import { queryAll, queryOne, query } from "./postgres";
import {
  Cart,
  CartItem,
  Category,
  Order,
  Product,
  User,
  UserAddress,
  UserSettings,
} from "./types";

type DbValue = string | number | boolean | Date | string[] | null;
type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function numberOrZero(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function jsonValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return [];
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return fallback;
  return value === "true" || value === "1";
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: row.slug ? String(row.slug) : String(row.id),
    icon: row.icon ? String(row.icon) : undefined,
    is_active: bool(row.is_active, true),
    isActive: bool(row.is_active, true),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  const discountPrice = nullableNumber(row.discount_price);
  const isActive = bool(row.is_active, true);
  const isFeatured = bool(row.is_featured);
  const isFlashSale = bool(row.is_flash_sale);

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: row.slug ? String(row.slug) : String(row.id),
    price: numberOrZero(row.price),
    discount_price: discountPrice,
    discountPrice,
    stock: Number(row.stock ?? 0),
    category_id: row.category_id ? String(row.category_id) : undefined,
    category: row.category_name ? String(row.category_name) : row.category_id ? String(row.category_id) : undefined,
    brand: row.brand ? String(row.brand) : undefined,
    description: row.description ? String(row.description) : undefined,
    short_desc: row.short_desc ? String(row.short_desc) : undefined,
    shortDesc: row.short_desc ? String(row.short_desc) : undefined,
    sku: String(row.sku ?? ""),
    is_active: isActive,
    is_featured: isFeatured,
    is_flash_sale: isFlashSale,
    isActive,
    isFeatured,
    isFlashSale,
    images: stringArray(row.images),
    specs: jsonValue<Record<string, string>>(row.specs, {}),
    tags: stringArray(row.tags),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  const shippingAddress = jsonValue<Order["shipping_address"]>(row.shipping_address, {});
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    total_price: numberOrZero(row.total_price),
    status: normalizeOrderStatus(String(row.status ?? "PENDING")),
    items: jsonValue<Order["items"]>(row.items, []),
    shipping_address: shippingAddress,
    tracking_number: row.tracking_number ? String(row.tracking_number) : null,
    admin_note: row.admin_note ? String(row.admin_note) : null,
    customer: {
      id: row.user_id ? String(row.user_id) : undefined,
      name: row.customer_name ? String(row.customer_name) : shippingAddress?.fullName ?? null,
      email: row.customer_email ? String(row.customer_email) : shippingAddress?.email ?? null,
      phone: row.customer_phone ? String(row.customer_phone) : shippingAddress?.phone ?? null,
    },
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

function mapCartItem(row: Record<string, unknown>): CartItem {
  return {
    id: String(row.id),
    cart_id: String(row.cart_id),
    product_id: row.product_id ? String(row.product_id) : null,
    name: String(row.name ?? ""),
    variant: row.variant ? String(row.variant) : null,
    quantity: Number(row.quantity ?? 1),
    price: numberOrZero(row.price),
    image_url: row.image_url ? String(row.image_url) : null,
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

function mapUserSettings(row: Record<string, unknown>, userId: string): UserSettings {
  return {
    user_id: String(row.user_id ?? userId),
    display_name: row.display_name ? String(row.display_name) : row.name ? String(row.name) : null,
    phone: row.phone ? String(row.phone) : null,
    photo_url: row.photo_url ? String(row.photo_url) : null,
    default_address: row.default_address ? String(row.default_address) : null,
    city: row.city ? String(row.city) : null,
    postal_code: row.postal_code ? String(row.postal_code) : null,
    date_of_birth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : null,
    gender: row.gender ? String(row.gender) : null,
    marketing_opt_in: bool(row.marketing_opt_in),
    order_updates_opt_in: bool(row.order_updates_opt_in, true),
    theme: String(row.theme ?? "system"),
    language: String(row.language ?? "en"),
    created_at: row.created_at as Date | undefined,
    updated_at: row.updated_at as Date | undefined,
  };
}

function mapAddress(row: Record<string, unknown>): UserAddress {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    label: row.label ? String(row.label) : "Home",
    full_name: row.full_name ? String(row.full_name) : null,
    phone: row.phone ? String(row.phone) : null,
    street: row.street ? String(row.street) : null,
    area: row.area ? String(row.area) : null,
    city: row.city ? String(row.city) : null,
    postal_code: row.postal_code ? String(row.postal_code) : null,
    notes: row.notes ? String(row.notes) : null,
    is_default: bool(row.is_default),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

async function resolveCategoryId(category?: unknown): Promise<string | undefined> {
  const raw = typeof category === "string" ? category.trim() : "";
  if (!raw) return undefined;

  const existing = await queryOne<Record<string, unknown>>(
    "SELECT id FROM categories WHERE id = $1 OR slug = $1 OR lower(name) = lower($1) LIMIT 1",
    [raw]
  );
  if (existing?.id) return String(existing.id);

  const id = slugify(raw) || randomUUID();
  await query(
    `INSERT INTO categories (id, name, slug, icon, is_active)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (id) DO NOTHING`,
    [id, raw, id, "📦"]
  );
  return id;
}

function buildUpdate(
  updates: Record<string, unknown>,
  fieldMap: Record<string, string>,
  startIndex = 1
): { assignments: string[]; values: DbValue[]; nextIndex: number } {
  const assignments: string[] = [];
  const values: DbValue[] = [];
  let index = startIndex;

  Object.entries(updates).forEach(([key, value]) => {
    const column = fieldMap[key];
    if (!column || value === undefined) return;
    assignments.push(`${column} = $${index}`);
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      values.push(JSON.stringify(value));
    } else {
      values.push(value as DbValue);
    }
    index += 1;
  });

  return { assignments, values, nextIndex: index };
}

// Products Repository
export const productsRepo = {
  async getAll(): Promise<Product[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.is_active = true
       ORDER BY products.created_at DESC
       LIMIT 500`
    );
    return rows.map(mapProduct);
  },

  async getAllForAdmin(options: { search?: string; limit?: number; offset?: number; status?: string; category?: string } = {}): Promise<Product[]> {
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (options.search?.trim()) {
      values.push(`%${options.search.trim()}%`);
      const p = `$${values.length}`;
      conditions.push(`(products.name ILIKE ${p} OR products.sku ILIKE ${p})`);
    }
    if (options.status === "active") conditions.push("products.is_active = true");
    else if (options.status === "inactive") conditions.push("products.is_active = false");
    if (options.category && options.category !== "all") {
      values.push(options.category);
      conditions.push(`categories.slug = $${values.length}`);
    }

    const limit = Math.min(Number(options.limit ?? 200), 500);
    const offset = Number(options.offset ?? 0);
    values.push(limit, offset);

    const rows = await queryAll<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY products.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    return rows.map(mapProduct);
  },

  async getById(id: string): Promise<Product | undefined> {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.id = $1`,
      [id]
    );
    return row ? mapProduct(row) : undefined;
  },

  async getBySlugOrId(slugOrId: string): Promise<Product | undefined> {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.id = $1 OR products.slug = $1`,
      [slugOrId]
    );
    return row ? mapProduct(row) : undefined;
  },

  async getFeatured(): Promise<Product[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.is_featured = true AND products.is_active = true
       ORDER BY products.created_at DESC
       LIMIT 10`
    );
    return rows.map(mapProduct);
  },

  async getFlashSale(): Promise<Product[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE products.is_flash_sale = true AND products.is_active = true
       ORDER BY products.created_at DESC
       LIMIT 50`
    );
    return rows.map(mapProduct);
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT products.*, categories.name AS category_name
       FROM products
       LEFT JOIN categories ON categories.id = products.category_id
       WHERE (products.category_id = $1 OR categories.slug = $1) AND products.is_active = true
       ORDER BY products.created_at DESC`,
      [categoryId]
    );
    return rows.map(mapProduct);
  },

  async create(input: Partial<Product> & Record<string, unknown>): Promise<Product> {
    const name = String(input.name ?? "").trim();
    if (!name) throw new Error("Product name is required");

    const slug = String(input.slug ?? slugify(name)).trim();
    const id = String(input.id ?? (slug || randomUUID()));
    const sku = String(input.sku ?? `SKU-${id.slice(0, 12).toUpperCase()}`);
    const categoryId = await resolveCategoryId(input.category_id ?? input.category);

    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO products (
        id, name, slug, price, discount_price, stock, category_id, brand, description,
        short_desc, sku, is_active, is_featured, is_flash_sale, images, specs, tags
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        id,
        name,
        slug,
        numberOrZero(input.price),
        nullableNumber(input.discount_price ?? input.discountPrice),
        Number(input.stock ?? 0),
        categoryId ?? null,
        input.brand ? String(input.brand) : null,
        input.description ? String(input.description) : null,
        input.short_desc ?? input.shortDesc ? String(input.short_desc ?? input.shortDesc) : null,
        sku,
        input.is_active ?? input.isActive ?? true,
        input.is_featured ?? input.isFeatured ?? false,
        input.is_flash_sale ?? input.isFlashSale ?? false,
        Array.isArray(input.images) ? input.images : [],
        JSON.stringify(input.specs ?? {}),
        Array.isArray(input.tags) ? input.tags : [],
      ]
    );
    return mapProduct(row as Record<string, unknown>);
  },

  async update(id: string, input: Partial<Product> & Record<string, unknown>): Promise<Product> {
    const updates: Record<string, unknown> = { ...input };
    if (updates.category !== undefined || updates.category_id !== undefined) {
      updates.category_id = await resolveCategoryId(updates.category_id ?? updates.category);
      delete updates.category;
    }

    if (updates.discountPrice !== undefined) updates.discount_price = nullableNumber(updates.discountPrice);
    if (updates.shortDesc !== undefined) updates.short_desc = updates.shortDesc;
    if (updates.isActive !== undefined) updates.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) updates.is_featured = updates.isFeatured;
    if (updates.isFlashSale !== undefined) updates.is_flash_sale = updates.isFlashSale;
    if (updates.specs !== undefined) updates.specs = JSON.stringify(updates.specs);

    const fieldMap = {
      name: "name",
      slug: "slug",
      price: "price",
      discount_price: "discount_price",
      stock: "stock",
      category_id: "category_id",
      brand: "brand",
      description: "description",
      short_desc: "short_desc",
      sku: "sku",
      is_active: "is_active",
      is_featured: "is_featured",
      is_flash_sale: "is_flash_sale",
      images: "images",
      specs: "specs",
      tags: "tags",
    };

    const { assignments, values, nextIndex } = buildUpdate(updates, fieldMap);
    if (assignments.length === 0) {
      const product = await this.getById(id);
      if (!product) throw new Error("Product not found");
      return product;
    }

    values.push(id);
    const row = await queryOne<Record<string, unknown>>(
      `UPDATE products SET ${assignments.join(", ")} WHERE id = $${nextIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error("Product not found");
    return mapProduct(row);
  },

  async delete(id: string): Promise<void> {
    await query("DELETE FROM products WHERE id = $1", [id]);
  },
};

// Categories Repository
export const categoriesRepo = {
  async getAll(includeInactive = false): Promise<Category[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT * FROM categories ${includeInactive ? "" : "WHERE is_active = true"} ORDER BY name`
    );
    return rows.map(mapCategory);
  },

  async getById(id: string): Promise<Category | undefined> {
    const row = await queryOne<Record<string, unknown>>("SELECT * FROM categories WHERE id = $1", [id]);
    return row ? mapCategory(row) : undefined;
  },

  async create(category: Partial<Category> & Record<string, unknown>): Promise<Category> {
    const name = String(category.name ?? "").trim();
    const id = String(category.id ?? (slugify(name) || randomUUID()));
    const slug = String(category.slug ?? slugify(name) ?? id);
    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO categories (id, name, slug, icon, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name, slug, category.icon ? String(category.icon) : "📦", category.is_active ?? category.isActive ?? true]
    );
    return mapCategory(row as Record<string, unknown>);
  },

  async update(id: string, updates: Partial<Category> & Record<string, unknown>): Promise<Category> {
    if (updates.isActive !== undefined) updates.is_active = updates.isActive;
    const { assignments, values, nextIndex } = buildUpdate(updates, {
      name: "name",
      slug: "slug",
      icon: "icon",
      is_active: "is_active",
    });
    values.push(id);
    const row = await queryOne<Record<string, unknown>>(
      `UPDATE categories SET ${assignments.join(", ")} WHERE id = $${nextIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error("Category not found");
    return mapCategory(row);
  },

  async delete(id: string): Promise<void> {
    await query("DELETE FROM categories WHERE id = $1", [id]);
  },
};

// Orders Repository
export const ordersRepo = {
  async getByUserId(userId: string, limit?: number): Promise<Order[]> {
    const rows = await queryAll<Record<string, unknown>>(
      `SELECT orders.*, users.name AS customer_name, users.email AS customer_email, users.phone AS customer_phone
       FROM orders
       LEFT JOIN users ON users.id = orders.user_id
       WHERE orders.user_id = $1
       ORDER BY orders.created_at DESC
       ${limit ? "LIMIT $2" : ""}`,
      limit ? [userId, limit] : [userId]
    );
    return rows.map(mapOrder);
  },

  async getAll(options: { status?: string; search?: string; limit?: number } = {}): Promise<Order[]> {
    const conditions: string[] = [];
    const values: DbValue[] = [];

    if (options.status && options.status !== "All") {
      values.push(normalizeOrderStatus(options.status));
      conditions.push(`orders.status = $${values.length}`);
    }

    if (options.search?.trim()) {
      values.push(`%${options.search.trim()}%`);
      const param = `$${values.length}`;
      conditions.push(`(
        orders.id ILIKE ${param}
        OR orders.shipping_address->>'orderNumber' ILIKE ${param}
        OR users.name ILIKE ${param}
        OR users.email ILIKE ${param}
        OR users.phone ILIKE ${param}
      )`);
    }

    const limit = Math.min(Math.max(Number(options.limit ?? 200), 1), 500);
    values.push(limit);

    const rows = await queryAll<Record<string, unknown>>(
      `SELECT orders.*, users.name AS customer_name, users.email AS customer_email, users.phone AS customer_phone
       FROM orders
       LEFT JOIN users ON users.id = orders.user_id
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY orders.created_at DESC
       LIMIT $${values.length}`,
      values
    );
    return rows.map(mapOrder);
  },

  async getById(id: string): Promise<Order | undefined> {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT orders.*, users.name AS customer_name, users.email AS customer_email, users.phone AS customer_phone
       FROM orders
       LEFT JOIN users ON users.id = orders.user_id
       WHERE orders.id = $1`,
      [id]
    );
    return row ? mapOrder(row) : undefined;
  },

  async getStatusCounts(): Promise<Record<OrderStatus, number>> {
    const rows = await queryAll<Record<string, unknown>>("SELECT status, COUNT(*) AS count FROM orders GROUP BY status");
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      ON_THE_WAY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    } satisfies Record<OrderStatus, number>;

    rows.forEach((row) => {
      counts[normalizeOrderStatus(String(row.status))] += Number(row.count ?? 0);
    });

    return counts;
  },

  async create(order: Omit<Order, "created_at" | "updated_at">): Promise<Order> {
    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO orders (id, user_id, total_price, status, items, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        order.id,
        order.user_id,
        order.total_price,
        normalizeOrderStatus(order.status),
        JSON.stringify(order.items ?? []),
        JSON.stringify(order.shipping_address ?? {}),
      ]
    );
    return mapOrder(row as Record<string, unknown>);
  },

  async updateStatus(
    id: string,
    status: string,
    options: { trackingNumber?: string | null; adminNote?: string | null } = {}
  ): Promise<Order> {
    const normalized = normalizeOrderStatus(status);
    const timestampColumn =
      normalized === "CONFIRMED"
        ? "confirmed_at"
        : normalized === "ON_THE_WAY"
          ? "out_for_delivery_at"
          : normalized === "DELIVERED"
            ? "delivered_at"
            : normalized === "CANCELLED"
              ? "cancelled_at"
              : null;

    const assignments = [
      "status = $1",
      "tracking_number = COALESCE($2, tracking_number)",
      "admin_note = COALESCE($3, admin_note)",
    ];
    if (timestampColumn) assignments.push(`${timestampColumn} = COALESCE(${timestampColumn}, NOW())`);

    const row = await queryOne<Record<string, unknown>>(
      `UPDATE orders SET ${assignments.join(", ")} WHERE id = $4 RETURNING *`,
      [normalized, options.trackingNumber ?? null, options.adminNote ?? null, id]
    );
    if (!row) throw new Error("Order not found");
    return mapOrder(row);
  },

  async updateShippingAddress(id: string, shippingAddress: Order["shipping_address"]): Promise<Order> {
    const row = await queryOne<Record<string, unknown>>(
      "UPDATE orders SET shipping_address = $1 WHERE id = $2 RETURNING *",
      [JSON.stringify(shippingAddress), id]
    );
    if (!row) throw new Error("Order not found");
    return mapOrder(row);
  },

  async delete(id: string): Promise<void> {
    await query("DELETE FROM orders WHERE id = $1", [id]);
  },
};

// Cart Repository
export const cartRepo = {
  async ensureCart(userId: string): Promise<{ id: string; user_id: string; coupon_code?: string | null }> {
    const existing = await queryOne<Record<string, unknown>>("SELECT * FROM carts WHERE user_id = $1", [userId]);
    if (existing) {
      return {
        id: String(existing.id),
        user_id: String(existing.user_id),
        coupon_code: existing.coupon_code ? String(existing.coupon_code) : null,
      };
    }

    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO carts (id, user_id) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [randomUUID(), userId]
    );
    return {
      id: String(row?.id),
      user_id: String(row?.user_id),
      coupon_code: row?.coupon_code ? String(row.coupon_code) : null,
    };
  },

  async getByUserId(userId: string): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    const itemRows = await queryAll<Record<string, unknown>>(
      "SELECT * FROM cart_items WHERE cart_id = $1 ORDER BY created_at DESC",
      [cart.id]
    );
    const items = itemRows.map(mapCartItem);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      id: cart.id,
      user_id: userId,
      coupon_code: cart.coupon_code ?? null,
      items,
      subtotal,
      item_count: itemCount,
    };
  },

  async addItem(userId: string, item: {
    productId?: string | null;
    name: string;
    variant?: string | null;
    quantity?: number;
    price: number;
    imageUrl?: string | null;
  }): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    const variantKey = item.variant?.trim() ?? "";
    await query(
      `INSERT INTO cart_items (id, cart_id, product_id, name, variant, variant_key, quantity, price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (cart_id, product_id, variant_key)
       DO UPDATE SET
         quantity = cart_items.quantity + EXCLUDED.quantity,
         name = EXCLUDED.name,
         price = EXCLUDED.price,
         image_url = EXCLUDED.image_url,
         updated_at = NOW()`,
      [
        randomUUID(),
        cart.id,
        item.productId ?? null,
        item.name,
        item.variant ?? null,
        variantKey,
        Math.max(1, Number(item.quantity ?? 1)),
        numberOrZero(item.price),
        item.imageUrl ?? null,
      ]
    );
    return this.getByUserId(userId);
  },

  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    if (quantity <= 0) {
      await query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2", [itemId, cart.id]);
    } else {
      await query("UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3", [
        Math.max(1, Math.floor(quantity)),
        itemId,
        cart.id,
      ]);
    }
    return this.getByUserId(userId);
  },

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    await query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2", [itemId, cart.id]);
    return this.getByUserId(userId);
  },

  async clear(userId: string): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    await query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
    return this.getByUserId(userId);
  },
};

// User Settings Repository
export const userSettingsRepo = {
  async get(userId: string): Promise<UserSettings> {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT user_settings.*, users.name, users.phone AS user_phone
       FROM users
       LEFT JOIN user_settings ON user_settings.user_id = users.id
       WHERE users.id = $1`,
      [userId]
    );
    if (!row) throw new Error("User not found");
    return mapUserSettings({ ...row, phone: row.phone ?? row.user_phone }, userId);
  },

  async update(userId: string, updates: Record<string, unknown>): Promise<UserSettings> {
    const displayName = updates.displayName ?? updates.display_name ?? null;
    const phone = updates.phone ?? null;
    const photoUrl = updates.photoURL ?? updates.photo_url ?? null;
    const defaultAddress = updates.defaultAddress ?? updates.default_address ?? null;
    const postalCode = updates.postalCode ?? updates.postal_code ?? null;
    const dateOfBirth = updates.dateOfBirth ?? updates.date_of_birth ?? null;
    const marketingOptIn = updates.marketingOptIn ?? updates.marketing_opt_in ?? false;
    const orderUpdatesOptIn = updates.orderUpdatesOptIn ?? updates.order_updates_opt_in ?? true;

    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO user_settings (
        user_id, display_name, phone, photo_url, default_address, city, postal_code,
        date_of_birth, gender, marketing_opt_in, order_updates_opt_in, theme, language
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        phone = EXCLUDED.phone,
        photo_url = EXCLUDED.photo_url,
        default_address = EXCLUDED.default_address,
        city = EXCLUDED.city,
        postal_code = EXCLUDED.postal_code,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        marketing_opt_in = EXCLUDED.marketing_opt_in,
        order_updates_opt_in = EXCLUDED.order_updates_opt_in,
        theme = EXCLUDED.theme,
        language = EXCLUDED.language
       RETURNING *`,
      [
        userId,
        displayName ? String(displayName) : null,
        phone ? String(phone) : null,
        photoUrl ? String(photoUrl) : null,
        defaultAddress ? String(defaultAddress) : null,
        updates.city ? String(updates.city) : null,
        postalCode ? String(postalCode) : null,
        dateOfBirth ? String(dateOfBirth) : null,
        updates.gender ? String(updates.gender) : null,
        Boolean(marketingOptIn),
        Boolean(orderUpdatesOptIn),
        updates.theme ? String(updates.theme) : "system",
        updates.language ? String(updates.language) : "en",
      ]
    );

    await usersRepo.update(userId, {
      name: displayName ? String(displayName) : undefined,
      phone: phone ? String(phone) : undefined,
    });

    return mapUserSettings(row as Record<string, unknown>, userId);
  },
};

// User Addresses Repository
export const userAddressesRepo = {
  async getAll(userId: string): Promise<UserAddress[]> {
    const rows = await queryAll<Record<string, unknown>>(
      "SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC",
      [userId]
    );
    return rows.map(mapAddress);
  },

  async create(userId: string, input: Record<string, unknown>): Promise<UserAddress> {
    const isDefault = Boolean(input.isDefault ?? input.is_default);
    if (isDefault) {
      await query("UPDATE user_addresses SET is_default = false WHERE user_id = $1", [userId]);
    }

    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO user_addresses (
        id, user_id, label, full_name, phone, street, area, city, postal_code, notes, is_default
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        randomUUID(),
        userId,
        input.label ? String(input.label) : "Home",
        input.fullName ?? input.full_name ? String(input.fullName ?? input.full_name) : null,
        input.phone ? String(input.phone) : null,
        input.street ? String(input.street) : null,
        input.area ? String(input.area) : null,
        input.city ? String(input.city) : null,
        input.postalCode ?? input.postal_code ? String(input.postalCode ?? input.postal_code) : null,
        input.notes ? String(input.notes) : null,
        isDefault,
      ]
    );
    return mapAddress(row as Record<string, unknown>);
  },

  async update(userId: string, id: string, input: Record<string, unknown>): Promise<UserAddress> {
    if (input.isDefault === true || input.is_default === true) {
      await query("UPDATE user_addresses SET is_default = false WHERE user_id = $1", [userId]);
      input.is_default = true;
    }

    if (input.fullName !== undefined) input.full_name = input.fullName;
    if (input.postalCode !== undefined) input.postal_code = input.postalCode;
    if (input.isDefault !== undefined) input.is_default = input.isDefault;

    const { assignments, values, nextIndex } = buildUpdate(input, {
      label: "label",
      full_name: "full_name",
      phone: "phone",
      street: "street",
      area: "area",
      city: "city",
      postal_code: "postal_code",
      notes: "notes",
      is_default: "is_default",
    });

    values.push(userId, id);
    const row = await queryOne<Record<string, unknown>>(
      `UPDATE user_addresses SET ${assignments.join(", ")}
       WHERE user_id = $${nextIndex} AND id = $${nextIndex + 1}
       RETURNING *`,
      values
    );
    if (!row) throw new Error("Address not found");
    return mapAddress(row);
  },

  async delete(userId: string, id: string): Promise<void> {
    await query("DELETE FROM user_addresses WHERE user_id = $1 AND id = $2", [userId, id]);
  },
};

// Users Repository
export const usersRepo = {
  async getAll(): Promise<User[]> {
    return queryAll<User>("SELECT * FROM users ORDER BY created_at DESC LIMIT 500");
  },

  async getById(id: string): Promise<User | undefined> {
    return queryOne<User>("SELECT * FROM users WHERE id = $1", [id]);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
  },

  async create(user: Omit<User, "created_at" | "updated_at">): Promise<User> {
    const row = await queryOne<User>(
      `INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = COALESCE(EXCLUDED.name, users.name),
         phone = COALESCE(EXCLUDED.phone, users.phone)
       RETURNING *`,
      [user.id, user.email, user.password_hash, user.name, user.phone, user.role, user.is_active]
    );
    return row as User;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { assignments, values, nextIndex } = buildUpdate(updates as Record<string, unknown>, {
      email: "email",
      password_hash: "password_hash",
      name: "name",
      phone: "phone",
      role: "role",
      is_active: "is_active",
    });

    if (assignments.length === 0) {
      const user = await this.getById(id);
      if (!user) throw new Error("User not found");
      return user;
    }

    values.push(id);
    const row = await queryOne<User>(
      `UPDATE users SET ${assignments.join(", ")} WHERE id = $${nextIndex} RETURNING *`,
      values
    );
    if (!row) throw new Error("User not found");
    return row;
  },
};

// Admin Store Settings Repository
export const siteSettingsRepo = {
  async get<T extends JsonValue = Record<string, unknown>>(key: string, fallback: T): Promise<T> {
    const row = await queryOne<Record<string, unknown>>("SELECT value FROM site_settings WHERE key = $1", [key]);
    return row ? jsonValue<T>(row.value, fallback) : fallback;
  },

  async set<T extends JsonValue>(key: string, value: T): Promise<T> {
    const row = await queryOne<Record<string, unknown>>(
      `INSERT INTO site_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING value`,
      [key, JSON.stringify(value)]
    );
    return jsonValue<T>(row?.value, value);
  },
};

// Dashboard Stats — aggregates all admin dashboard data in efficient queries
export const dashboardStatsRepo = {
  async get() {
    const [
      productCountRow,
      orderStatsRow,
      userCountRow,
      recentOrderRows,
      revenueByDayRows,
      ordersByStatusRows,
    ] = await Promise.all([
      // Product count
      queryOne<Record<string, unknown>>(
        "SELECT COUNT(*) AS count FROM products WHERE is_active = true"
      ),
      // Order stats: total count + total revenue
      queryOne<Record<string, unknown>>(
        "SELECT COUNT(*) AS order_count, COALESCE(SUM(total_price), 0) AS total_revenue FROM orders"
      ),
      // User count
      queryOne<Record<string, unknown>>(
        "SELECT COUNT(*) AS count FROM users WHERE is_active = true"
      ),
      // Recent 6 orders with customer info
      queryAll<Record<string, unknown>>(
        `SELECT orders.*, users.name AS customer_name, users.email AS customer_email, users.phone AS customer_phone
         FROM orders
         LEFT JOIN users ON users.id = orders.user_id
         ORDER BY orders.created_at DESC
         LIMIT 6`
      ),
      // Revenue per day for the last 7 days
      queryAll<Record<string, unknown>>(
        `SELECT
           TO_CHAR(created_at AT TIME ZONE 'Asia/Dhaka', 'Dy') AS day,
           DATE_TRUNC('day', created_at) AS date,
           COALESCE(SUM(total_price), 0) AS revenue
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE_TRUNC('day', created_at), TO_CHAR(created_at AT TIME ZONE 'Asia/Dhaka', 'Dy')
         ORDER BY date ASC`
      ),
      // Orders grouped by status
      queryAll<Record<string, unknown>>(
        "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
      ),
    ]);

    return {
      productCount: Number(productCountRow?.count ?? 0),
      orderCount: Number(orderStatsRow?.order_count ?? 0),
      totalRevenue: Number(orderStatsRow?.total_revenue ?? 0),
      userCount: Number(userCountRow?.count ?? 0),
      recentOrders: recentOrderRows.map(mapOrder),
      revenueByDay: revenueByDayRows.map((r) => ({
        day: String(r.day ?? ""),
        revenue: Number(r.revenue ?? 0),
      })),
      ordersByStatus: ordersByStatusRows.reduce<Record<string, number>>((acc, r) => {
        acc[String(r.status)] = Number(r.count ?? 0);
        return acc;
      }, {}),
    };
  },
};
