import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Order, OrderStatus, MenuItem, Vendor } from '../shared/types/index.js';
import { autoSeedFirestoreCollections } from '../services/firestore.js';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'vendors' | 'analytics'>('orders');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [firestoreSyncing, setFirestoreSyncing] = useState(false);
  const [firestoreMsg, setFirestoreMsg] = useState<string | null>(null);

  const handleSyncFirestore = async () => {
    try {
      setFirestoreSyncing(true);
      setFirestoreMsg(null);
      const res = await autoSeedFirestoreCollections();
      if (res.success) {
        setFirestoreMsg('✅ Successfully created & populated collections: users, orders, vendors, menu_items, categories, carts in Firebase Firestore!');
      } else {
        setFirestoreMsg('⚠️ ' + res.message);
      }
    } catch (err: any) {
      setFirestoreMsg('⚠️ Failed: ' + err.message);
    } finally {
      setFirestoreSyncing(false);
    }
  };

  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, ordersRes, menuRes, vendorsRes, analyticsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminOrders(),
        api.getMenuItems(),
        api.getVendors(),
        api.getAdminAnalytics()
      ]);

      if (dashRes.success) setStats(dashRes.data?.stats);
      if (ordersRes.success) setOrders(ordersRes.data?.orders || []);
      if (menuRes.success) setMenuItems(menuRes.data?.items || []);
      if (vendorsRes.success) setVendors(vendorsRes.data?.vendors || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.updateOrderStatus(orderId, status);
      if (res.success) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleMenuAvailability = async (item: MenuItem) => {
    try {
      const res = await api.updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      if (res.success) {
        setMenuItems(prev => prev.map(i => (i.id === item.id ? { ...i, isAvailable: !item.isAvailable } : i)));
      }
    } catch (err: any) {
      alert('Failed to update availability');
    }
  };

  const handleToggleVendorOpen = async (vendor: Vendor) => {
    try {
      const res = await api.updateVendor(vendor.id, { isOpen: !vendor.isOpen });
      if (res.success) {
        setVendors(prev => prev.map(v => (v.id === vendor.id ? { ...v, isOpen: !vendor.isOpen } : v)));
      }
    } catch (err: any) {
      alert('Failed to update restaurant status');
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'vendor') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h2 className="font-headline-md font-bold text-on-surface">Restricted Area</h2>
        <p className="text-on-surface-variant mt-1">Only campus food vendors and admins may access this console.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Operations & Orders</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Live kitchen status, menu toggles & dispatch management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFirestore}
            disabled={firestoreSyncing}
            className="px-3 py-1.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[12px] font-bold shadow-sm hover:opacity-90 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            title="Auto-create and populate all Firestore collections (users, orders, vendors, menu_items, categories, carts)"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>{firestoreSyncing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        </div>
      </div>

      {firestoreMsg && (
        <div className="p-3 rounded-lg bg-surface-container-high border border-surface-container text-on-surface font-body-sm text-body-sm flex items-center justify-between">
          <span>{firestoreMsg}</span>
          <button onClick={() => setFirestoreMsg(null)} className="text-on-surface-variant hover:text-on-surface text-xs font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-bold">Total Revenue</span>
            <p className="font-headline-md text-headline-md font-extrabold text-primary mt-0.5">₹{stats.totalRevenue}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-bold">Total Orders</span>
            <p className="font-headline-md text-headline-md font-extrabold text-on-surface mt-0.5">{stats.totalOrders}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-bold">In Kitchen / Out</span>
            <p className="font-headline-md text-headline-md font-extrabold text-tertiary mt-0.5">
              {stats.pendingOrders + stats.preparingOrders}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-bold">Active Vendors</span>
            <p className="font-headline-md text-headline-md font-extrabold text-secondary mt-0.5">{stats.activeVendors}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-container pb-1">
        {[
          { id: 'orders', label: `Live Orders (${orders.length})` },
          { id: 'menu', label: `Menu Availability (${menuItems.length})` },
          { id: 'vendors', label: `Campus Spots (${vendors.length})` },
          { id: 'analytics', label: 'Analytics' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
              activeTab === t.id
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    #{order.orderNumber}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant">
                    {order.vendorName}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  <span className="font-bold">Student:</span> {(order as any).studentName || 'Student'} • {(order as any).phone || order.phone}
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  📍 {order.deliveryAddress}
                </p>
                {order.deliveryInstructions && (
                  <p className="font-body-sm text-xs text-secondary-container bg-surface-container px-2 py-0.5 rounded">
                    Notes: {order.deliveryInstructions}
                  </p>
                )}
                <div className="text-xs text-on-surface-variant pt-1">
                  Items: {order.items?.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  ₹{order.total}
                </span>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">Status:</label>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="p-1.5 rounded-DEFAULT bg-surface-container-high border border-surface-container font-label-sm text-label-sm font-bold text-on-surface focus:outline-none"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Menu Availability */}
      {activeTab === 'menu' && (
        <div className="space-y-2">
          {menuItems.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=120&q=80'}
                  alt={item.name}
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface truncate">{item.name}</h4>
                  <p className="font-body-sm text-xs text-on-surface-variant">{item.vendorName} • ₹{item.price}</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleMenuAvailability(item)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
                  item.isAvailable
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {item.isAvailable ? 'In Stock ✓' : 'Sold Out ✕'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Vendors Control */}
      {activeTab === 'vendors' && (
        <div className="space-y-2">
          {vendors.map(v => (
            <div
              key={v.id}
              className="p-3.5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm flex items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">{v.name}</h4>
                <p className="font-body-sm text-xs text-on-surface-variant">{v.address} • Min ₹{v.minimumOrder}</p>
              </div>

              <button
                onClick={() => handleToggleVendorOpen(v)}
                className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold transition-all ${
                  v.isOpen
                    ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {v.isOpen ? 'Accepting Orders' : 'Kitchen Closed'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container shadow-sm">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Top Selling Student Items</h3>
            <div className="space-y-2">
              {analytics.topItems?.map((ti: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-surface-container/50 last:border-0">
                  <span className="font-medium text-on-surface">{idx + 1}. {ti.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-primary">{ti.ordersCount} orders</span>
                    <span className="text-xs text-on-surface-variant ml-2">(₹{ti.totalSales})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
