'use client';

import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    changeQty,
    removeItem,
    totalAmount,
    openCheckout,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-[#FAF8F5] shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#F4651A]" />
            <h2 className="text-[17px] font-black text-[#1A1A2E]">Your Order</h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-black/[0.04]">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[#8E8E93] py-12">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5EF] text-[#F4651A]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="text-base font-bold text-[#1A1A2E]">Your cart is empty.</p>
              <p className="mt-1 text-xs text-[#8E8E93]">Tap on any delicious item to add it to your bag.</p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = item.price * item.qty;
              return (
                <div key={item.key} className="py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#1A1A2E]">
                        {item.name}
                        {item.size && (
                          <span className="ml-1 text-xs font-bold text-[#F4651A]">
                            • {item.size}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[#8E8E93] mt-0.5">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-[#1A1A2E]">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  {/* Item controls */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      onClick={() => removeItem(item.key)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>

                    <div className="flex items-center gap-1 rounded-full bg-white shadow-sm border border-black/[0.06] p-0.5">
                      <button
                        onClick={() => changeQty(item.key, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3 font-bold" />
                      </button>
                      <span className="min-w-6 text-center text-xs font-black text-[#1A1A2E]">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => changeQty(item.key, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4651A] text-white hover:bg-[#E05A15] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3 font-bold" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black/[0.06] bg-white p-5 shadow-[0_-8px_24px_rgba(0,0,0,0.03)]">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-sm font-bold text-[#8E8E93]">Total Amount</span>
              <span className="text-xl font-black text-[#1A1A2E]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <button
              onClick={openCheckout}
              className="w-full rounded-2xl bg-[#F4651A] py-3.5 text-center text-sm font-black text-white shadow-[0_6px_20px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] active:scale-[0.99] transition-all cursor-pointer"
            >
              Continue to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
