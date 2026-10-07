import crypto from 'crypto';
import { User, Vendor, Category, MenuItem, Cart, CartItem, Order, OrderItem, Notification } from '../shared/types/index.js';

// In-memory data collections initialized with seed data
export class MemoryStore {
  users: Map<string, any> = new Map();
  vendors: Map<string, any> = new Map();
  categories: Map<string, Category> = new Map();
  menuItems: Map<string, any> = new Map();
  carts: Map<string, { id: string; userId: string; vendorId: string | null; updatedAt: string }> = new Map();
  cartItems: Map<string, any> = new Map();
  orders: Map<string, any> = new Map();
  orderItems: Map<string, any> = new Map();
  favorites: Map<string, { id: string; userId: string; vendorId: string; createdAt: string }> = new Map();
  notifications: Map<string, Notification> = new Map();

  constructor() {
    this.seed();
  }

  seed() {
    // Categories
    const categoriesData = [
      { id: '11111111-0000-0000-0000-000000000001', name: 'Breakfast' },
      { id: '11111111-0000-0000-0000-000000000002', name: 'Lunch' },
      { id: '11111111-0000-0000-0000-000000000003', name: 'Dinner' },
      { id: '11111111-0000-0000-0000-000000000004', name: 'Snacks' },
      { id: '11111111-0000-0000-0000-000000000005', name: 'Fast Food' },
      { id: '11111111-0000-0000-0000-000000000006', name: 'Beverages' },
      { id: '11111111-0000-0000-0000-000000000007', name: 'Desserts' },
      { id: '11111111-0000-0000-0000-000000000008', name: 'South Indian' },
      { id: '11111111-0000-0000-0000-000000000009', name: 'North Indian' },
      { id: '11111111-0000-0000-0000-000000000010', name: 'Chinese' },
      { id: '11111111-0000-0000-0000-000000000011', name: 'Pizza' },
      { id: '11111111-0000-0000-0000-000000000012', name: 'Burgers' },
      { id: '11111111-0000-0000-0000-000000000013', name: 'Biryani' },
      { id: '11111111-0000-0000-0000-000000000014', name: 'Healthy' },
      { id: '11111111-0000-0000-0000-000000000015', name: 'Budget Meals' }
    ];

    categoriesData.forEach(c => {
      this.categories.set(c.id, { id: c.id, name: c.name, createdAt: new Date().toISOString() });
    });

    // Users (Password: Student123! and Admin123!)
    // Hash: $2b$10$w4f9G42gYy1R07QWd6x5y.uR.U3U3pGgZ0X/JeqX4pkm90c0Xk12G
    const usersData = [
      {
        id: '22222222-0000-0000-0000-000000000001',
        fullName: 'Super Admin',
        email: 'admin@campusbites.edu',
        phone: '9876543210',
        passwordHash: '$2b$10$aP910A5jy5rk0LLLnyH6sOyOPC4cwmkhMy6fxhM31XqkMBW9YkTOy',
        collegeName: 'Campus Central HQ',
        role: 'admin'
      },
      {
        id: '22222222-0000-0000-0000-000000000002',
        fullName: 'Campus Canteen Manager',
        email: 'canteen@campusbites.edu',
        phone: '9876543211',
        passwordHash: '$2b$10$aP910A5jy5rk0LLLnyH6sOyOPC4cwmkhMy6fxhM31XqkMBW9YkTOy',
        collegeName: 'University North Campus',
        role: 'vendor'
      },
      {
        id: '22222222-0000-0000-0000-000000000003',
        fullName: 'Arjun Sharma',
        email: 'arjun.sharma@campusbites.edu',
        phone: '9876543212',
        passwordHash: '$2b$10$aP910A5jy5rk0LLLnyH6sOyOPC4cwmkhMy6fxhM31XqkMBW9YkTOy',
        collegeName: 'Apex Institute of Technology',
        role: 'student'
      },
      {
        id: '22222222-0000-0000-0000-000000000004',
        fullName: 'Priya Patel',
        email: 'priya.patel@campusbites.edu',
        phone: '9876543213',
        passwordHash: '$2b$10$aP910A5jy5rk0LLLnyH6sOyOPC4cwmkhMy6fxhM31XqkMBW9YkTOy',
        collegeName: 'National College of Engineering',
        role: 'student'
      }
    ];

    usersData.forEach(u => {
      this.users.set(u.id, {
        ...u,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      if (u.role === 'student') {
        const cartId = crypto.randomUUID();
        this.carts.set(u.id, { id: cartId, userId: u.id, vendorId: null, updatedAt: new Date().toISOString() });
      }
    });

    // Vendors
    const vendorsData = [
      {
        id: '33333333-0000-0000-0000-000000000001',
        ownerId: '22222222-0000-0000-0000-000000000002',
        name: 'Campus Canteen Central',
        description: 'The heart of campus dining. Hot thalis, fresh parathas, and daily budget student specials.',
        address: 'Student Center Ground Floor, North Block',
        phone: '9876543220',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        deliveryFee: 10.00,
        minimumOrder: 40.00,
        estimatedDeliveryTime: 15,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000002',
        ownerId: null,
        name: 'Anna South Indian Spot',
        description: 'Crispy dosas, steaming soft idlis, and authentic piping hot filter coffee.',
        address: 'Gate 3 Food Plaza, University Avenue',
        phone: '9876543221',
        imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        deliveryFee: 15.00,
        minimumOrder: 50.00,
        estimatedDeliveryTime: 20,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000003',
        ownerId: null,
        name: 'The Dorm Pizza Co.',
        description: 'Stone-oven student slices, cheesy garlic sticks, and midnight study combos.',
        address: 'Commercial Complex, Stall 12, West Gate',
        phone: '9876543222',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        rating: 4.6,
        deliveryFee: 20.00,
        minimumOrder: 99.00,
        estimatedDeliveryTime: 25,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000004',
        ownerId: null,
        name: 'Wok & Roll Chinese Point',
        description: 'Fast wok-tossed Hakka noodles, crispy momos, and spicy chili garlic bowls.',
        address: 'Hostel Ring Road, Kiosk 5',
        phone: '9876543223',
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
        rating: 4.5,
        deliveryFee: 15.00,
        minimumOrder: 60.00,
        estimatedDeliveryTime: 20,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000005',
        ownerId: null,
        name: 'Roll Nation & Kebabs',
        description: 'Loaded Kolkata kathi rolls, paneer tikka wraps, and crispy egg rolls under ₹99.',
        address: 'Near Library Lawn, Gate 2',
        phone: '9876543224',
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        deliveryFee: 10.00,
        minimumOrder: 50.00,
        estimatedDeliveryTime: 15,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000006',
        ownerId: null,
        name: 'Chai Shai & Maggi Hub',
        description: 'Midnight study fuel, ginger cardamom tea, double-masala maggi, and crispy samosas.',
        address: 'Backyard Quad, Hostel 4 Exit',
        phone: '9876543225',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        deliveryFee: 5.00,
        minimumOrder: 30.00,
        estimatedDeliveryTime: 10,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000007',
        ownerId: null,
        name: 'Green Bowl & Fresh Sips',
        description: 'Protein salad bowls, wholesome fruit juices, oats bowls, and grilled sandwiches.',
        address: 'Sports Complex Annex',
        phone: '9876543226',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        deliveryFee: 15.00,
        minimumOrder: 80.00,
        estimatedDeliveryTime: 20,
        isOpen: true
      },
      {
        id: '33333333-0000-0000-0000-000000000008',
        ownerId: null,
        name: 'Royal Biryani Pot',
        description: 'Aromatic Hyderabadi dum biryani with raita and mirchi ka salan in student portions.',
        address: 'Outer Ring Road, Food Mile',
        phone: '9876543227',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        deliveryFee: 20.00,
        minimumOrder: 110.00,
        estimatedDeliveryTime: 25,
        isOpen: true
      }
    ];

    vendorsData.forEach(v => {
      this.vendors.set(v.id, {
        ...v,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Menu Items
    const menuItemsData = [
      // Campus Canteen Central
      {
        id: '44444444-0000-0000-0000-000000000001',
        vendorId: '33333333-0000-0000-0000-000000000001',
        categoryId: '11111111-0000-0000-0000-000000000015',
        name: 'Deluxe Student Thali',
        description: '2 Butter rotis, paneer sabzi, dal tadka, jeera rice, salad & gulab jamun.',
        price: 99.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 12
      },
      {
        id: '44444444-0000-0000-0000-000000000002',
        vendorId: '33333333-0000-0000-0000-000000000001',
        categoryId: '11111111-0000-0000-0000-000000000015',
        name: 'Chole Bhature (2 Pcs)',
        description: 'Spiced Amritsari chole served with two fluffy golden bhature, pickles & onions.',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        id: '44444444-0000-0000-0000-000000000003',
        vendorId: '33333333-0000-0000-0000-000000000001',
        categoryId: '11111111-0000-0000-0000-000000000001',
        name: 'Aloo Paratha with Curd',
        description: 'Stuffed whole wheat paratha crisped with butter, served with chilled curd & mint chutney.',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 8
      },
      {
        id: '44444444-0000-0000-0000-000000000004',
        vendorId: '33333333-0000-0000-0000-000000000001',
        categoryId: '11111111-0000-0000-0000-000000000009',
        name: 'Paneer Butter Masala Meal',
        description: 'Rich creamy paneer butter masala paired with 3 tawa rotis and pickled salad.',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 15
      },
      {
        id: '44444444-0000-0000-0000-000000000005',
        vendorId: '33333333-0000-0000-0000-000000000001',
        categoryId: '11111111-0000-0000-0000-000000000015',
        name: 'Rajma Chawal Combo',
        description: 'Homestyle slow-cooked spiced rajma served over fragrant basmati rice.',
        price: 60.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 8
      },
      // Anna South Indian Spot
      {
        id: '44444444-0000-0000-0000-000000000006',
        vendorId: '33333333-0000-0000-0000-000000000002',
        categoryId: '11111111-0000-0000-0000-000000000008',
        name: 'Crispy Masala Dosa',
        description: 'Golden thin crepe filled with spiced potato masala, served with coconut chutney & sambar.',
        price: 55.00,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        id: '44444444-0000-0000-0000-000000000007',
        vendorId: '33333333-0000-0000-0000-000000000002',
        categoryId: '11111111-0000-0000-0000-000000000008',
        name: 'Steaming Idli Sambar (3 Pcs)',
        description: 'Melt-in-mouth steamed rice cakes soaked in flavorful hot lentil sambar.',
        price: 40.00,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 5
      },
      {
        id: '44444444-0000-0000-0000-000000000008',
        vendorId: '33333333-0000-0000-0000-000000000002',
        categoryId: '11111111-0000-0000-0000-000000000006',
        name: 'Madras Filter Coffee',
        description: 'Traditional strong decoction brew frothy filter coffee.',
        price: 25.00,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 5
      },
      // The Dorm Pizza Co.
      {
        id: '44444444-0000-0000-0000-000000000010',
        vendorId: '33333333-0000-0000-0000-000000000003',
        categoryId: '11111111-0000-0000-0000-000000000011',
        name: 'Margherita Personal Pizza (7 Inch)',
        description: 'Fresh mozzarella, herbaceous basil, tangy crushed tomato sauce on crispy crust.',
        price: 89.00,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 15
      },
      {
        id: '44444444-0000-0000-0000-000000000011',
        vendorId: '33333333-0000-0000-0000-000000000003',
        categoryId: '11111111-0000-0000-0000-000000000011',
        name: 'Loaded Veggie Overload (7 Inch)',
        description: 'Bell peppers, red onion, golden corn, jalapeños, and melted cheese blend.',
        price: 119.00,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 18
      },
      // Roll Nation & Kebabs
      {
        id: '44444444-0000-0000-0000-000000000016',
        vendorId: '33333333-0000-0000-0000-000000000005',
        categoryId: '11111111-0000-0000-0000-000000000005',
        name: 'Paneer Tikka Kathi Roll',
        description: 'Charcoal-grilled spiced paneer wrapped in flaky paratha with sliced onions & mint yogurt.',
        price: 75.00,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        id: '44444444-0000-0000-0000-000000000017',
        vendorId: '33333333-0000-0000-0000-000000000005',
        categoryId: '11111111-0000-0000-0000-000000000005',
        name: 'Double Egg Roll',
        description: 'Crisp flaky roll lined with fluffy eggs, crunchy sliced onion, green chilies, and lemon tang.',
        price: 50.00,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        isVegetarian: false,
        isAvailable: true,
        preparationTime: 8
      },
      // Chai Shai & Maggi Hub
      {
        id: '44444444-0000-0000-0000-000000000019',
        vendorId: '33333333-0000-0000-0000-000000000006',
        categoryId: '11111111-0000-0000-0000-000000000004',
        name: 'Double Cheese Masala Maggi',
        description: 'The student holy grail: 2-minute noodles tossed with spicy veggie masala & melted cheddar.',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 7
      },
      {
        id: '44444444-0000-0000-0000-000000000020',
        vendorId: '33333333-0000-0000-0000-000000000006',
        categoryId: '11111111-0000-0000-0000-000000000006',
        name: 'Kulhad Adrak Chai (Large)',
        description: 'Slow-simmered rich milk tea with fresh crushed ginger and cardamom in earthen clay cup.',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 5
      },
      // Royal Biryani Pot
      {
        id: '44444444-0000-0000-0000-000000000022',
        vendorId: '33333333-0000-0000-0000-000000000008',
        categoryId: '11111111-0000-0000-0000-000000000013',
        name: 'Chicken Dum Biryani (Student Pack)',
        description: 'Aromatic long-grain basmati layered with tender spiced chicken, served with raita.',
        price: 129.00,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isVegetarian: false,
        isAvailable: true,
        preparationTime: 15
      },
      {
        id: '44444444-0000-0000-0000-000000000023',
        vendorId: '33333333-0000-0000-0000-000000000008',
        categoryId: '11111111-0000-0000-0000-000000000013',
        name: 'Hyderabadi Veg Dum Biryani',
        description: 'Slow-cooked fragrant biryani loaded with fresh vegetables, paneer cubes, saffron & mint.',
        price: 99.00,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 12
      }
    ];

    menuItemsData.forEach(m => {
      this.menuItems.set(m.id, {
        ...m,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Sample Orders for history & admin analytics
    const sampleOrder1 = {
      id: '55555555-0000-0000-0000-000000000001',
      orderNumber: 'CB-8921-9481',
      userId: '22222222-0000-0000-0000-000000000003',
      vendorId: '33333333-0000-0000-0000-000000000001',
      subtotal: 174.00,
      deliveryFee: 10.00,
      discount: 17.00,
      total: 167.00,
      deliveryAddress: 'Maple Hall 3rd Floor, Room 304, North Campus',
      deliveryInstructions: 'Call upon arrival at lobby front desk',
      phone: '9876543212',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'pending',
      status: 'out_for_delivery',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.set(sampleOrder1.id, sampleOrder1);

    this.orderItems.set(crypto.randomUUID(), {
      id: crypto.randomUUID(),
      orderId: sampleOrder1.id,
      menuItemId: '44444444-0000-0000-0000-000000000001',
      itemName: 'Deluxe Student Thali',
      unitPrice: 99.00,
      quantity: 1,
      customization: { notes: 'Extra butter on roti' }
    });
    this.orderItems.set(crypto.randomUUID(), {
      id: crypto.randomUUID(),
      orderId: sampleOrder1.id,
      menuItemId: '44444444-0000-0000-0000-000000000002',
      itemName: 'Chole Bhature (2 Pcs)',
      unitPrice: 75.00,
      quantity: 1,
      customization: {}
    });

    // Sample Notification
    const notifId = crypto.randomUUID();
    this.notifications.set(notifId, {
      id: notifId,
      userId: '22222222-0000-0000-0000-000000000003',
      title: 'Order Dispatched! 🛵',
      message: 'Order #CB-8921-9481 is out for delivery with our quad runner.',
      type: 'order_status',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }
}

export const memoryStore = new MemoryStore();
