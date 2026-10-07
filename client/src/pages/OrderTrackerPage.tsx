import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Order, OrderStatus } from '../shared/types/index.js';
import { CampusMapTracker } from '../components/orders/CampusMapTracker.js';

export const OrderTrackerPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    let interval: any;
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await api.getOrderById(orderId);
        if (res.success && res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    interval = setInterval(fetchOrder, 6000); // Live poll updates every 6s

    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancel = async () => {
    if (!orderId) return;
    try {
      setCancelling(true);
      const res = await api.cancelOrder(orderId);
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      alert(err.message || 'Cannot cancel order at this stage');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!orderId) return;
    try {
      setReordering(true);
      const res = await api.reorder(orderId);
      if (res.success) {
        navigate('/cart');
      }
    } catch (err: any) {
      alert(err.message || 'Items from this order are currently unavailable');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
          <span className="font-label-md text-label-md text-on-surface-variant">Connecting to Quad Dispatch...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Order Not Found</h2>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 px-4 py-2 rounded-full bg-primary-container text-on-primary font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  // Determine stepper progress
  const getProgressWidth = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '15%';
      case 'confirmed': return '35%';
      case 'preparing': return '55%';
      case 'ready': return '70%';
      case 'out_for_delivery': return '85%';
      case 'delivered': return '100%';
      case 'cancelled': return '0%';
      default: return '25%';
    }
  };

  const isCancellable = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 gap-space-md max-w-2xl mx-auto">
      {/* 1. Floating Snack Progress Banner / Live Pill */}
      <div className="flex items-center justify-between px-space-md py-space-sm rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-space-xs min-w-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="font-label-md text-label-md truncate font-semibold">
            Order #{order.orderNumber} • Live Quad Dispatch
          </span>
        </div>
        <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary font-bold shadow-sm">
          {order.status === 'delivered' ? 'Delivered 🎉' : order.status === 'cancelled' ? 'Cancelled' : 'Fresh & Warm'}
        </span>
      </div>

      {/* 2. Primary ETA & Stepper Card */}
      <div className="flex flex-col p-space-md rounded-lg bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary-container">timer</span>
              Estimated Dorm Arrival
            </span>
            <div className="flex items-baseline gap-space-xs mt-0.5">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-extrabold">
                {order.status === 'delivered' ? '0' : order.status === 'out_for_delivery' ? '5-10' : '15-20'}
              </h1>
              <span className="font-headline-md text-headline-md text-primary-container font-extrabold">
                {order.status === 'delivered' ? 'mins ago' : 'mins'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Kitchen: <span className="font-semibold text-on-surface">{order.vendorName}</span> • Quad Shortcut Active
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                speed
              </span>
              Fast Track
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Quad Shortcut Active</span>
          </div>
        </div>

        {/* Multi-stage Visual Stepper */}
        <div className="mt-space-md pt-space-sm flex flex-col gap-space-xs">
          {/* Track Indicator Bar */}
          <div className="relative w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-700"
              style={{ width: getProgressWidth(order.status) }}
            ></div>
          </div>

          {/* Step Nodes */}
          <div className="grid grid-cols-4 gap-1 pt-space-xs text-center">
            {/* Step 1: Received */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status)
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}>
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface mt-1 font-semibold">Received</span>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(order.status)
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}>
                <span className="material-symbols-outlined text-[14px]">skillet</span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface mt-1 font-semibold">Preparing</span>
            </div>

            {/* Step 3: On Campus / Out for Delivery */}
            <div className="flex flex-col items-center">
              <div className={`relative flex items-center justify-center`}>
                {order.status === 'out_for_delivery' && (
                  <span className="animate-ping absolute h-7 w-7 rounded-full bg-primary-container opacity-40"></span>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  ['out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-on-surface'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">pedal_bike</span>
                </div>
              </div>
              <span className="font-label-sm text-[11px] text-primary-container font-extrabold mt-1">
                On Campus
              </span>
            </div>

            {/* Step 4: Lobby Drop */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                order.status === 'delivered'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}>
                <span className="material-symbols-outlined text-[14px]">apartment</span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface mt-1 font-semibold">Lobby Drop</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Campus Pathway Graphic Map */}
      <CampusMapTracker
        orderStatus={order.status}
        deliveryAddress={order.deliveryAddress}
      />

      {/* 4. Pickup Verification Security Code Banner */}
      <div className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(15,23,42,0.05)]">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">vpn_key</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
              Lobby Security PIN
            </span>
            <span className="font-body-sm text-body-sm text-on-surface truncate font-semibold">
              Show quad runner at dorm lobby
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-headline-sm text-headline-sm font-extrabold tracking-widest text-primary-container bg-surface-container-lowest px-3 py-1 rounded-DEFAULT shadow-sm">
            7429
          </span>
        </div>
      </div>

      {/* 5. Order Items & Receipt Summary */}
      <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-3">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Order Items</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-surface-container/40 last:border-0">
              <div>
                <span className="font-bold text-on-surface">{item.quantity}x {item.itemName}</span>
                {item.customization && (
                  <p className="text-[11px] text-on-surface-variant">
                    {item.customization.spiceLevel || ''} {item.customization.extraCheese ? '• Extra Cheese' : ''}
                  </p>
                )}
              </div>
              <span className="font-bold text-on-surface">₹{item.unitPrice * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-surface-container space-y-1">
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Quad Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs text-tertiary font-bold">
              <span>Student Perk Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base text-on-surface pt-1 border-t border-surface-container/50">
            <span>Total Paid ({order.paymentMethod})</span>
            <span className="text-primary">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* 6. Action Controls: Cancel & Reorder */}
      <div className="flex gap-3">
        {isCancellable && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 py-3 rounded-full border border-error text-error font-label-md text-label-md font-bold hover:bg-error-container/20 active:scale-95 transition-all"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        <button
          onClick={handleReorder}
          disabled={reordering}
          className="flex-1 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span>{reordering ? 'Adding to Cart...' : 'Reorder This Meal'}</span>
        </button>
      </div>
    </div>
  );
};
