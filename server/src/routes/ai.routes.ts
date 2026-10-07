import { Router, Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { validateBody } from '../middleware/validate.js';
import {
  AIRecommendationRequestSchema,
  NaturalLanguageSearchRequestSchema
} from '../shared/schemas/index.js';

const router = Router();

router.post(
  '/budget-recommendations',
  validateBody(AIRecommendationRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { budget, dietaryPreference, mealType } = req.body;
      const result = await AIService.getBudgetRecommendations(
        budget,
        dietaryPreference,
        mealType
      );
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/search',
  validateBody(NaturalLanguageSearchRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userQuery } = req.body;
      const result = await AIService.naturalLanguageFoodSearch(userQuery);
      res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
