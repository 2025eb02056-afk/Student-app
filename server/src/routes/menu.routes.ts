import { Router, Request, Response, NextFunction } from 'express';
import { MenuService } from '../services/menu.service.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { MenuItemSchema } from '../shared/schemas/index.js';

const router = Router();

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await MenuService.getCategories();
    res.json({
      success: true,
      data: { categories }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.query.vendorId as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const isVegetarian = req.query.isVegetarian !== undefined ? req.query.isVegetarian === 'true' : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const search = req.query.search as string | undefined;
    const availableOnly = req.query.availableOnly === 'true';
    const sortBy = req.query.sortBy as any;

    const items = await MenuService.getMenuItems({
      vendorId,
      categoryId,
      isVegetarian,
      maxPrice,
      search,
      availableOnly,
      sortBy
    });

    res.json({
      success: true,
      data: { items }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.id as string;
    const item = await MenuService.getMenuItemById(itemId);
    res.json({
      success: true,
      data: { item }
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireRole(['admin', 'vendor']),
  validateBody(MenuItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await MenuService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: { item }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['admin', 'vendor']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = req.params.id as string;
      const item = await MenuService.updateMenuItem(itemId, req.body);
      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: { item }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['admin', 'vendor']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemId = req.params.id as string;
      await MenuService.deleteMenuItem(itemId);
      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
