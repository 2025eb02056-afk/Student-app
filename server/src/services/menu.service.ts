import { db } from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { MenuItem, Category } from '../shared/types/index.js';

export class MenuService {
  static async getCategories(): Promise<Category[]> {
    const res = await db.query<Category>(
      `SELECT id, name, created_at as "createdAt" FROM categories ORDER BY name ASC`
    );
    return res.rows;
  }

  static async getMenuItems(filters: {
    vendorId?: string;
    categoryId?: string;
    isVegetarian?: boolean;
    maxPrice?: number;
    search?: string;
    availableOnly?: boolean;
    sortBy?: 'priceAsc' | 'priceDesc' | 'prepTime' | 'name';
  }): Promise<MenuItem[]> {
    let query = `
      SELECT m.id, m.vendor_id as "vendorId", m.category_id as "categoryId",
             m.name, m.description, m.price::float, m.image_url as "imageUrl",
             m.is_vegetarian as "isVegetarian", m.is_available as "isAvailable",
             m.preparation_time as "preparationTime",
             m.created_at as "createdAt", m.updated_at as "updatedAt",
             c.name as "categoryName", v.name as "vendorName"
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      JOIN vendors v ON m.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.vendorId) {
      params.push(filters.vendorId);
      query += ` AND m.vendor_id = $${params.length}`;
    }

    if (filters.categoryId) {
      params.push(filters.categoryId);
      query += ` AND m.category_id = $${params.length}`;
    }

    if (filters.isVegetarian !== undefined) {
      params.push(filters.isVegetarian);
      query += ` AND m.is_vegetarian = $${params.length}`;
    }

    if (filters.availableOnly) {
      query += ` AND m.is_available = true AND v.is_open = true`;
    }

    if (filters.maxPrice !== undefined) {
      params.push(filters.maxPrice);
      query += ` AND m.price <= $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      query += ` AND (LOWER(m.name) LIKE $${params.length} OR LOWER(m.description) LIKE $${params.length})`;
    }

    if (filters.sortBy === 'priceAsc') {
      query += ` ORDER BY m.price ASC`;
    } else if (filters.sortBy === 'priceDesc') {
      query += ` ORDER BY m.price DESC`;
    } else if (filters.sortBy === 'prepTime') {
      query += ` ORDER BY m.preparation_time ASC`;
    } else {
      query += ` ORDER BY m.name ASC`;
    }

    const res = await db.query<MenuItem>(query, params);
    return res.rows;
  }

  static async getMenuItemById(id: string): Promise<MenuItem> {
    const res = await db.query<MenuItem>(
      `SELECT m.id, m.vendor_id as "vendorId", m.category_id as "categoryId",
              m.name, m.description, m.price::float, m.image_url as "imageUrl",
              m.is_vegetarian as "isVegetarian", m.is_available as "isAvailable",
              m.preparation_time as "preparationTime",
              m.created_at as "createdAt", m.updated_at as "updatedAt",
              c.name as "categoryName", v.name as "vendorName"
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       JOIN vendors v ON m.vendor_id = v.id
       WHERE m.id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Menu item not found');
    }

    return res.rows[0];
  }

  static async createMenuItem(data: {
    vendorId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    isVegetarian?: boolean;
    isAvailable?: boolean;
    preparationTime?: number;
  }): Promise<MenuItem> {
    const res = await db.query<MenuItem>(
      `INSERT INTO menu_items (vendor_id, category_id, name, description, price, image_url, is_vegetarian, is_available, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, vendor_id as "vendorId", category_id as "categoryId",
                 name, description, price::float, image_url as "imageUrl",
                 is_vegetarian as "isVegetarian", is_available as "isAvailable",
                 preparation_time as "preparationTime",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [
        data.vendorId,
        data.categoryId || null,
        data.name,
        data.description || null,
        data.price,
        data.imageUrl || null,
        data.isVegetarian ?? false,
        data.isAvailable ?? true,
        data.preparationTime ?? 15
      ]
    );

    return this.getMenuItemById(res.rows[0].id);
  }

  static async updateMenuItem(id: string, data: Partial<{
    categoryId: string | null;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isVegetarian: boolean;
    isAvailable: boolean;
    preparationTime: number;
  }>): Promise<MenuItem> {
    await this.getMenuItemById(id);

    await db.query(
      `UPDATE menu_items SET
         category_id = COALESCE($2, category_id),
         name = COALESCE($3, name),
         description = COALESCE($4, description),
         price = COALESCE($5, price),
         image_url = COALESCE($6, image_url),
         is_vegetarian = COALESCE($7, is_vegetarian),
         is_available = COALESCE($8, is_available),
         preparation_time = COALESCE($9, preparation_time),
         updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        data.categoryId ?? null,
        data.name ?? null,
        data.description ?? null,
        data.price ?? null,
        data.imageUrl ?? null,
        data.isVegetarian ?? null,
        data.isAvailable ?? null,
        data.preparationTime ?? null
      ]
    );

    return this.getMenuItemById(id);
  }

  static async deleteMenuItem(id: string): Promise<boolean> {
    const res = await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new NotFoundError('Menu item not found');
    }
    return true;
  }
}
