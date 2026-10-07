import { db } from '../db/index.js';

export class AdminService {
  static async getDashboardStats() {
    const ordersRes = await db.query(`
      SELECT
        COUNT(*) as "totalOrders",
        COALESCE(SUM(total), 0)::float as "totalRevenue",
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as "pendingOrders",
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as "preparingOrders",
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as "deliveredOrders"
      FROM orders
    `);

    const studentsRes = await db.query(`
      SELECT COUNT(*) as "totalStudents" FROM users WHERE role = 'student'
    `);

    const vendorsRes = await db.query(`
      SELECT
        COUNT(*) as "totalVendors",
        COUNT(CASE WHEN is_open = true THEN 1 END) as "activeVendors"
      FROM vendors
    `);

    const recentOrders = await db.query(`
      SELECT o.id, o.order_number as "orderNumber", o.total::float,
             o.status, o.created_at as "createdAt",
             u.full_name as "studentName", u.college_name as "collegeName",
             v.name as "vendorName"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN vendors v ON o.vendor_id = v.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    return {
      stats: {
        totalOrders: parseInt(ordersRes.rows[0]?.totalOrders || '0', 10),
        totalRevenue: Math.round(Number(ordersRes.rows[0]?.totalRevenue || 0) * 100) / 100,
        pendingOrders: parseInt(ordersRes.rows[0]?.pendingOrders || '0', 10),
        preparingOrders: parseInt(ordersRes.rows[0]?.preparingOrders || '0', 10),
        deliveredOrders: parseInt(ordersRes.rows[0]?.deliveredOrders || '0', 10),
        totalStudents: parseInt(studentsRes.rows[0]?.totalStudents || '0', 10),
        totalVendors: parseInt(vendorsRes.rows[0]?.totalVendors || '0', 10),
        activeVendors: parseInt(vendorsRes.rows[0]?.activeVendors || '0', 10)
      },
      recentOrders: recentOrders.rows
    };
  }

  static async getAllOrders(statusFilter?: string) {
    let query = `
      SELECT o.id, o.order_number as "orderNumber", o.user_id as "userId",
             o.vendor_id as "vendorId", v.name as "vendorName",
             o.subtotal::float, o.delivery_fee::float as "deliveryFee",
             o.discount::float, o.total::float,
             o.delivery_address as "deliveryAddress",
             o.delivery_instructions as "deliveryInstructions",
             o.phone, o.payment_method as "paymentMethod",
             o.payment_status as "paymentStatus", o.status,
             o.created_at as "createdAt", o.updated_at as "updatedAt",
             u.full_name as "studentName", u.email as "studentEmail", u.college_name as "collegeName"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN vendors v ON o.vendor_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'all') {
      params.push(statusFilter);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const res = await db.query(query, params);

    // Fetch items for each order
    for (const order of res.rows) {
      const items = await db.query(
        `SELECT id, item_name as "itemName", unit_price::float as "unitPrice", quantity, customization
         FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      order.items = items.rows;
    }

    return res.rows;
  }

  static async getAllStudents() {
    const res = await db.query(`
      SELECT u.id, u.full_name as "fullName", u.email, u.phone,
             u.college_name as "collegeName", u.role, u.created_at as "createdAt",
             COUNT(o.id) as "orderCount",
             COALESCE(SUM(o.total), 0)::float as "totalSpent"
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }

  static async getAnalytics() {
    // Top selling items
    const topItems = await db.query(`
      SELECT oi.item_name as "name", SUM(oi.quantity) as "ordersCount",
             SUM(oi.quantity * oi.unit_price)::float as "totalSales"
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.item_name
      ORDER BY "ordersCount" DESC
      LIMIT 5
    `);

    // Vendor volume
    const vendorPerformance = await db.query(`
      SELECT v.name, COUNT(o.id) as "orderCount",
             COALESCE(SUM(o.total), 0)::float as "revenue"
      FROM vendors v
      LEFT JOIN orders o ON v.id = o.vendor_id
      GROUP BY v.id, v.name
      ORDER BY "revenue" DESC
      LIMIT 6
    `);

    return {
      topItems: topItems.rows,
      vendorPerformance: vendorPerformance.rows
    };
  }
}
