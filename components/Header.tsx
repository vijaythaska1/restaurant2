'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, X, MapPin, Mic, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../lib/constants';
import { formatCurrency } from '../lib/utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { totalCount, totalAmount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        {/* Desktop & Tablet Top Bar (Clean single-row or two-tier responsive) */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F4651A] to-[#FF8A48] text-white shadow-[0_4px_16px_rgba(244,101,26,0.3)] transition-transform group-hover:scale-105">
              <Flame className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#1A1A2E]">
                  {STORE_CONFIG.name}
                </span>
                <span className="hidden sm:inline-block rounded-full bg-[#FFF5EF] px-2 py-0.5 text-[10px] font-black text-[#F4651A] border border-[#F4651A]/20">
                  Fresh & Hot
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-medium text-[#8E8E93]">
                {STORE_CONFIG.tagline}
              </p>
            </div>
          </Link>

          {/* Search Bar on Desktop & Tablet (Hidden on small mobile, shown on sm+) */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9EA7]">
              <Search className="h-[18px] w-[18px]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pizza, burger, sides, desserts..."
              className="w-full rounded-full bg-white py-2.5 pl-11 pr-14 text-[13px] font-medium text-[#1A1A2E] placeholder:text-[#A0A0AB] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 focus:border-[#F4651A] transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C7C7CC] text-white hover:bg-[#8E8E93] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
              <button
                type="button"
                className="text-[#8E8E93] hover:text-[#F4651A] transition-colors cursor-pointer"
                aria-label="Voice search"
                onClick={() => alert('Voice search ready! Listening for your favorite pizza...')}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions: Delivery Badge, Admin Link, Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Delivery address badge */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#1A1A2E] border border-black/[0.05] shadow-xs">
              <MapPin className="h-3.5 w-3.5 text-[#F4651A] shrink-0 fill-[#F4651A]" />
              <span className="truncate max-w-[140px] text-[12px]">{STORE_CONFIG.address}</span>
            </div>



            {/* Shopping Cart button */}
            <button
              onClick={openCart}
              id="header-cart-btn"
              className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F4651A] to-[#FF7730] px-4 py-2.5 text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:shadow-[0_6px_20px_rgba(244,101,26,0.45)] active:scale-95 transition-all cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs font-black">
                {totalCount > 0 ? (
                  <>
                    <span>{totalCount}</span>
                    <span className="hidden sm:inline ml-1 font-bold opacity-90">• {formatCurrency(totalAmount)}</span>
                  </>
                ) : (
                  <span>Cart (0)</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar & Location Row (Shown only on small screens < sm) */}
        <div className="mt-2.5 sm:hidden space-y-2">
          {/* Mobile Delivery address */}
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#8E8E93]">
            <MapPin className="h-3 w-3 text-[#F4651A] fill-[#F4651A]" />
            <span>Delivery to: <strong className="text-[#1A1A2E]">{STORE_CONFIG.address}</strong></span>
          </div>

          {/* Mobile Search Input */}
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9EA7]">
              <Search className="h-[16px] w-[16px]" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search pizza, burger, sides..."
              className="w-full rounded-full bg-white py-2.5 pl-10 pr-12 text-[13px] font-medium text-[#1A1A2E] placeholder:text-[#A0A0AB] shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C7C7CC] text-white hover:bg-[#8E8E93] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
              <button
                type="button"
                className="text-[#8E8E93] hover:text-[#F4651A] cursor-pointer"
                aria-label="Voice search"
                onClick={() => alert('Listening for your order...')}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
