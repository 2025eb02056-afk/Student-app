import { Router, Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user!.id);
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notificationId = req.params.id as string;
    await NotificationService.markAsRead(notificationId, req.user!.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
