import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { RegisterSchema, LoginSchema } from '../shared/schemas/index.js';

const router = Router();

router.post(
  '/register',
  validateBody(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = await AuthService.register(req.body);
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user, token }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  validateBody(LoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = await AuthService.login(req.body.email, req.body.password);
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullName, avatarUrl, googleUid } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const { user } = await AuthService.loginOrRegisterWithGoogle({
      email,
      fullName: fullName || email.split('@')[0],
      avatarUrl,
      googleUid
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: { user, token }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({
      success: true,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
