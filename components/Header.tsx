'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, X, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../lib/constants';
import { Logo } from './Logo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { totalCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0c6e37] to-[#20a653] text-white shadow-md transition-all">
      <div className="mx-auto max-w-[1050px] px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top brand row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Logo size="md" priority />
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate leading-tight">
                {STORE_CONFIG.name}
              </h1>
              <small className="block text-[11px] sm:text-xs font-medium text-emerald-100/90 truncate">
                {STORE_CONFIG.tagline}
              </small>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-emerald-50 backdrop-blur-sm transition-all hover:bg-white/25 sm:flex"
              title="Kitchen & Live Orders View"
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Kitchen Orders</span>
            </Link> */}

            <button
              onClick={openCart}
              id="header-cart-btn"
              className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-black text-[#0b7139] shadow-sm transition-all hover:bg-emerald-50 active:scale-95"
              aria-label="Open Cart"
            >
              <ShoppingCart className="h-4 w-4 text-[#0b7139]" />
              <span id="header-cart-count" className="font-extrabold">{totalCount}</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mt-3.5 flex items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
            <Search className="h-4 w-4 text-emerald-700" />
          </div>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pizza, burger, shake, fries..."
            className="w-full rounded-2xl bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#17251c] shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-300"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
