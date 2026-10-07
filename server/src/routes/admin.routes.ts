import { Router, Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes: only admin or vendor can access
router.use(authenticate);
router.use(requireRole(['admin', 'vendor']));

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getDashboardStats();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const orders = await AdminService.getAllOrders(status);
    res.json({
      success: true,
      data: { orders }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', requireRole(['admin']), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await AdminService.getAllStudents();
    res.json({
      success: true,
      data: { students }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AdminService.getAnalytics();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

export default router;
