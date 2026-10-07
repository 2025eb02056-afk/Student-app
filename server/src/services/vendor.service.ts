import { db } from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { Vendor } from '../shared/types/index.js';

export class VendorService {
  static async getVendors(filters: {
    search?: string;
    isOpenOnly?: boolean;
    minRating?: number;
    maxDeliveryFee?: number;
    sortBy?: 'rating' | 'deliveryTime' | 'deliveryFee' | 'popular';
  }): Promise<Vendor[]> {
    let query = `
      SELECT id, owner_id as "ownerId", name, description, address, phone,
             image_url as "imageUrl", rating::float, delivery_fee::float as "deliveryFee",
             minimum_order::float as "minimumOrder",
             estimated_delivery_time as "estimatedDeliveryTime",
             is_open as "isOpen", created_at as "createdAt", updated_at as "updatedAt"
      FROM vendors
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.isOpenOnly) {
      query += ` AND is_open = true`;
    }

    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
    }

    if (filters.minRating) {
      params.push(filters.minRating);
      query += ` AND rating >= $${params.length}`;
    }

    if (filters.maxDeliveryFee !== undefined) {
      params.push(filters.maxDeliveryFee);
      query += ` AND delivery_fee <= $${params.length}`;
    }

    if (filters.sortBy === 'deliveryTime') {
      query += ` ORDER BY estimated_delivery_time ASC`;
    } else if (filters.sortBy === 'deliveryFee') {
      query += ` ORDER BY delivery_fee ASC`;
    } else if (filters.sortBy === 'rating') {
      query += ` ORDER BY rating DESC`;
    } else {
      query += ` ORDER BY rating DESC, created_at DESC`;
    }

    const res = await db.query<Vendor>(query, params);
    return res.rows;
  }

  static async getVendorById(id: string): Promise<Vendor> {
    const res = await db.query<Vendor>(
      `SELECT id, owner_id as "ownerId", name, description, address, phone,
              image_url as "imageUrl", rating::float, delivery_fee::float as "deliveryFee",
              minimum_order::float as "minimumOrder",
              estimated_delivery_time as "estimatedDeliveryTime",
              is_open as "isOpen", created_at as "createdAt", updated_at as "updatedAt"
       FROM vendors WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Vendor not found');
    }

    return res.rows[0];
  }

  static async createVendor(data: {
    name: string;
    description?: string | null;
    address: string;
    phone?: string | null;
    imageUrl?: string | null;
    deliveryFee?: number;
    minimumOrder?: number;
    estimatedDeliveryTime?: number;
    isOpen?: boolean;
    ownerId?: string | null;
  }): Promise<Vendor> {
    const res = await db.query<Vendor>(
      `INSERT INTO vendors (name, description, address, phone, image_url, delivery_fee, minimum_order, estimated_delivery_time, is_open, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, owner_id as "ownerId", name, description, address, phone,
                 image_url as "imageUrl", rating::float, delivery_fee::float as "deliveryFee",
                 minimum_order::float as "minimumOrder",
                 estimated_delivery_time as "estimatedDeliveryTime",
                 is_open as "isOpen", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        data.name,
        data.description || null,
        data.address,
        data.phone || null,
        data.imageUrl || null,
        data.deliveryFee ?? 0,
        data.minimumOrder ?? 0,
        data.estimatedDeliveryTime ?? 30,
        data.isOpen !== undefined ? data.isOpen : true,
        data.ownerId || null
      ]
    );

    return res.rows[0];
  }

  static async updateVendor(id: string, data: Partial<{
    name: string;
    description: string | null;
    address: string;
    phone: string | null;
    imageUrl: string | null;
    deliveryFee: number;
    minimumOrder: number;
    estimatedDeliveryTime: number;
    isOpen: boolean;
    rating: number;
  }>): Promise<Vendor> {
    const existing = await this.getVendorById(id);

    const res = await db.query<Vendor>(
      `UPDATE vendors SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         address = COALESCE($4, address),
         phone = COALESCE($5, phone),
         image_url = COALESCE($6, image_url),
         delivery_fee = COALESCE($7, delivery_fee),
         minimum_order = COALESCE($8, minimum_order),
         estimated_delivery_time = COALESCE($9, estimated_delivery_time),
         is_open = COALESCE($10, is_open),
         rating = COALESCE($11, rating),
         updated_at = NOW()
       WHERE id = $1
       RETURNING id, owner_id as "ownerId", name, description, address, phone,
                 image_url as "imageUrl", rating::float, delivery_fee::float as "deliveryFee",
                 minimum_order::float as "minimumOrder",
                 estimated_delivery_time as "estimatedDeliveryTime",
                 is_open as "isOpen", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        id,
        data.name ?? null,
        data.description ?? null,
        data.address ?? null,
        data.phone ?? null,
        data.imageUrl ?? null,
        data.deliveryFee ?? null,
        data.minimumOrder ?? null,
        data.estimatedDeliveryTime ?? null,
        data.isOpen !== undefined ? data.isOpen : null,
        data.rating ?? null
      ]
    );

    return res.rows[0] || existing;
  }

  static async deleteVendor(id: string): Promise<boolean> {
    const res = await db.query('DELETE FROM vendors WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new NotFoundError('Vendor not found');
    }
    return true;
  }
}
