import { db } from '../db/index.js';
import { Notification } from '../shared/types/index.js';

export class NotificationService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    const res = await db.query<Notification>(
      `SELECT id, user_id as "userId", title, message, type,
              is_read as "isRead", created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    return res.rows;
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    return true;
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
    return true;
  }
}
