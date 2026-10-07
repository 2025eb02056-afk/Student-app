import { db } from '../db/index.js';
import { Vendor } from '../shared/types/index.js';

export class FavoriteService {
  static async getFavorites(userId: string): Promise<Vendor[]> {
    const res = await db.query<Vendor>(
      `SELECT v.id, v.owner_id as "ownerId", v.name, v.description, v.address, v.phone,
              v.image_url as "imageUrl", v.rating::float, v.delivery_fee::float as "deliveryFee",
              v.minimum_order::float as "minimumOrder",
              v.estimated_delivery_time as "estimatedDeliveryTime",
              v.is_open as "isOpen", v.created_at as "createdAt", v.updated_at as "updatedAt"
       FROM favorites f
       JOIN vendors v ON f.vendor_id = v.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  static async addFavorite(userId: string, vendorId: string): Promise<boolean> {
    await db.query(
      `INSERT INTO favorites (user_id, vendor_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, vendor_id) DO NOTHING`,
      [userId, vendorId]
    );
    return true;
  }

  static async removeFavorite(userId: string, vendorId: string): Promise<boolean> {
    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND vendor_id = $2',
      [userId, vendorId]
    );
    return true;
  }

  static async isFavorite(userId: string, vendorId: string): Promise<boolean> {
    const res = await db.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND vendor_id = $2',
      [userId, vendorId]
    );
    return res.rows.length > 0;
  }
}
