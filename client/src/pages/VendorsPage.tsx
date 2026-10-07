import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Vendor } from '../shared/types/index.js';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.getVendors();
        if (res.success) {
          setVendors(res.data.vendors || []);
        }
      } catch (err) {
        console.error('Failed to load vendors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = vendors.filter(v => {
    if (openOnly && !v.isOpen) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Dining Spots</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Hostel canteens, quad spots, and night eateries</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-on-surface-variant pointer-events-none">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dining spots..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded-full font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <button
          onClick={() => setOpenOnly(!openOnly)}
          className={`px-3 py-2 rounded-full font-label-sm text-label-sm font-bold border transition-all ${
            openOnly
              ? 'bg-primary-container text-on-primary border-primary-container'
              : 'bg-surface-container-lowest text-on-surface border-surface-container'
          }`}
        >
          Open Now
        </button>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {filtered.map(vendor => (
            <Link
              key={vendor.id}
              to={`/vendors/${vendor.id}`}
              className="rounded-lg bg-surface-container-lowest p-3 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex gap-3 hover:shadow-md transition-shadow group"
            >
              <img
                src={vendor.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                alt={vendor.name}
                className="w-24 h-24 rounded-DEFAULT object-cover group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                      {vendor.name}
                    </h4>
                    <span className="font-label-sm text-label-sm font-bold text-secondary flex items-center gap-0.5 shrink-0">
                      ★ {vendor.rating}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                    {vendor.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-semibold">
                    {vendor.estimatedDeliveryTime} min
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/50 text-on-tertiary-container font-label-sm text-[10px] font-semibold">
                    ₹{vendor.deliveryFee} fee
                  </span>
                  <span className="font-label-sm text-[10px] text-primary font-bold ml-auto">
                    Min ₹{vendor.minimumOrder}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
