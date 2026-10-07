import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';

export const BottomNav: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <nav
      className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl rounded-t-lg shadow-[0_-8px_28px_rgba(15,23,42,0.08)] border-t border-surface-container/40"
      data-active-classes="text-primary-container"
    >
      <div className="flex items-center justify-around h-16 px-space-xs max-w-md mx-auto">
        {/* 1. Explore */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                local_fire_department
              </span>
              <span className={`font-label-sm text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                Explore
              </span>
            </>
          )}
        </NavLink>

        {/* 2. Deals / Food */}
        <NavLink
          to="/food"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                sell
              </span>
              <span className={`font-label-sm text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                Deals
              </span>
            </>
          )}
        </NavLink>

        {/* 3. Group Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  shopping_bag
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary font-label-sm text-[10px] leading-tight font-bold shadow-[0_2px_6px_rgba(255,109,0,0.3)]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <span className={`font-label-sm text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                Group Cart
              </span>
            </>
          )}
        </NavLink>

        {/* 4. Live Track */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                moped
              </span>
              <span className={`font-label-sm text-[11px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                Live Track
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
