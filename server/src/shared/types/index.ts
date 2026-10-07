export type UserRole = 'student' | 'vendor' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  ownerId?: string | null;
  name: string;
  description?: string | null;
  address: string;
  phone?: string | null;
  imageUrl?: string | null;
  rating: number;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isVegetarian: boolean;
  isAvailable: boolean;
  preparationTime: number;
  categoryName?: string;
  vendorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemCustomization {
  notes?: string;
  spiceLevel?: 'Mild' | 'Medium' | 'Extra Spicy';
  extraCheese?: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  customization?: CartItemCustomization;
  item: MenuItem;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  vendorId?: string | null;
  vendor?: Vendor | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  itemName: string;
  unitPrice: number;
  quantity: number;
  customization?: CartItemCustomization;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  vendorId: string;
  vendorName?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  deliveryInstructions?: string | null;
  phone: string;
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AIRecommendationItem {
  menuItemId: string;
  reason: string;
  price: number;
  valueScore: number;
  menuItem?: MenuItem;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendationItem[];
  summary: string;
}

export interface NaturalLanguageSearchResponse {
  interpretedIntent: {
    budget: number | null;
    foodPreference: string | null;
    mealType: string | null;
  };
  matchingItems: {
    menuItemId: string;
    reason: string;
    menuItem?: MenuItem;
  }[];
}
