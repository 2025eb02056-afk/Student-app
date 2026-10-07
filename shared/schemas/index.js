"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSchema = exports.NaturalLanguageSearchResponseSchema = exports.NaturalLanguageSearchRequestSchema = exports.AIRecommendationResponseSchema = exports.AIRecommendationRequestSchema = exports.OrderStatusSchema = exports.CheckoutSchema = exports.CartItemSchema = exports.MenuItemSchema = exports.VendorSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// Indian phone number regex: 10 digits starting with 6, 7, 8, or 9
const phoneRegex = /^[6-9]\d{9}$/;
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(120),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').max(100),
    confirmPassword: zod_1.z.string().min(8),
    collegeName: zod_1.z.string().max(200).optional().nullable()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.VendorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    description: zod_1.z.string().max(1000).optional().nullable(),
    address: zod_1.z.string().min(5, 'Address is required'),
    phone: zod_1.z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    deliveryFee: zod_1.z.number().min(0).default(0),
    minimumOrder: zod_1.z.number().min(0).default(0),
    estimatedDeliveryTime: zod_1.z.number().int().min(5).max(120).default(30),
    isOpen: zod_1.z.boolean().default(true)
});
exports.MenuItemSchema = zod_1.z.object({
    vendorId: zod_1.z.string().uuid(),
    categoryId: zod_1.z.string().uuid().optional().nullable(),
    name: zod_1.z.string().min(2).max(150),
    description: zod_1.z.string().max(500).optional().nullable(),
    price: zod_1.z.number().min(0, 'Price must be non-negative'),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    isVegetarian: zod_1.z.boolean().default(false),
    isAvailable: zod_1.z.boolean().default(true),
    preparationTime: zod_1.z.number().int().min(1).max(120).default(15)
});
exports.CartItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
    customization: zod_1.z.object({
        notes: zod_1.z.string().max(250).optional(),
        spiceLevel: zod_1.z.enum(['Mild', 'Medium', 'Extra Spicy']).optional(),
        extraCheese: zod_1.z.boolean().optional()
    }).optional().default({})
});
exports.CheckoutSchema = zod_1.z.object({
    deliveryAddress: zod_1.z.string().min(5, 'Campus Delivery address is required'),
    deliveryInstructions: zod_1.z.string().max(300).optional().nullable(),
    phone: zod_1.z.string().regex(phoneRegex, 'Enter a valid 10-digit phone number'),
    paymentMethod: zod_1.z.enum(['Cash on Delivery', 'UPI / Campus Pay', 'Online / Card'])
});
exports.OrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled'
    ])
});
exports.AIRecommendationRequestSchema = zod_1.z.object({
    budget: zod_1.z.number().min(10).max(5000),
    dietaryPreference: zod_1.z.enum(['veg', 'non-veg', 'any']).default('any'),
    mealType: zod_1.z.string().optional().nullable()
});
exports.AIRecommendationResponseSchema = zod_1.z.object({
    recommendations: zod_1.z.array(zod_1.z.object({
        menuItemId: zod_1.z.string().uuid(),
        reason: zod_1.z.string(),
        price: zod_1.z.number(),
        valueScore: zod_1.z.number()
    })),
    summary: zod_1.z.string()
});
exports.NaturalLanguageSearchRequestSchema = zod_1.z.object({
    userQuery: zod_1.z.string().min(2).max(300)
});
exports.NaturalLanguageSearchResponseSchema = zod_1.z.object({
    interpretedIntent: zod_1.z.object({
        budget: zod_1.z.number().nullable().optional(),
        foodPreference: zod_1.z.string().nullable().optional(),
        mealType: zod_1.z.string().nullable().optional()
    }),
    matchingItems: zod_1.z.array(zod_1.z.object({
        menuItemId: zod_1.z.string().uuid(),
        reason: zod_1.z.string()
    }))
});
exports.EnvSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.string().default('development'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:5173'),
    DATABASE_URL: zod_1.z.string().optional(),
    SESSION_SECRET: zod_1.z.string().default('campus_bites_super_secure_jwt_session_secret_2026'),
    GEMINI_API_KEY: zod_1.z.string().optional()
});
