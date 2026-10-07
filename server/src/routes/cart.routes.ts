import { Router, Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { CartItemSchema } from '../shared/schemas/index.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await CartService.getCart(req.user!.id);
    res.json({
      success: true,
      data: { cart }
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/items',
  validateBody(CartItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { menuItemId, quantity, customization } = req.body;
      const cart = await CartService.addItem(req.user!.id, menuItemId, quantity, customization);
      res.json({
        success: true,
        message: 'Item added to cart',
        data: { cart }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/items/:id',
  validateBody(z.object({ quantity: z.number().int() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = req.params.id as string;
      const cart = await CartService.updateQuantity(req.user!.id, itemId, req.body.quantity);
      res.json({
        success: true,
        message: 'Cart updated',
        data: { cart }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id as string;
    const cart = await CartService.removeItem(req.user!.id, itemId);
    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await CartService.clearCart(req.user!.id);
    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
