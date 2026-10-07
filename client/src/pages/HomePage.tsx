import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { Vendor, MenuItem } from '../shared/types/index.js';
import { FoodCustomizerModal } from '../components/food/FoodCustomizerModal.js';

interface HomePageProps {
  onOpenAIModal?: () => void;
  selectedSpot?: string;
  onSelectSpot?: (spot: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAIModal,
  selectedSpot = 'North Quad Dorms',
  onSelectSpot
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dealClaimed, setDealClaimed] = useState(false);
  const [groupJoined, setGroupJoined] = useState(false);
  const [countdown, setCountdown] = useState('01:42:18');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  const campusSpots = [
    'North Quad Dorms',
    'Sci Library 3rd Flr',
    'Student Union',
    'Engineering Lab'
  ];

  // Countdown timer simulation
  useEffect(() => {
    let seconds = 6138;
    const timer = setInterval(() => {
      if (seconds > 0) {
        seconds--;
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        setCountdown(`${hrs}:${mins}:${secs}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vRes = await api.getVendors();
        if (vRes.success) {
          setVendors(vRes.data.vendors || []);
        }

        const mRes = await api.getMenuItems({ availableOnly: true });
        if (mRes.success) {
          setFeaturedItems(mRes.data.items || []);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };
    fetchData();
  }, []);

  // Filter items based on activeFilter and searchQuery
  let displayedItems = featuredItems;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedItems = displayedItems.filter(i =>
      i.name.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q))
    );
  }
  if (activeFilter === 'under100') {
    displayedItems = displayedItems.filter(i => i.price <= 100);
  } else if (activeFilter === 'veg') {
    displayedItems = displayedItems.filter(i => i.isVegetarian);
  }

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Campus Spot Quick Filter Chips */}
      <div className="px-margin-mobile pt-space-xs pb-space-sm max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
          <span className="inline-flex items-center text-primary-container pl-1 pr-0.5">
            <span className="material-symbols-outlined text-[18px]">near_me</span>
          </span>
          {campusSpots.map((spot) => {
            const isActive = selectedSpot === spot;
            return (
              <button
                key={spot}
                onClick={() => onSelectSpot && onSelectSpot(spot)}
                className={`campus-spot shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{spot}</span>
                {isActive && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search Bar with AI Quick Trigger */}
      <div className="px-margin-mobile mb-space-md max-w-4xl mx-auto w-full">
        <div className="relative flex items-center w-full">
          <span className="absolute left-4 text-on-surface-variant flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thali, late-night pizza, ₹50 deals..."
            className="w-full pl-11 pr-24 py-3 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md rounded-full shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                title="Ask AI Advisor"
                className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center hover:opacity-90 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
              </button>
            )}
            <button
              onClick={() => navigate('/food')}
              aria-label="Open filter options"
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div className="px-margin-mobile mb-space-md max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveFilter(activeFilter === 'under100' ? null : 'under100')}
            className={`filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm font-label-sm text-label-sm active:scale-95 transition-all ${
              activeFilter === 'under100'
                ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                : 'bg-surface-container-lowest text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-primary-container">attach_money</span>
            <span>Under ₹100</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'veg' ? null : 'veg')}
            className={`filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm font-label-sm text-label-sm active:scale-95 transition-all ${
              activeFilter === 'veg'
                ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                : 'bg-surface-container-lowest text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">eco</span>
            <span>Pure Veg</span>
          </button>

          <button
            onClick={() => navigate('/food?filter=latenight')}
            className="filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm font-label-sm text-label-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">bedtime</span>
            <span>Late Night (Past 1am)</span>
          </button>

          <button
            onClick={() => navigate('/food?filter=campuspay')}
            className="filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm font-label-sm text-label-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">badge</span>
            <span>Dining Dollars Accepted</span>
          </button>

          <button
            onClick={() => navigate('/food?filter=freedrop')}
            className="filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm font-label-sm text-label-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">moped</span>
            <span>Free Campus Drop</span>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="filter-pill shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-sm font-label-sm text-label-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-primary-container">group</span>
            <span>Group Orders</span>
          </button>
        </div>
      </div>

      {/* 4. Midterm Cram Packs Gradient Banner with Live Countdown */}
      <div className="px-margin-mobile mb-space-lg max-w-4xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed shadow-[0_12px_28px_-6px_rgba(255,109,0,0.35)] p-5 text-on-primary">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-on-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                <span>Late Night Cravings</span>
              </span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-on-primary-fixed/40 backdrop-blur-md text-secondary-fixed font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                <span id="cram-countdown">{countdown}</span>
              </div>
            </div>

            <div>
              <h2 className="font-headline-lg text-headline-lg font-extrabold leading-tight tracking-tight">
                Midterm Cram Packs: Buy 1 Get 1 Free
              </h2>
              <p className="font-body-sm text-body-sm text-primary-fixed mt-1">
                Refuel through the night. Valid across 8 quad-delivering spots after 10 PM.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex -space-x-2 items-center">
                <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  🍕
                </span>
                <span className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  🧋
                </span>
                <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  🌮
                </span>
                <span className="pl-3 font-label-sm text-label-sm text-primary-fixed">
                  +84 students claimed
                </span>
              </div>

              <button
                id="claim-deal-btn"
                onClick={() => setDealClaimed(!dealClaimed)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md font-bold shadow-md active:scale-95 transition-all ${
                  dealClaimed
                    ? 'bg-surface-container-lowest text-tertiary'
                    : 'bg-surface-container-lowest text-primary-container'
                }`}
              >
                <span>{dealClaimed ? 'Claimed!' : 'Claim Deal'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {dealClaimed ? 'check_circle' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Campus Top Favorites Horizontal Scroller */}
      <div className="mb-space-lg max-w-4xl mx-auto w-full">
        <div className="px-margin-mobile flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-container text-[20px]">stars</span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Campus Top Favorites</h3>
          </div>
          <Link
            to="/food"
            className="font-label-md text-label-md text-primary-container font-bold inline-flex items-center hover:opacity-80"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="flex gap-space-md overflow-x-auto no-scrollbar px-margin-mobile pb-2">
          {displayedItems.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-[260px] rounded-DEFAULT bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col transition-transform active:scale-[0.99] group"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">payments</span>
                  <span>{item.price <= 100 ? `Under ₹100` : `Top Pick`}</span>
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-inverse-surface/85 backdrop-blur-sm text-inverse-on-surface font-label-sm text-label-sm font-semibold">
                  {item.preparationTime ? `${item.preparationTime}-${item.preparationTime + 10} min` : '15-20 min'}
                </span>
              </div>

              <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-0.5 shrink-0 text-secondary">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">4.8</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {item.vendorName || 'Campus Spot'} • {item.isVegetarian ? 'Pure Veg' : 'Non-Veg'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    ₹{item.price}
                  </span>

                  <button
                    onClick={() => setSelectedItemForModal(item)}
                    aria-label={`Add ${item.name} to cart`}
                    className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Group Carts Active Near You Banner */}
      <div className="px-margin-mobile mb-space-lg max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
            </span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Group Carts Active Near You</h3>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary font-bold bg-tertiary-fixed/50 px-2 py-0.5 rounded-full">
            Save ₹35 fee
          </span>
        </div>

        <div className="rounded-DEFAULT bg-surface-container-lowest p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-container shrink-0">
                <span className="material-symbols-outlined text-[26px]">lunch_dining</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Campus Canteen Central</span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-[10px] font-semibold">
                    Quad Express
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Room 402 @ Maple Hall is ordering
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold animate-pulse">
                <span className="material-symbols-outlined text-[12px]">alarm</span>
                <span>3 mins left</span>
              </div>
              <span className="font-body-sm text-[11px] text-tertiary font-semibold mt-1">Split delivery fee!</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  JD
                </span>
                <span className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  MK
                </span>
                <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold">
                  TL
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">3 students joined</span>
            </div>

            <button
              onClick={() => {
                setGroupJoined(true);
                navigate('/cart');
              }}
              className={`join-group-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md font-bold shadow-[0_2px_8px_rgba(255,109,0,0.3)] active:scale-95 transition-all ${
                groupJoined
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-primary-container text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {groupJoined ? 'done_all' : 'group_add'}
              </span>
              <span>{groupJoined ? 'Joined Room 402' : 'Join Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Campus Restaurants List */}
      <div className="px-margin-mobile max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-space-sm">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Campus Dining Spots</h3>
          <Link to="/vendors" className="font-label-md text-label-md text-primary-container font-bold hover:underline">
            View All ({vendors.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {vendors.map((vendor) => (
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
      </div>

      {/* Item Customizer Modal */}
      <FoodCustomizerModal
        item={selectedItemForModal}
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        onConfirm={(item, qty, custom) => addToCart(item, qty, custom)}
      />
    </div>
  );
};
