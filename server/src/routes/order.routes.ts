import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { CheckoutSchema, OrderStatusSchema } from '../shared/schemas/index.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validateBody(CheckoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderService.createOrder(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await OrderService.getOrders(req.user!.id, req.user!.role);
    res.json({
      success: true,
      data: { orders }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await OrderService.getOrderById(orderId, req.user!.id, req.user!.role);
    res.json({
      success: true,
      data: { order }
    });
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:id/status',
  validateBody(OrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = req.params.id as string;
      const order = await OrderService.updateOrderStatus(
        orderId,
        req.body.status,
        req.user!.role
      );
      res.json({
        success: true,
        message: 'Order status updated',
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await OrderService.cancelOrder(orderId, req.user!.id, req.user!.role);
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const result = await OrderService.reorder(orderId, req.user!.id);
    res.json({
      success: true,
      message: `${result.itemsAdded} item(s) added to cart`,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
