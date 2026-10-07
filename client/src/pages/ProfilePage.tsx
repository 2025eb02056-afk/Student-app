import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Student Profile</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Campus digital ID card & delivery preferences</p>
      </div>

      {/* Student ID Card Badge */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed p-5 text-on-primary shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-surface-container-lowest/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest text-primary-container font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-primary">{user.fullName}</h2>
              <p className="font-body-sm text-xs text-primary-fixed">{user.email}</p>
              <p className="font-label-sm text-xs text-secondary-fixed mt-0.5">{user.collegeName || 'National Engineering College'}</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-md font-label-sm text-[11px] font-bold uppercase tracking-wider">
            {user.role} ID
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-surface-container-lowest/20 text-center">
          <div>
            <span className="font-headline-sm text-headline-sm font-bold block">14</span>
            <span className="font-label-sm text-[10px] text-primary-fixed uppercase">Orders</span>
          </div>
          <div>
            <span className="font-headline-sm text-headline-sm font-bold block">₹280</span>
            <span className="font-label-sm text-[10px] text-primary-fixed uppercase">Savings</span>
          </div>
          <div>
            <span className="font-headline-sm text-headline-sm font-bold block">450</span>
            <span className="font-label-sm text-[10px] text-primary-fixed uppercase">Dorm Pts</span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-3">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Campus Details</h3>

        <div className="flex justify-between py-2 border-b border-surface-container/50">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Phone Number</span>
          <span className="font-label-md text-label-md font-bold text-on-surface">+91 {user.phone}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-surface-container/50">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Hostel / Campus</span>
          <span className="font-label-md text-label-md font-bold text-on-surface">{user.collegeName || 'North Campus'}</span>
        </div>

        <div className="flex justify-between py-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Role Permissions</span>
          <span className="font-label-md text-label-md font-bold text-primary capitalize">{user.role}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={async () => {
          await logout();
          navigate('/login');
        }}
        className="w-full py-3 rounded-full border border-error text-error font-label-md text-label-md font-bold hover:bg-error-container/20 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span>Sign Out of CampusBite</span>
      </button>
    </div>
  );
};
