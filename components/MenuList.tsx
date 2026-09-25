'use client';

import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { UtensilsCrossed } from 'lucide-react';

interface MenuListProps {
  products: Product[];
  isLoading?: boolean;
  onOpenDetails: (product: Product) => void;
}

export function MenuList({ products, isLoading, onOpenDetails }: MenuListProps) {
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-[3px] border-[#F4651A] border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-[#8E8E93]">Fetching fresh flavors...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF5EF] text-[#F4651A] shadow-xs">
          <UtensilsCrossed className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E]">No items found</h3>
        <p className="mt-1 text-sm font-medium text-[#8E8E93]">
          Try searching for something else or pick another category.
        </p>
      </div>
    );
  }

  // Group products by section
  const sectionMap = new Map<string, Product[]>();
  products.forEach((p) => {
    const sectionName = p.section || 'Featured Menu';
    const list = sectionMap.get(sectionName) || [];
    list.push(p);
    sectionMap.set(sectionName, list);
  });

  const sections = Array.from(sectionMap.entries());

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32 pt-4" aria-label="Menu items">
      {sections.map(([sectionName, items]) => (
        <div key={sectionName} className="mb-10">
          {/* Section Header with badge & count */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A2E] tracking-tight">
                {sectionName}
              </h2>
              <span className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-xs font-bold text-[#8E8E93]">
                {items.length}
              </span>
            </div>
            <span className="text-xs font-bold text-[#F4651A]">
              Fresh Today
            </span>
          </div>

          {/* Product Cards Grid: Responsive auto-fill grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
