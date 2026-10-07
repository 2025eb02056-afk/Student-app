import { Router, Request, Response, NextFunction } from 'express';
import { FavoriteService } from '../services/favorite.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await FavoriteService.getFavorites(req.user!.id);
    res.json({
      success: true,
      data: { favorites }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:vendorId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.vendorId as string;
    await FavoriteService.addFavorite(req.user!.id, vendorId);
    res.json({
      success: true,
      message: 'Vendor added to favorites'
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:vendorId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.vendorId as string;
    await FavoriteService.removeFavorite(req.user!.id, vendorId);
    res.json({
      success: true,
      message: 'Vendor removed from favorites'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
