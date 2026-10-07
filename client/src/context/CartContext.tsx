import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, MenuItem } from '../shared/types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { syncCartToFirestore } from '../services/firestore.js';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (item: MenuItem, quantity?: number, customization?: any) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setAndSyncCart = (c: Cart | null) => {
    setCart(c);
    if (c) {
      syncCartToFirestore(c).catch(() => {});
    }
  };

  const refreshCart = async () => {
    if (!user) {
      // Local storage cart for guest browsing
      const local = localStorage.getItem('cb_local_cart');
      if (local) {
        try {
          setAndSyncCart(JSON.parse(local));
        } catch {
          setAndSyncCart(null);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.data?.cart) {
        setAndSyncCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Failed to fetch cart from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (item: MenuItem, quantity = 1, customization = {}) => {
    if (user) {
      const res = await api.addToCart(item.id, quantity, customization);
      if (res.success && res.data?.cart) {
        setAndSyncCart(res.data.cart);
      }
    } else {
      // Manage local cart for unauthenticated students
      let currentCart: Cart = cart || {
        id: 'local-cart',
        userId: 'guest',
        vendorId: item.vendorId,
        vendor: null,
        items: [],
        subtotal: 0,
        deliveryFee: 10,
        discount: 0,
        total: 0
      };

      // If different vendor, reset items
      if (currentCart.vendorId && currentCart.vendorId !== item.vendorId) {
        currentCart.items = [];
        currentCart.vendorId = item.vendorId;
      }

      const existingIdx = currentCart.items.findIndex(ci => ci.menuItemId === item.id);
      if (existingIdx > -1) {
        currentCart.items[existingIdx].quantity += quantity;
        currentCart.items[existingIdx].customization = customization;
      } else {
        const newItem: CartItem = {
          id: 'local-' + Date.now(),
          cartId: 'local-cart',
          menuItemId: item.id,
          quantity,
          customization,
          item,
          createdAt: new Date().toISOString()
        };
        currentCart.items.push(newItem);
      }

      const subtotal = currentCart.items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
      const discount = subtotal >= 150 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal > 0 ? subtotal + currentCart.deliveryFee - discount : 0;

      currentCart.subtotal = subtotal;
      currentCart.discount = discount;
      currentCart.total = total;

      setAndSyncCart({ ...currentCart });
      localStorage.setItem('cb_local_cart', JSON.stringify(currentCart));
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (user) {
      const res = await api.updateCartItem(cartItemId, quantity);
      if (res.success && res.data?.cart) {
        setAndSyncCart(res.data.cart);
      }
    } else if (cart) {
      let items = [...cart.items];
      if (quantity <= 0) {
        items = items.filter(ci => ci.id !== cartItemId);
      } else {
        const item = items.find(ci => ci.id !== cartItemId);
        if (item) item.quantity = quantity;
      }

      const subtotal = items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
      const discount = subtotal >= 150 ? Math.round(subtotal * 0.1) : 0;
      const total = subtotal > 0 ? subtotal + cart.deliveryFee - discount : 0;

      const updated = {
        ...cart,
        items,
        subtotal,
        discount,
        total
      };
      setAndSyncCart(updated);
      localStorage.setItem('cb_local_cart', JSON.stringify(updated));
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    return updateQuantity(cartItemId, 0);
  };

  const clearCart = async () => {
    if (user) {
      const res = await api.clearCart();
      if (res.success && res.data?.cart) {
        setAndSyncCart(res.data.cart);
      }
    } else {
      setAndSyncCart(null);
      localStorage.removeItem('cb_local_cart');
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
