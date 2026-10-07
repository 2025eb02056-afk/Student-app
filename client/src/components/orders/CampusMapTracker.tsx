import React from 'react';

interface CampusMapTrackerProps {
  orderStatus: string;
  deliveryAddress?: string;
}

export const CampusMapTracker: React.FC<CampusMapTrackerProps> = ({
  orderStatus,
  deliveryAddress = 'Maple Hall Dorms'
}) => {
  // Determine courier position based on order status
  const isOut = orderStatus === 'out_for_delivery';
  const isDelivered = orderStatus === 'delivered';

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-surface-container-high shadow-[0_6px_24px_-4px_rgba(15,23,42,0.08)]">
      {/* Map Canvas (Vector campus pathways & buildings) */}
      <div className="relative w-full h-64 bg-[#e5ecf9] overflow-hidden">
        {/* Decorative SVG Campus Blueprint Grid */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="campusGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d5dfef" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#campusGrid)" />

          {/* Campus Green Zones (Quad lawn) */}
          <path d="M 30,120 Q 90,60 170,110 T 260,180 Q 200,240 110,210 Z" fill="#d2f2df" opacity="0.8" />
          <path d="M 220,20 Q 280,10 340,50 L 320,100 Q 260,80 220,20 Z" fill="#d2f2df" opacity="0.6" />

          {/* Paved Pedestrian Pathways */}
          <path d="M -10,180 C 60,170 110,140 160,100 C 210,60 260,75 390,95" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="12" />
          <path d="M 160,100 C 180,160 220,195 290,205" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth="10" />

          {/* Active Courier Animated Route Track */}
          <path
            id="deliveryRoute"
            d="M 30,175 C 90,165 140,125 180,102 C 215,82 245,120 280,190"
            fill="none"
            stroke="#ff6d00"
            strokeWidth="4"
            strokeDasharray="6,4"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>

        {/* Landmark 1: Science Center */}
        <div className="absolute top-4 left-6 px-2.5 py-1.5 rounded-DEFAULT bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-tertiary">biotech</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-on-surface font-bold leading-tight">Science Center</span>
            <span className="font-body-sm text-[9px] text-on-surface-variant leading-none">Hall A</span>
          </div>
        </div>

        {/* Landmark 2: Clock Tower */}
        <div className="absolute top-6 right-8 px-2.5 py-1.5 rounded-DEFAULT bg-surface-container-lowest/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-on-surface font-bold leading-tight">Clock Tower</span>
            <span className="font-body-sm text-[9px] text-on-surface-variant leading-none">Central Plaza</span>
          </div>
        </div>

        {/* Moving Courier Marker */}
        <div
          className={`absolute transition-all duration-1000 flex flex-col items-center z-20 group cursor-pointer ${
            isDelivered
              ? 'bottom-8 right-16'
              : isOut
              ? 'top-[96px] left-[170px] -translate-x-1/2 -translate-y-1/2'
              : 'top-[160px] left-[45px] -translate-x-1/2 -translate-y-1/2'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute h-10 w-10 rounded-full bg-primary-container opacity-50"></span>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_14px_rgba(255,109,0,0.5)] border-2 border-surface-container-lowest transform active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                electric_scooter
              </span>
            </div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-on-background text-surface font-label-sm text-[10px] tracking-wide whitespace-nowrap shadow-md">
            {isDelivered ? 'Delivered at Dorm' : isOut ? 'Marcus • Crossing Quad' : 'Kitchen Kitchen Point'}
          </div>
        </div>

        {/* Destination Pin: Maple Hall Dorms */}
        <div className="absolute bottom-4 right-5 flex flex-col items-end z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary shadow-[0_4px_16px_rgba(159,66,0,0.35)]">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              flag
            </span>
            <span className="font-label-md text-label-md font-bold truncate max-w-[150px]">{deliveryAddress}</span>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-xs text-on-surface font-label-sm text-[10px] font-semibold shadow-sm">
            📍 Front Desk Lobby Drop
          </div>
        </div>

        {/* Live Speed / Path Status Overlay */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-tertiary-container">directions_bike</span>
          <span>{isDelivered ? 'Delivery Complete' : isOut ? 'Speed: 11 mph • Bike Path B' : 'Order Preparing'}</span>
        </div>
      </div>
    </div>
  );
};
