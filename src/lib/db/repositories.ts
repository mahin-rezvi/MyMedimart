import { queryAll, queryOne, query } from './postgres';
import { Product, Category, Order, User } from './types';

// Products Repository
export const productsRepo = {
  async getAll(): Promise<Product[]> {
    return queryAll<Product>('SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC');
  },

  async getById(id: string): Promise<Product | undefined> {
    return queryOne<Product>('SELECT * FROM products WHERE id = $1', [id]);
  },

  async getFeatured(): Promise<Product[]> {
    return queryAll<Product>('SELECT * FROM products WHERE is_featured = true AND is_active = true LIMIT 10');
  },

  async getFlashSale(): Promise<Product[]> {
    return queryAll<Product>('SELECT * FROM products WHERE is_flash_sale = true AND is_active = true');
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    return queryAll<Product>('SELECT * FROM products WHERE category_id = $1 AND is_active = true', [categoryId]);
  },

  async create(product: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await queryOne<Product>(
      `INSERT INTO products (id, name, price, category_id, description, sku, is_active, is_featured, is_flash_sale, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [product.id, product.name, product.price, product.category_id, product.description, product.sku,
       product.is_active, product.is_featured, product.is_flash_sale, product.images]
    );
    return result as Product;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const result = await queryOne<Product>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return result as Product;
  },

  async delete(id: string): Promise<void> {
    await query('DELETE FROM products WHERE id = $1', [id]);
  },
};

// Categories Repository
export const categoriesRepo = {
  async getAll(): Promise<Category[]> {
    return queryAll<Category>('SELECT * FROM categories WHERE is_active = true ORDER BY name');
  },

  async getById(id: string): Promise<Category | undefined> {
    return queryOne<Category>('SELECT * FROM categories WHERE id = $1', [id]);
  },

  async create(category: Omit<Category, 'created_at' | 'updated_at'>): Promise<Category> {
    const result = await queryOne<Category>(
      'INSERT INTO categories (id, name, icon, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [category.id, category.name, category.icon, category.is_active]
    );
    return result as Category;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const result = await queryOne<Category>(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return result as Category;
  },
};

// Orders Repository
export const ordersRepo = {
  async getByUserId(userId: string): Promise<Order[]> {
    return queryAll<Order>('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  },

  async getById(id: string): Promise<Order | undefined> {
    return queryOne<Order>('SELECT * FROM orders WHERE id = $1', [id]);
  },

  async create(order: Omit<Order, 'created_at' | 'updated_at'>): Promise<Order> {
    const result = await queryOne<Order>(
      `INSERT INTO orders (id, user_id, total_price, status, items, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [order.id, order.user_id, order.total_price, order.status, JSON.stringify(order.items), JSON.stringify(order.shipping_address)]
    );
    return result as Order;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const result = await queryOne<Order>(
      'UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [status, new Date(), id]
    );
    return result as Order;
  },
};

// Users Repository
export const usersRepo = {
  async getById(id: string): Promise<User | undefined> {
    return queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    return queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
  },

  async create(user: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const result = await queryOne<User>(
      `INSERT INTO users (id, email, password_hash, name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.id, user.email, user.password_hash, user.name, user.phone, user.role, user.is_active]
    );
    return result as User;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(id);

    const result = await queryOne<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return result as User;
  },
};
