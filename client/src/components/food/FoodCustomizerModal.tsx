import React, { useState } from 'react';
import { MenuItem } from '../../shared/types/index.js';

interface FoodCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, quantity: number, customization: any) => void;
}

export const FoodCustomizerModal: React.FC<FoodCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Extra Spicy'>('Medium');
  const [extraCheese, setExtraCheese] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const itemPrice = item.price + (extraCheese ? 20 : 0);
  const totalPrice = itemPrice * quantity;

  const handleAdd = () => {
    onConfirm(item, quantity, {
      spiceLevel,
      extraCheese,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-background/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-surface-container">
        {/* Header */}
        <div className="p-4 border-b border-surface-container flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{item.name}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Customization Options */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Spice Level */}
          <div>
            <label className="block font-label-md text-label-md font-bold text-on-surface mb-2">
              Select Spice Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Mild', 'Medium', 'Extra Spicy'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={`py-2 px-3 rounded-full font-label-sm text-label-sm font-semibold border transition-all ${
                    spiceLevel === level
                      ? 'border-primary-container bg-primary-fixed/30 text-on-primary-fixed-variant'
                      : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {level} {level === 'Extra Spicy' ? '🌶️🌶️' : level === 'Medium' ? '🌶️' : '🌿'}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block font-label-md text-label-md font-bold text-on-surface mb-2">
              Student Add-ons
            </label>
            <label className="flex items-center justify-between p-3 rounded-DEFAULT bg-surface-container-low border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={extraCheese}
                  onChange={(e) => setExtraCheese(e.target.checked)}
                  className="w-4 h-4 text-primary-container rounded accent-primary-container"
                />
                <span className="font-label-sm text-label-sm font-medium text-on-surface">Extra Melted Cheese / Butter</span>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-primary">+₹20</span>
            </label>
          </div>

          {/* Special Dorm Instructions */}
          <div>
            <label className="block font-label-md text-label-md font-bold text-on-surface mb-1">
              Kitchen & Dorm Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 'Pack extra mint chutney', 'No onions', 'Leave in lobby room 302'"
              className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary-container resize-none"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-label-md text-label-md font-bold text-on-surface">Quantity</span>
            <div className="flex items-center gap-3 bg-surface-container-high rounded-full px-3 py-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 flex items-center justify-center font-bold text-on-surface active:scale-90"
              >
                -
              </button>
              <span className="font-label-md text-label-md font-bold w-4 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-6 h-6 flex items-center justify-center font-bold text-on-surface active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer Add Button */}
        <div className="p-4 border-t border-surface-container bg-surface-container-low">
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md active:scale-98 transition-all flex items-center justify-between px-6"
          >
            <span>Add to Cart</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
