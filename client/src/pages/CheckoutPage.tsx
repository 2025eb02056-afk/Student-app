import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { syncOrderToFirestore } from '../services/firestore.js';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState(
    'Maple Hall Dorms, 3rd Floor, Room 304, North Campus'
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    'Call upon arrival at dorm lobby entrance'
  );
  const [phone, setPhone] = useState(user?.phone || '9876543212');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI / Campus Pay' | 'Online / Card'>('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      setError('Please provide a valid campus delivery address and room number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number (starting with 6-9)');
      return;
    }

    try {
      setLoading(true);
      const res = await api.checkout({
        deliveryAddress,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        phone,
        paymentMethod
      });

      if (res.success && res.data?.order) {
        syncOrderToFirestore(res.data.order).catch(() => {});
        await refreshCart();
        navigate(`/orders/${res.data.order.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/cart')}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Campus Checkout</h1>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* Campus Delivery Location */}
        <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">location_on</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Delivery Spot</h3>
          </div>

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
              Campus Dorm / Hall & Room Number
            </label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. Maple Hall Dorms, Room 304, North Campus"
              className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
              Delivery Drop Instructions (Optional)
            </label>
            <input
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g. Call when outside lobby, leave with roommate Arjun"
              className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
              Student Mobile Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Payment Method</h3>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'Cash on Delivery',
                title: 'Cash on Campus Drop (COD)',
                desc: 'Pay courier directly at dorm entrance'
              },
              {
                id: 'UPI / Campus Pay',
                title: 'UPI / Campus Wallet / GPay',
                desc: 'Instant QR scan upon dorm runner arrival'
              },
              {
                id: 'Online / Card',
                title: 'Student Meal Dollars / Debit Card',
                desc: 'Fast online campus payment clearance'
              }
            ].map(m => (
              <label
                key={m.id}
                className={`flex items-start gap-3 p-3 rounded-DEFAULT border cursor-pointer transition-all ${
                  paymentMethod === m.id
                    ? 'border-primary-container bg-primary-fixed/20'
                    : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === m.id}
                  onChange={() => setPaymentMethod(m.id as any)}
                  className="mt-1 accent-primary-container"
                />
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{m.title}</p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="rounded-lg bg-surface-container-lowest p-space-md shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-2">
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Restaurant</span>
            <span className="font-bold text-on-surface">{cart.vendor?.name}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Dorm Delivery</span>
            <span>₹{cart.deliveryFee}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between font-body-sm text-body-sm text-tertiary font-semibold">
              <span>Student Perk Discount</span>
              <span>-₹{cart.discount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-surface-container flex justify-between font-headline-sm text-headline-sm font-bold text-on-surface">
            <span>Final Amount</span>
            <span className="text-primary">₹{cart.total}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Confirm & Place Order (₹{cart.total})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
