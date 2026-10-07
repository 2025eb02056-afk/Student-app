import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Vendor } from '../shared/types/index.js';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.getFavorites();
        if (res.success) {
          setFavorites(res.data.favorites || []);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRemove = async (vendorId: string) => {
    await api.removeFavorite(vendorId);
    setFavorites(prev => prev.filter(v => v.id !== vendorId));
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Saved Campus Eateries</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Your bookmarked quad spots & late-night favorites</p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-16 text-center rounded-lg bg-surface-container-lowest p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">favorite_border</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Favorite Spots Yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-4">
            Tap the heart icon on any campus spot to save it here for quick ordering.
          </p>
          <Link
            to="/vendors"
            className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md inline-block"
          >
            Browse Spots
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map(v => (
            <div
              key={v.id}
              className="rounded-lg bg-surface-container-lowest p-3.5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex items-center justify-between gap-3"
            >
              <Link to={`/vendors/${v.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={v.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80'}
                  alt={v.name}
                  className="w-16 h-16 rounded-DEFAULT object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                    {v.name}
                  </h4>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    ★ {v.rating} • {v.estimatedDeliveryTime} min delivery • Min ₹{v.minimumOrder}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleRemove(v.id)}
                className="w-8 h-8 rounded-full bg-surface-container text-primary flex items-center justify-center hover:bg-error-container hover:text-on-error-container transition-colors"
                title="Remove from favorites"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
