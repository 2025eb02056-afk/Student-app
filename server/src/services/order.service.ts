import { db } from '../db/index.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { Order, OrderItem, OrderStatus, UserRole } from '../shared/types/index.js';
import { CartService } from './cart.service.js';

export class OrderService {
  static async createOrder(
    userId: string,
    checkoutData: {
      deliveryAddress: string;
      deliveryInstructions?: string | null;
      phone: string;
      paymentMethod: string;
    }
  ): Promise<Order> {
    const cart = await CartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    if (!cart.vendorId || !cart.vendor) {
      throw new AppError('Vendor information is missing for cart items', 400);
    }

    // Check vendor open
    const vendorRes = await db.query('SELECT is_open, minimum_order::float as "minimumOrder" FROM vendors WHERE id = $1', [cart.vendorId]);
    if (vendorRes.rows.length === 0 || !vendorRes.rows[0].is_open) {
      throw new AppError('This vendor is currently closed for orders', 400);
    }

    if (cart.subtotal < vendorRes.rows[0].minimumOrder) {
      throw new AppError(`Minimum order amount for this vendor is ₹${vendorRes.rows[0].minimumOrder}`, 400);
    }

    // Check all items availability and fetch canonical prices
    for (const ci of cart.items) {
      const itemCheck = await db.query(
        'SELECT name, price::float, is_available FROM menu_items WHERE id = $1',
        [ci.menuItemId]
      );
      if (itemCheck.rows.length === 0 || !itemCheck.rows[0].is_available) {
        throw new AppError(`Item "${ci.item.name}" is no longer available. Please remove it from cart.`, 400);
      }
    }

    // Generate unique order number (e.g. CB-L4K9-8231)
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CB-${randomHex}-${randomNum}`;

    // Create Order row
    const orderRes = await db.query<Order>(
      `INSERT INTO orders (
         order_number, user_id, vendor_id, subtotal, delivery_fee, discount, total,
         delivery_address, delivery_instructions, phone, payment_method, payment_status, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
       RETURNING id, order_number as "orderNumber", user_id as "userId", vendor_id as "vendorId",
                 subtotal::float, delivery_fee::float as "deliveryFee", discount::float, total::float,
                 delivery_address as "deliveryAddress", delivery_instructions as "deliveryInstructions",
                 phone, payment_method as "paymentMethod", payment_status as "paymentStatus",
                 status, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        orderNumber,
        userId,
        cart.vendorId,
        cart.subtotal,
        cart.deliveryFee,
        cart.discount,
        cart.total,
        checkoutData.deliveryAddress,
        checkoutData.deliveryInstructions || null,
        checkoutData.phone,
        checkoutData.paymentMethod,
        checkoutData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid'
      ]
    );

    const order = orderRes.rows[0];

    // Create Order Items snapshot
    for (const ci of cart.items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, customization)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          ci.menuItemId,
          ci.item.name,
          ci.item.price,
          ci.quantity,
          JSON.stringify(ci.customization || {})
        ]
      );
    }

    // Clear student's cart
    await CartService.clearCart(userId);

    // Create confirmation notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'Order Placed Successfully! 🎉',
        `Your order #${orderNumber} at ${cart.vendor.name} has been placed. We're getting it confirmed!`,
        'order_status'
      ]
    );

    return this.getOrderById(order.id, userId, 'student');
  }

  static async getOrders(
    userId: string,
    role: UserRole,
    vendorIdFilter?: string
  ): Promise<Order[]> {
    let query = `
      SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId",
             o.vendor_id as "vendorId", v.name as "vendorName",
             o.subtotal::float, o.delivery_fee::float as "deliveryFee",
             o.discount::float, o.total::float,
             o.delivery_address as "deliveryAddress",
             o.delivery_instructions as "deliveryInstructions",
             o.phone, o.payment_method as "paymentMethod",
             o.payment_status as "paymentStatus", o.status,
             o.created_at as "createdAt", o.updated_at as "updatedAt"
      FROM orders o
      JOIN vendors v ON o.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role === 'student') {
      params.push(userId);
      query += ` AND o.user_id = $${params.length}`;
    } else if (role === 'vendor' && vendorIdFilter) {
      params.push(vendorIdFilter);
      query += ` AND o.vendor_id = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const res = await db.query<Order>(query, params);
    return res.rows;
  }

  static async getOrderById(
    orderId: string,
    userId: string,
    role: UserRole
  ): Promise<Order> {
    const res = await db.query(
      `SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId",
              o.vendor_id as "vendorId", v.name as "vendorName",
              o.subtotal::float, o.delivery_fee::float as "deliveryFee",
              o.discount::float, o.total::float,
              o.delivery_address as "deliveryAddress",
              o.delivery_instructions as "deliveryInstructions",
              o.phone, o.payment_method as "paymentMethod",
              o.payment_status as "paymentStatus", o.status,
              o.created_at as "createdAt", o.updated_at as "updatedAt"
       FROM orders o
       JOIN vendors v ON o.vendor_id = v.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundError('Order not found');
    }

    const order = res.rows[0];

    // Authorization checks
    if (role === 'student' && order.userId !== userId) {
      throw new ForbiddenError('You can only view your own orders');
    }

    // Fetch order items
    const itemsRes = await db.query(
      `SELECT id, order_id as "orderId", menu_item_id as "menuItemId",
              item_name as "itemName", unit_price::float as "unitPrice",
              quantity, customization
       FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    order.items = itemsRes.rows.map((row: any) => ({
      ...row,
      customization: typeof row.customization === 'string' ? JSON.parse(row.customization) : row.customization || {}
    }));

    return order;
  }

  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    actorRole: UserRole
  ): Promise<Order> {
    if (actorRole === 'student') {
      throw new ForbiddenError('Students are not authorized to update order status');
    }

    const orderRes = await db.query<{ id: string; user_id: string; order_number: string; vendor_id: string }>(
      'SELECT id, user_id, order_number, vendor_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      throw new NotFoundError('Order not found');
    }

    const order = orderRes.rows[0];

    const updateRes = await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, orderId]
    );

    // Friendly notification message based on status
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Order is under review.',
      confirmed: `Order #${order.order_number} has been confirmed by the kitchen! 🧑‍🍳`,
      preparing: `Your meal #${order.order_number} is being freshly prepared! 🔥`,
      ready: `Order #${order.order_number} is packed and ready for pickup! 📦`,
      out_for_delivery: `Your food #${order.order_number} is on the way to your dorm! 🛵`,
      delivered: `Order #${order.order_number} has been delivered. Enjoy your meal! 😋`,
      cancelled: `Order #${order.order_number} was cancelled.`
    };

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        order.user_id,
        `Order Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        statusMessages[status] || `Status updated to ${status}`,
        'order_status'
      ]
    );

    return this.getOrderById(orderId, order.user_id, 'admin');
  }

  static async cancelOrder(
    orderId: string,
    userId: string,
    role: UserRole
  ): Promise<Order> {
    const existing = await this.getOrderById(orderId, userId, role);

    if (role === 'student' && !['pending', 'confirmed'].includes(existing.status)) {
      throw new AppError('Orders that are already preparing or out for delivery cannot be cancelled', 400);
    }

    await db.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        existing.userId,
        'Order Cancelled',
        `Your order #${existing.orderNumber} has been successfully cancelled.`,
        'order_status'
      ]
    );

    return this.getOrderById(orderId, userId, role);
  }

  static async reorder(orderId: string, userId: string): Promise<{ itemsAdded: number }> {
    const order = await this.getOrderById(orderId, userId, 'student');

    if (!order.items || order.items.length === 0) {
      throw new AppError('No items found in this order to reorder', 400);
    }

    let addedCount = 0;
    for (const item of order.items) {
      if (!item.menuItemId) continue;

      // Check if item is still available
      const check = await db.query(
        'SELECT id, is_available FROM menu_items WHERE id = $1',
        [item.menuItemId]
      );

      if (check.rows.length > 0 && check.rows[0].is_available) {
        await CartService.addItem(
          userId,
          item.menuItemId,
          item.quantity,
          item.customization
        );
        addedCount++;
      }
    }

    if (addedCount === 0) {
      throw new AppError('The items from this previous order are currently unavailable', 400);
    }

    return { itemsAdded: addedCount };
  }
}
