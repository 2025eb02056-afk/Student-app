import React, { useState } from 'react';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';
import { AIRecommendationItem } from '../../shared/types/index.js';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [budget, setBudget] = useState<number>(100);
  const [dietary, setDietary] = useState<'veg' | 'non-veg' | 'any'>('any');
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleBudgetSearch = async () => {
    try {
      setLoading(true);
      const res = await api.getAIBudgetRecommendations(budget, dietary, query || undefined);
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations || []);
        setSummary(res.data.summary || '');
      }
    } catch (err: any) {
      setSummary('Could not get AI recommendations at the moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaturalSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await api.aiSearch(query);
      if (res.success && res.data) {
        const mapped = (res.data.matchingItems || []).map((m: any) => ({
          menuItemId: m.menuItemId,
          reason: m.reason,
          price: m.menuItem?.price || 0,
          valueScore: 92,
          menuItem: m.menuItem
        }));
        setRecommendations(mapped);
        setSummary(`Showing best matched campus meals for "${query}".`);
      }
    } catch (err: any) {
      setSummary('Failed to process natural language search.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (rec: AIRecommendationItem) => {
    if (!rec.menuItem) return;
    await addToCart(rec.menuItem, 1);
    setAddedItemIds(prev => new Set(prev).add(rec.menuItemId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-surface-container">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary-container to-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold leading-tight">AI Food Advisory Assistant</h3>
              <p className="font-body-sm text-[11px] text-primary-fixed">Find pocket-friendly meals tailored to your campus budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-lowest/20 flex items-center justify-center hover:bg-surface-container-lowest/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4">
          {/* Query input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalSearch()}
              placeholder="e.g. 'I want spicy momos under ₹80' or 'Filling thali'"
              className="w-full pl-3.5 pr-20 py-2.5 bg-surface-container-low rounded-full font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <button
              onClick={handleNaturalSearch}
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-primary-container text-on-primary font-label-sm text-label-sm font-bold rounded-full hover:opacity-90 active:scale-95"
            >
              Ask
            </button>
          </div>

          {/* Quick Budget Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Max Budget: ₹{budget}</span>
              <div className="flex gap-1.5">
                {[50, 80, 100, 150].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold transition-all ${
                      budget === b ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={10}
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value, 10))}
              className="w-full accent-primary-container"
            />
          </div>

          {/* Dietary Preference */}
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Dietary:</span>
            {(['any', 'veg', 'non-veg'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDietary(d)}
                className={`px-3 py-1 rounded-full font-label-sm text-label-sm capitalize transition-all ${
                  dietary === d
                    ? 'bg-tertiary text-on-tertiary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {d === 'any' ? 'Any' : d === 'veg' ? 'Pure Veg 🌱' : 'Non-Veg 🍗'}
              </button>
            ))}
          </div>

          {/* Search Trigger */}
          <button
            onClick={handleBudgetSearch}
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Consulting Gemini AI...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                <span>Find Best Student Meals Under ₹{budget}</span>
              </>
            )}
          </button>

          {/* Results Summary */}
          {summary && (
            <div className="p-3 rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container shrink-0 mt-0.5">info</span>
              <p>{summary}</p>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-2 pt-1">
            {recommendations.map((rec) => (
              <div
                key={rec.menuItemId}
                className="p-3 rounded-DEFAULT bg-surface-container-low border border-surface-container flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                      {rec.menuItem?.name || 'Meal Pick'}
                    </span>
                    <span className="font-label-md text-label-md font-bold text-primary shrink-0">
                      ₹{rec.price}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                    {rec.reason}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-label-sm text-[10px] text-tertiary font-bold bg-tertiary-fixed/40 px-2 py-0.2 rounded-full">
                      {rec.valueScore}% Student Value
                    </span>
                    {rec.menuItem?.vendorName && (
                      <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                        • {rec.menuItem.vendorName}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(rec)}
                  disabled={addedItemIds.has(rec.menuItemId)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm font-bold shrink-0 flex items-center gap-1 transition-all ${
                    addedItemIds.has(rec.menuItemId)
                      ? 'bg-tertiary-container text-on-tertiary-container'
                      : 'bg-primary-container text-on-primary active:scale-95'
                  }`}
                >
                  {addedItemIds.has(rec.menuItemId) ? (
                    <>
                      <span className="material-symbols-outlined text-[15px]">check</span>
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
