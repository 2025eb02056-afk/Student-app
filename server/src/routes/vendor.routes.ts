import { Router, Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/vendor.service.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { VendorSchema } from '../shared/schemas/index.js';

const router = Router();

router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const isOpenOnly = req.query.isOpen === 'true';
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const maxDeliveryFee = req.query.maxDeliveryFee ? parseFloat(req.query.maxDeliveryFee as string) : undefined;
    const sortBy = req.query.sortBy as any;

    const vendors = await VendorService.getVendors({
      search,
      isOpenOnly,
      minRating,
      maxDeliveryFee,
      sortBy
    });

    res.json({
      success: true,
      data: { vendors }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendorId = req.params.id as string;
    const vendor = await VendorService.getVendorById(vendorId);
    res.json({
      success: true,
      data: { vendor }
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireRole(['admin', 'vendor']),
  validateBody(VendorSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vendor = await VendorService.createVendor({
        ...req.body,
        ownerId: req.user!.id
      });
      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: { vendor }
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
      const vendorId = req.params.id as string;
      const vendor = await VendorService.updateVendor(vendorId, req.body);
      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: { vendor }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vendorId = req.params.id as string;
      await VendorService.deleteVendor(vendorId);
      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
