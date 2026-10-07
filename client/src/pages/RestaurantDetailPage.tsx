import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { Vendor, MenuItem, Category } from '../shared/types/index.js';
import { FoodCustomizerModal } from '../components/food/FoodCustomizerModal.js';

export const RestaurantDetailPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return;
      try {
        setLoading(true);
        const [vRes, mRes, cRes] = await Promise.all([
          api.getVendorById(vendorId),
          api.getMenuItems({ vendorId, availableOnly: false }),
          api.getCategories()
        ]);

        if (vRes.success) setVendor(vRes.data.vendor);
        if (mRes.success) setMenuItems(mRes.data.items || []);
        if (cRes.success) setCategories(cRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [vendorId]);

  const toggleFavorite = async () => {
    if (!vendorId) return;
    try {
      if (isFavorite) {
        await api.removeFavorite(vendorId);
        setIsFavorite(false);
      } else {
        await api.addFavorite(vendorId);
        setIsFavorite(true);
      }
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.categoryId === selectedCategory);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Loading Restaurant Menu...</span>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8 text-center">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Restaurant Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-full bg-primary-container text-on-primary font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-24">
      {/* 1. Restaurant Banner Card */}
      <section className="relative w-full bg-surface-container-low overflow-hidden">
        <div className="relative w-full h-56 max-w-4xl mx-auto">
          <img
            className="w-full h-full object-cover"
            src={vendor.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
            alt={vendor.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/30 to-transparent"></div>

          {/* Top Quick Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/95 text-on-surface shadow-md font-label-sm text-label-sm backdrop-blur-sm">
              <span className="material-symbols-outlined text-secondary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              {vendor.rating} <span className="text-on-surface-variant font-normal">(1,240 campus orders)</span>
            </span>

            <button
              onClick={toggleFavorite}
              aria-label="Favorite"
              className="w-9 h-9 rounded-full bg-surface-container-lowest/90 text-primary flex items-center justify-center shadow-md pointer-events-auto active:scale-90 transition-transform"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>

          {/* Bottom Hero Text */}
          <div className="absolute bottom-3 left-margin-mobile right-margin-mobile flex flex-col gap-1 text-surface max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-semibold">
                Campus Hotspot
              </span>
              <span className="text-surface-container-highest font-label-sm text-label-sm flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">bolt</span> {vendor.estimatedDeliveryTime} min
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-surface-container-lowest tracking-tight">
              {vendor.name}
            </h2>
            <p className="font-body-sm text-body-sm text-surface-container-highest line-clamp-1">
              {vendor.address} • Min Order: ₹{vendor.minimumOrder}
            </p>
          </div>
        </div>

        {/* Perks Row */}
        <div className="px-margin-mobile py-space-sm flex flex-wrap gap-space-xs max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[16px]">school</span>
            15% Student Discount Applied (orders &gt; ₹150)
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
            Fast Quad Dropoff (₹{vendor.deliveryFee} Fee)
          </div>
        </div>
      </section>

      {/* 2. Campus Meal Plan / Dining Dollars Badge Bar */}
      <section className="px-margin-mobile my-space-sm max-w-4xl mx-auto w-full">
        <div className="w-full bg-secondary-fixed/50 rounded-DEFAULT p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-bold text-on-secondary-fixed">
                Campus Dining Dollars & Cash Accepted
              </span>
              <span className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
                Direct Quad delivery to dorm reception desk
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
      </section>

      {/* 3. Sticky Category Navigation Pills */}
      <nav className="sticky top-28 z-30 bg-surface/95 backdrop-blur-md py-space-xs px-margin-mobile overflow-x-auto no-scrollbar shadow-[0_2px_8px_rgba(0,0,0,0.03)] border-b border-surface-container/50">
        <div className="flex gap-2 min-w-max max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-label-md text-label-md shadow-sm active:scale-95 transition-transform flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            All Items ({menuItems.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-label-md text-label-md active:scale-95 transition-transform ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. Featured Student Value Items Grid */}
      <section className="px-margin-mobile mt-space-md flex flex-col gap-space-md max-w-4xl mx-auto w-full">
        <div className="flex items-baseline justify-between">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Student Value Combos & Meals</h3>
          <span className="font-label-sm text-label-sm text-primary font-semibold">Budget-Friendly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="w-full bg-surface-container-lowest rounded-lg p-space-sm flex flex-col gap-3 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] relative overflow-hidden group justify-between"
            >
              <div className="relative w-full h-40 rounded-DEFAULT overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold shadow-sm">
                    {item.isVegetarian ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                  </span>
                  {item.price <= 99 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm font-semibold shadow-sm">
                      Under ₹100
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {item.name}
                  </h4>
                  <div className="text-right flex flex-col shrink-0">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">₹{item.price}</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant line-through">
                      ₹{Math.round(item.price * 1.25)}
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-surface-container/50">
                <button
                  onClick={() => setSelectedItemForModal(item)}
                  className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Customize base & add-ons
                </button>

                <button
                  onClick={() => addToCart(item, 1)}
                  className="h-9 px-4 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Bottom Cart Bar if items exist */}
      {cart && cart.items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-40 max-w-lg mx-auto">
          <div
            onClick={() => navigate('/cart')}
            className="p-3.5 bg-on-background text-surface rounded-full shadow-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2 pl-2">
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
                {cart.items.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
              <span className="font-label-md text-label-md font-bold">₹{cart.total} total</span>
            </div>
            <div className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary-fixed pr-2">
              <span>View Group Cart</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>
        </div>
      )}

      {/* Customizer Modal */}
      <FoodCustomizerModal
        item={selectedItemForModal}
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        onConfirm={(item, qty, custom) => addToCart(item, qty, custom)}
      />
    </div>
  );
};
