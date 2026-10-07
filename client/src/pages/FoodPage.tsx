import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { MenuItem, Category } from '../shared/types/index.js';
import { FoodCustomizerModal } from '../components/food/FoodCustomizerModal.js';

export const FoodPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const { addToCart } = useCart();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(filterParam === 'under100' ? 100 : null);
  const [sortBy, setSortBy] = useState<'rating' | 'priceAsc' | 'priceDesc' | 'prepTime'>('rating');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [mRes, cRes] = await Promise.all([
          api.getMenuItems({ availableOnly: true }),
          api.getCategories()
        ]);
        if (mRes.success) setItems(mRes.data.items || []);
        if (cRes.success) setCategories(cRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching food:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  let filtered = items.filter(item => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (vegOnly && !item.isVegetarian) return false;
    if (maxPrice && item.price > maxPrice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !(item.description && item.description.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  if (sortBy === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'prepTime') {
    filtered.sort((a, b) => a.preparationTime - b.preparationTime);
  }

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Food Discovery</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Pocket-friendly meals & student combos</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-3 text-on-surface-variant pointer-events-none">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items, ingredients, canteen meals..."
          className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest rounded-full font-body-md text-body-md shadow-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
      </div>

      {/* Quick Budget Collection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setMaxPrice(maxPrice === 50 ? null : 50)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
            maxPrice === 50 ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface'
          }`}
        >
          Under ₹50
        </button>
        <button
          onClick={() => setMaxPrice(maxPrice === 100 ? null : 100)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
            maxPrice === 100 ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface'
          }`}
        >
          Under ₹100
        </button>
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
            vegOnly ? 'bg-tertiary text-on-tertiary shadow-sm' : 'bg-surface-container-lowest text-on-surface'
          }`}
        >
          🌱 Pure Veg Only
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span>Showing {filtered.length} meals</span>
        <div className="flex items-center gap-1">
          <span className="font-semibold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-bold text-on-surface focus:outline-none"
          >
            <option value="rating">Top Rated</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="prepTime">Fastest Prep</option>
          </select>
        </div>
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-headline-sm text-headline-sm font-bold text-on-surface">No food matches your filters</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Try resetting price or category filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {filtered.map(item => (
            <div
              key={item.id}
              className="rounded-lg bg-surface-container-lowest p-3 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex gap-3 hover:shadow-md transition-shadow group"
            >
              <div className="relative w-28 h-28 rounded-DEFAULT overflow-hidden shrink-0">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=240&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-surface-container-lowest/90 font-label-sm text-[9px] font-bold">
                  {item.isVegetarian ? '🌱 Veg' : '🍗 Non-Veg'}
                </span>
              </div>

              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                    {item.name}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block mt-0.5">
                    {item.vendorName || 'Campus Spot'} • ~{item.preparationTime}m
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    ₹{item.price}
                  </span>

                  <button
                    onClick={() => setSelectedItemForModal(item)}
                    className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
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
