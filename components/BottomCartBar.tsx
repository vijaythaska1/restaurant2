'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export function BottomCartBar() {
  const { totalCount, totalAmount, openCart } = useCart();

  if (totalCount === 0) return null;

  return (
    <aside
      aria-label="Current order summary"
      className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-32px)] max-w-[490px] -translate-x-1/2 items-center justify-between rounded-[22px] glass-dark px-5 py-3.5 text-white shadow-[0_8px_40px_rgba(0,0,0,0.25)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4651A] text-white shadow-md">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-white/80">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </div>
          <div className="text-[17px] font-extrabold text-white">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      <button
        onClick={openCart}
        className="flex items-center gap-2 rounded-2xl bg-[#F4651A] px-5 py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_16px_rgba(244,101,26,0.4)] transition-all hover:bg-[#E05A15] active:scale-95 cursor-pointer"
      >
        <span>View Cart</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </aside>
  );
}
