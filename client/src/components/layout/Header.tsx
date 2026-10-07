import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onOpenAIModal?: () => void;
  selectedSpot?: string;
  onSelectSpot?: (spot: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAIModal,
  selectedSpot = 'North Quad (Bldg B)',
  onSelectSpot
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const spots = [
    'North Quad (Bldg B)',
    'Maple Hall Dorms',
    'Sci Library 3rd Flr',
    'Student Union Plaza',
    'Engineering Lab Wing'
  ];

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
      <div className="h-28 px-margin-mobile flex flex-col justify-between py-space-xs max-w-4xl mx-auto">
        {/* Top Branding Row */}
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-space-xs active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary-container">
              CampusBite
            </span>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center gap-space-xs">
            {/* AI Advisor Button */}
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                aria-label="AI Food Advisory Assistant"
                className="relative h-10 px-3 flex items-center gap-1.5 rounded-full bg-surface-container-high text-primary hover:bg-surface-container active:scale-95 transition-all shadow-sm"
                title="AI Student Meal Advisor"
              >
                <span className="material-symbols-outlined text-[19px] text-primary-container">auto_awesome</span>
                <span className="font-label-sm text-label-sm font-bold text-on-surface hidden sm:inline">Ask AI</span>
              </button>
            )}

            {/* Notifications Alert with Student Discount % Badge */}
            <Link
              to="/notifications"
              aria-label="Student discounts & alerts"
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary-container text-on-primary font-label-sm text-[10px] font-bold leading-none">
                %
              </span>
            </Link>

            {/* Profile Dropdown / Login */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Profile menu"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 active:scale-95 transition-transform"
              >
                {user ? (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-surface-container-highest">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  />
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl border border-surface-container py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-surface-container">
                        <p className="font-label-md text-label-md font-bold text-on-surface truncate">{user.fullName}</p>
                        <p className="font-body-sm text-[11px] text-on-surface-variant truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[10px] font-bold uppercase">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container font-label-sm text-label-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        Student Profile
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container font-label-sm text-label-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        Saved Spots
                      </Link>
                      {(user.role === 'admin' || user.role === 'vendor') && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-primary font-bold hover:bg-surface-container font-label-sm text-label-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">dashboard</span>
                          Admin Console
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-error hover:bg-surface-container font-label-sm text-label-sm text-left border-t border-surface-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container font-label-sm text-label-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-primary-container font-bold hover:bg-surface-container font-label-sm text-label-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Register as Student
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campus Spot & Estimated Delivery Time Selector Bar */}
        <div className="flex items-center justify-between pb-space-xs relative">
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container-high/90 text-on-surface shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)] active:scale-98 transition-transform"
          >
            <span className="material-symbols-outlined text-primary-container text-[18px]">location_on</span>
            <span className="font-label-md text-label-md truncate max-w-[170px] font-semibold">{selectedSpot}</span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_drop_down</span>
          </button>

          {showLocationPicker && (
            <div className="absolute top-10 left-0 w-64 bg-surface-container-lowest rounded-lg shadow-xl border border-surface-container py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Select Campus Dropoff Spot
              </div>
              {spots.map(spot => (
                <button
                  key={spot}
                  onClick={() => {
                    if (onSelectSpot) onSelectSpot(spot);
                    setShowLocationPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left font-label-sm text-label-sm hover:bg-surface-container ${selectedSpot === spot ? 'text-primary font-bold bg-primary-fixed/20' : 'text-on-surface'}`}
                >
                  <span>{spot}</span>
                  {selectedSpot === spot && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>15-25 min</span>
          </div>
        </div>
      </div>
    </header>
  );
};
