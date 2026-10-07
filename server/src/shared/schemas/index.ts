import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(8),
  collegeName: z.string().max(200).optional().nullable()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const VendorSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  deliveryFee: z.number().min(0).default(0),
  minimumOrder: z.number().min(0).default(0),
  estimatedDeliveryTime: z.number().int().min(5).max(120).default(30),
  isOpen: z.boolean().default(true)
});

export const MenuItemSchema = z.object({
  vendorId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional().nullable(),
  price: z.number().min(0, 'Price must be non-negative'),
  imageUrl: z.string().url().optional().nullable(),
  isVegetarian: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().int().min(1).max(120).default(15)
});

export const CartItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  customization: z.object({
    notes: z.string().max(250).optional(),
    spiceLevel: z.enum(['Mild', 'Medium', 'Extra Spicy']).optional(),
    extraCheese: z.boolean().optional()
  }).optional().default({})
});

export const CheckoutSchema = z.object({
  deliveryAddress: z.string().min(5, 'Campus Delivery address is required'),
  deliveryInstructions: z.string().max(300).optional().nullable(),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
  paymentMethod: z.enum(['Cash on Delivery', 'UPI / Campus Pay', 'Online / Card'])
});

export const OrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ])
});

export const AIRecommendationRequestSchema = z.object({
  budget: z.number().min(10).max(5000),
  dietaryPreference: z.enum(['veg', 'non-veg', 'any']).default('any'),
  mealType: z.string().optional().nullable()
});

export const AIRecommendationResponseSchema = z.object({
  recommendations: z.array(z.object({
    menuItemId: z.string().uuid(),
    reason: z.string(),
    price: z.number(),
    valueScore: z.number()
  })),
  summary: z.string()
});

export const NaturalLanguageSearchRequestSchema = z.object({
  userQuery: z.string().min(2).max(300)
});

export const NaturalLanguageSearchResponseSchema = z.object({
  interpretedIntent: z.object({
    budget: z.number().nullable().optional(),
    foodPreference: z.string().nullable().optional(),
    mealType: z.string().nullable().optional()
  }),
  matchingItems: z.array(z.object({
    menuItemId: z.string().uuid(),
    reason: z.string()
  }))
});

export const EnvSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z.string().default('campus_bites_super_secure_jwt_session_secret_2026'),
  GEMINI_API_KEY: z.string().optional()
});
