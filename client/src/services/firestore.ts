import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { firebaseConfig } from "./firebase.js";
import { User, Vendor, MenuItem, Cart, Order } from "../shared/types/index.js";

// Initialize Cloud Firestore safely
const appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(appInstance);

/**
 * Sync user profile to Firestore "users" collection
 */
export async function syncUserToFirestore(user: Partial<User> & { id: string }): Promise<void> {
  try {
    const userRef = doc(firestore, "users", user.id);
    await setDoc(userRef, {
      ...user,
      lastActive: serverTimestamp(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] Synced user to "users/${user.id}"`);
  } catch (err: any) {
    console.warn("⚠️ [Firestore] Failed to sync user:", err.message);
  }
}

/**
 * Sync active cart to Firestore "carts" collection
 */
export async function syncCartToFirestore(cart: Partial<Cart> & { userId?: string; id?: string }): Promise<void> {
  const cartKey = cart.userId || cart.id || "guest-cart";
  try {
    const cartRef = doc(firestore, "carts", cartKey);
    await setDoc(cartRef, {
      ...cart,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] Synced cart to "carts/${cartKey}"`);
  } catch (err: any) {
    console.warn("⚠️ [Firestore] Failed to sync cart:", err.message);
  }
}

/**
 * Save new or updated order to Firestore "orders" collection
 */
export async function syncOrderToFirestore(order: Partial<Order> & { id: string }): Promise<void> {
  try {
    const orderRef = doc(firestore, "orders", order.id);
    await setDoc(orderRef, {
      ...order,
      syncedAt: serverTimestamp(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ [Firestore] Created order in "orders/${order.id}"`);
  } catch (err: any) {
    console.warn("⚠️ [Firestore] Failed to sync order:", err.message);
  }
}

/**
 * Auto-seed initial Firestore collections ("vendors", "menu_items", "categories", "users", "orders")
 * so the tables and documents exist immediately in Firebase Console.
 */
export async function autoSeedFirestoreCollections(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("⚡ [Firestore] Initializing & syncing collections to studentfood-app...");

    // 1. Seed Categories
    const categories = [
      { id: "11111111-0000-0000-0000-000000000001", name: "Breakfast" },
      { id: "11111111-0000-0000-0000-000000000002", name: "Lunch" },
      { id: "11111111-0000-0000-0000-000000000003", name: "Dinner" },
      { id: "11111111-0000-0000-0000-000000000004", name: "Snacks" },
      { id: "11111111-0000-0000-0000-000000000005", name: "Fast Food" },
      { id: "11111111-0000-0000-0000-000000000006", name: "Beverages" },
      { id: "11111111-0000-0000-0000-000000000015", name: "Budget Meals" }
    ];
    for (const cat of categories) {
      await setDoc(doc(firestore, "categories", cat.id), {
        ...cat,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    // 2. Seed Vendors
    const vendors = [
      {
        id: "33333333-0000-0000-0000-000000000001",
        name: "Campus Canteen Central",
        description: "The heart of campus dining. Hot thalis, fresh parathas, and daily budget student specials.",
        address: "Student Center Ground Floor, North Block",
        phone: "9876543220",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        rating: 4.8,
        deliveryFee: 10,
        minimumOrder: 40,
        estimatedDeliveryTime: 15,
        isOpen: true
      },
      {
        id: "33333333-0000-0000-0000-000000000003",
        name: "The Dorm Pizza Co.",
        description: "Stone-oven student slices, cheesy garlic sticks, and midnight study combos.",
        address: "Commercial Complex, Stall 12, West Gate",
        phone: "9876543222",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        rating: 4.6,
        deliveryFee: 20,
        minimumOrder: 99,
        estimatedDeliveryTime: 25,
        isOpen: true
      },
      {
        id: "33333333-0000-0000-0000-000000000005",
        name: "Roll Nation & Kebabs",
        description: "Loaded Kolkata kathi rolls, paneer tikka wraps, and crispy egg rolls under ₹99.",
        address: "Near Library Lawn, Gate 2",
        phone: "9876543224",
        imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
        rating: 4.9,
        deliveryFee: 10,
        minimumOrder: 50,
        estimatedDeliveryTime: 15,
        isOpen: true
      },
      {
        id: "33333333-0000-0000-0000-000000000006",
        name: "Chai Shai & Maggi Hub",
        description: "Midnight study fuel, ginger cardamom tea, double-masala maggi, and crispy samosas.",
        address: "Backyard Quad, Hostel 4 Exit",
        phone: "9876543225",
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
        rating: 4.9,
        deliveryFee: 5,
        minimumOrder: 30,
        estimatedDeliveryTime: 10,
        isOpen: true
      }
    ];
    for (const v of vendors) {
      await setDoc(doc(firestore, "vendors", v.id), {
        ...v,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 3. Seed Menu Items
    const menuItems = [
      {
        id: "44444444-0000-0000-0000-000000000001",
        vendorId: "33333333-0000-0000-0000-000000000001",
        categoryId: "11111111-0000-0000-0000-000000000015",
        name: "Deluxe Student Thali",
        description: "2 Butter rotis, paneer sabzi, dal tadka, jeera rice, salad & gulab jamun.",
        price: 99,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 12
      },
      {
        id: "44444444-0000-0000-0000-000000000002",
        vendorId: "33333333-0000-0000-0000-000000000001",
        categoryId: "11111111-0000-0000-0000-000000000015",
        name: "Chole Bhature (2 Pcs)",
        description: "Spiced Amritsari chole served with two fluffy golden bhature, pickles & onions.",
        price: 75,
        imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 10
      },
      {
        id: "44444444-0000-0000-0000-000000000010",
        vendorId: "33333333-0000-0000-0000-000000000003",
        categoryId: "11111111-0000-0000-0000-000000000005",
        name: "Margherita Personal Pizza (7 Inch)",
        description: "Fresh mozzarella, herbaceous basil, tangy crushed tomato sauce on crispy crust.",
        price: 89,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 15
      },
      {
        id: "44444444-0000-0000-0000-000000000020",
        vendorId: "33333333-0000-0000-0000-000000000006",
        categoryId: "11111111-0000-0000-0000-000000000006",
        name: "Kulhad Adrak Chai (Large)",
        description: "Slow-simmered rich milk tea with fresh crushed ginger and cardamom in earthen clay cup.",
        price: 20,
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
        isVegetarian: true,
        isAvailable: true,
        preparationTime: 5
      }
    ];
    for (const m of menuItems) {
      await setDoc(doc(firestore, "menu_items", m.id), {
        ...m,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 4. Seed Demo Users
    const users = [
      {
        id: "22222222-0000-0000-0000-000000000003",
        fullName: "Arjun Sharma",
        email: "arjun.sharma@campusbites.edu",
        phone: "9876543212",
        collegeName: "Apex Institute of Technology",
        role: "student"
      },
      {
        id: "22222222-0000-0000-0000-000000000001",
        fullName: "Super Admin",
        email: "admin@campusbites.edu",
        phone: "9876543210",
        collegeName: "Campus Central HQ",
        role: "admin"
      }
    ];
    for (const u of users) {
      await setDoc(doc(firestore, "users", u.id), {
        ...u,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 5. Seed Sample Order
    const sampleOrder = {
      id: "55555555-0000-0000-0000-000000000001",
      orderNumber: "CB-8921-9481",
      userId: "22222222-0000-0000-0000-000000000003",
      vendorId: "33333333-0000-0000-0000-000000000001",
      subtotal: 174,
      deliveryFee: 10,
      discount: 17,
      total: 167,
      deliveryAddress: "Maple Hall 3rd Floor, Room 304, North Campus",
      phone: "9876543212",
      paymentMethod: "Campus Cash",
      paymentStatus: "paid",
      status: "out_for_delivery",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(firestore, "orders", sampleOrder.id), sampleOrder, { merge: true });

    // 6. Seed Sample Cart
    await setDoc(doc(firestore, "carts", "22222222-0000-0000-0000-000000000003"), {
      id: "cart-sample-01",
      userId: "22222222-0000-0000-0000-000000000003",
      vendorId: "33333333-0000-0000-0000-000000000001",
      subtotal: 99,
      deliveryFee: 10,
      total: 109,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log("🔥 [Firestore] Successfully created & populated collections: users, orders, vendors, menu_items, categories, carts!");
    return { success: true, message: "Firestore collections created successfully!" };
  } catch (err: any) {
    console.warn("⚠️ [Firestore] Auto-seed note:", err.message);
    return { success: false, message: err.message };
  }
}
