import { db } from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { Cart, CartItem, MenuItem, Vendor } from '../../../shared/types/index.js';

export class CartService {
  static async getOrCreateCart(userId: string): Promise<string> {
    const res = await db.query<{ id: string }>('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
    const createRes = await db.query<{ id: string }>(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    return createRes.rows[0].id;
  }

  static async getCart(userId: string): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);

    const cartRow = await db.query<{ id: string; vendor_id: string | null }>(
      'SELECT id, vendor_id FROM carts WHERE id = $1',
      [cartId]
    );

    const vendorId = cartRow.rows[0]?.vendor_id;
    let vendor: Vendor | null = null;
    let deliveryFee = 0;

    if (vendorId) {
      const vendorRes = await db.query<Vendor>(
        `SELECT id, name, delivery_fee::float as "deliveryFee", minimum_order::float as "minimumOrder",
                estimated_delivery_time as "estimatedDeliveryTime", is_open as "isOpen",
                image_url as "imageUrl", address, rating::float
         FROM vendors WHERE id = $1`,
        [vendorId]
      );
      if (vendorRes.rows.length > 0) {
        vendor = vendorRes.rows[0];
        deliveryFee = vendor.deliveryFee;
      }
    }

    const itemsRes = await db.query(
      `SELECT ci.id, ci.cart_id as "cartId", ci.menu_item_id as "menuItemId",
              ci.quantity, ci.customization, ci.created_at as "createdAt",
              m.id as "m_id", m.vendor_id as "m_vendorId", m.category_id as "m_categoryId",
              m.name as "m_name", m.description as "m_description", m.price::float as "m_price",
              m.image_url as "m_imageUrl", m.is_vegetarian as "m_isVegetarian",
              m.is_available as "m_isAvailable", m.preparation_time as "m_preparationTime"
       FROM cart_items ci
       JOIN menu_items m ON ci.menu_item_id = m.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    let subtotal = 0;
    const items: CartItem[] = itemsRes.rows.map((row: any) => {
      const itemPrice = Number(row.m_price);
      subtotal += itemPrice * row.quantity;

      const menuItem: MenuItem = {
        id: row.m_id,
        vendorId: row.m_vendorId,
        categoryId: row.m_categoryId,
        name: row.m_name,
        description: row.m_description,
        price: itemPrice,
        imageUrl: row.m_imageUrl,
        isVegetarian: Boolean(row.m_isVegetarian),
        isAvailable: Boolean(row.m_isAvailable),
        preparationTime: row.m_preparationTime,
        createdAt: '',
        updatedAt: ''
      };

      return {
        id: row.id,
        cartId: row.cartId,
        menuItemId: row.menuItemId,
        quantity: row.quantity,
        customization: typeof row.customization === 'string' ? JSON.parse(row.customization) : row.customization || {},
        item: menuItem,
        createdAt: row.createdAt
      };
    });

    // Student Perk: 10% discount if subtotal >= 150
    const discount = subtotal >= 150 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal > 0 ? Math.max(0, subtotal + deliveryFee - discount) : 0;

    return {
      id: cartId,
      userId,
      vendorId: vendor ? vendor.id : null,
      vendor,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: subtotal > 0 ? deliveryFee : 0,
      discount,
      total: Math.round(total * 100) / 100
    };
  }

  static async addItem(
    userId: string,
    menuItemId: string,
    quantity: number,
    customization: any = {}
  ): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);

    // Get item & vendor
    const itemRes = await db.query(
      `SELECT m.id, m.vendor_id as "vendorId", m.name, m.price, m.is_available as "isAvailable",
              v.is_open as "isVendorOpen"
       FROM menu_items m
       JOIN vendors v ON m.vendor_id = v.id
       WHERE m.id = $1`,
      [menuItemId]
    );

    if (itemRes.rows.length === 0) {
      throw new NotFoundError('Food item not found');
    }

    const item = itemRes.rows[0];
    const isAvailable = item.isAvailable ?? item.is_available ?? true;
    const isVendorOpen = item.isVendorOpen ?? item.is_open ?? item.isOpen ?? true;

    if (isAvailable === false) {
      throw new AppError('This food item is currently out of stock', 400);
    }
    if (isVendorOpen === false) {
      throw new AppError('This restaurant is currently closed for orders', 400);
    }

    // Check cart's current vendor
    const cartRes = await db.query('SELECT vendor_id FROM carts WHERE id = $1', [cartId]);
    const currentVendorId = cartRes.rows[0]?.vendor_id ?? cartRes.rows[0]?.vendorId;

    if (currentVendorId && currentVendorId !== item.vendorId) {
      // Clear existing cart if user is adding from a different vendor
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }

    // Update cart vendor
    await db.query(
      'UPDATE carts SET vendor_id = $1, updated_at = NOW() WHERE id = $2',
      [item.vendorId, cartId]
    );

    // Upsert cart_items
    const existingItem = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2',
      [cartId, menuItemId]
    );

    if (existingItem.rows.length > 0) {
      await db.query(
        `UPDATE cart_items SET
           quantity = quantity + $1,
           customization = $2
         WHERE id = $3`,
        [quantity, JSON.stringify(customization), existingItem.rows[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO cart_items (cart_id, menu_item_id, quantity, customization)
         VALUES ($1, $2, $3, $4)`,
        [cartId, menuItemId, quantity, JSON.stringify(customization)]
      );
    }

    return this.getCart(userId);
  }

  static async updateQuantity(userId: string, cartItemId: string, quantity: number): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);

    if (quantity <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    const updateRes = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3',
      [quantity, cartItemId, cartId]
    );

    if (updateRes.rowCount === 0) {
      throw new NotFoundError('Cart item not found');
    }

    return this.getCart(userId);
  }

  static async removeItem(userId: string, cartItemId: string): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);

    await db.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [cartItemId, cartId]);

    // If cart is now empty, clear vendor_id
    const remaining = await db.query('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = $1', [cartId]);
    if (parseInt(remaining.rows[0]?.count || '0', 10) === 0) {
      await db.query('UPDATE carts SET vendor_id = NULL, updated_at = NOW() WHERE id = $1', [cartId]);
    }

    return this.getCart(userId);
  }

  static async clearCart(userId: string): Promise<Cart> {
    const cartId = await this.getOrCreateCart(userId);
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await db.query('UPDATE carts SET vendor_id = NULL, updated_at = NOW() WHERE id = $1', [cartId]);
    return this.getCart(userId);
  }
}
