import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Order, OrderStatus } from '../shared/types/index.js';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.getOrders();
        if (res.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-bold">Pending</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold">Confirmed</span>;
      case 'preparing':
        return <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px] font-bold">Preparing 🔥</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] font-bold animate-pulse">Out for Delivery 🛵</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-bold">Delivered ✓</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-[11px]">{status}</span>;
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const res = await api.reorder(orderId);
      if (res.success) {
        navigate('/cart');
      }
    } catch (err: any) {
      alert(err.message || 'Items from this order are currently unavailable');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-2xl mx-auto">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Your Campus Orders</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Live deliveries, track status & meal reordering</p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center rounded-lg bg-surface-container-lowest p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Orders Yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-4">
            Hungry? Browse budget meals and place your first campus delivery!
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md inline-block"
          >
            Find Food
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="rounded-lg bg-surface-container-lowest p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Order #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-primary-container mt-0.5">
                    {order.vendorName}
                  </h4>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <span className="font-headline-sm text-headline-sm font-extrabold text-on-surface">
                  ₹{order.total}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container/50">
                <button
                  onClick={() => handleReorder(order.id)}
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  Reorder
                </button>

                <Link
                  to={`/orders/${order.id}`}
                  className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>Track Order</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
