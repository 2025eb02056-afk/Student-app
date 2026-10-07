import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[40px]">remove_shopping_cart</span>
        </div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Your Dorm Cart is Empty</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-6">
          Start a group cart with roommates or pick budget bites from campus dining spots.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md active:scale-95 transition-transform"
        >
          Explore Campus Food
        </Link>
      </div>
    );
  }

  const perPersonSplit = Math.round((cart.total / splitCount) * 100) / 100;

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-3xl mx-auto">
      {/* 1. Group Order Session Banner */}
      <div className="relative overflow-hidden rounded-lg bg-surface-container-high p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary-container/10 blur-xl pointer-events-none"></div>
        <div className="flex items-start justify-between gap-space-sm relative z-10">
          <div className="space-y-space-xs min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              Active Session
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight truncate">
              {cart.vendor?.name || 'Campus Dining Spot'}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary">group</span>
              Roommates split order • North Quad Dorms
            </p>
          </div>

          <button
            onClick={handleShare}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-[0_2px_8px_rgba(255,109,0,0.25)] active:scale-95 transition-transform"
            id="copyInviteBtn"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedLink ? 'done' : 'share'}
            </span>
            <span>{copiedLink ? 'Copied!' : 'Share Link'}</span>
          </button>
        </div>

        {/* Active Members Pill Stack */}
        <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant">
          <div className="flex items-center -space-x-2">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold ring-2 ring-surface-container-high">
              {user?.fullName?.charAt(0) || 'Y'}
            </div>
            <div className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm flex items-center justify-center font-bold ring-2 ring-surface-container-high">
              M
            </div>
            <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm flex items-center justify-center font-bold ring-2 ring-surface-container-high">
              L
            </div>
            <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center ring-2 ring-surface-container-high">
              <span className="material-symbols-outlined text-[14px]">add</span>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock_clock</span>
            Locks in 12m
          </span>
        </div>
      </div>

      {/* 2. Group Breakdown by Person / Items */}
      <div className="space-y-space-sm">
        <div className="flex items-center justify-between px-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Items Breakdown</h2>
          <button
            onClick={() => clearCart()}
            className="font-label-sm text-label-sm text-error hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* User Card */}
        <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0) || 'Y'}
              </span>
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                {user?.fullName || 'Student (You)'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                Host
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface font-bold">₹{cart.subtotal}</span>
          </div>

          {cart.items.map((ci) => (
            <div key={ci.id} className="flex items-start gap-space-sm bg-surface-container-low rounded-lg p-2.5">
              <div className="w-14 h-14 rounded-DEFAULT overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={ci.item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&q=80'}
                  alt={ci.item.name}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="font-label-md text-label-md text-on-surface font-bold truncate">
                    {ci.quantity}x {ci.item.name}
                  </p>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-semibold">
                    ₹{ci.item.price * ci.quantity}
                  </span>
                </div>

                {ci.customization && (
                  <p className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1">
                    {ci.customization.spiceLevel ? `${ci.customization.spiceLevel} spice` : ''}
                    {ci.customization.extraCheese ? ', extra cheese' : ''}
                    {ci.customization.notes ? ` • ${ci.customization.notes}` : ''}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  {/* Quantity control */}
                  <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-2 py-0.5">
                    <button
                      onClick={() => updateQuantity(ci.id, ci.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-on-surface hover:text-error active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-label-sm text-label-sm font-bold w-4 text-center">{ci.quantity}</span>
                    <button
                      onClick={() => updateQuantity(ci.id, ci.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-on-surface hover:text-primary active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Precise Campus & Dorm Delivery Spot Card */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Campus Delivery Spot</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">North Quad • Maple Hall</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
            Dorm Drop
          </span>
        </div>

        {/* Visual Map strip preview */}
        <div className="w-full h-20 rounded-DEFAULT bg-cover bg-center relative overflow-hidden flex items-end p-2.5 bg-gradient-to-r from-blue-900 to-indigo-900">
          <div className="relative z-10 flex items-center justify-between w-full text-surface">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">location_on</span>
              <span className="font-label-md text-label-md text-surface font-bold drop-shadow">
                Courier navigates via North Quad Pathway
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Split Bill Calculator */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[20px]">call_split</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Split with Roommates</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
              className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
            >
              -
            </button>
            <span className="font-label-md text-label-md font-bold">{splitCount} people</span>
            <button
              onClick={() => setSplitCount(splitCount + 1)}
              className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="p-3 rounded-DEFAULT bg-tertiary-fixed/30 flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-tertiary-fixed font-medium">Each roommate pays:</span>
          <span className="font-headline-sm text-headline-sm font-bold text-tertiary">₹{perPersonSplit}</span>
        </div>
      </div>

      {/* 5. Bill Summary */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-2">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Order Summary</h3>

        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Items Subtotal</span>
          <span>₹{cart.subtotal}</span>
        </div>

        <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
          <span>Campus Dorm Delivery Fee</span>
          <span>₹{cart.deliveryFee}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex justify-between font-body-sm text-body-sm text-tertiary font-semibold">
            <span>Student Combo Perk (10% off)</span>
            <span>-₹{cart.discount}</span>
          </div>
        )}

        <div className="pt-2 border-t border-surface-container flex justify-between font-headline-sm text-headline-sm font-bold text-on-surface">
          <span>Total</span>
          <span className="text-primary">₹{cart.total}</span>
        </div>
      </div>

      {/* 6. Checkout CTA */}
      <button
        onClick={() => navigate('/checkout')}
        className="w-full py-3.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-between px-6"
      >
        <span>Proceed to Campus Checkout</span>
        <span>₹{cart.total}</span>
      </button>
    </div>
  );
};
