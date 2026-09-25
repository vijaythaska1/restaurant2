'use client';

import React from 'react';
import { Category } from '../types';

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🛍️',
  burgers: '🍔',
  burger: '🍔',
  pizza: '🍕',
  sides: '🍟',
  beverages: '🥤',
  drinks: '🥤',
  dessert: '🍰',
  desserts: '🍩',
  pasta: '🍝',
  value: '💰',
};

function resolveImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  // Ensure "all" is first and strictly unique
  const cleanCategories = categories.filter((c) => c.id !== 'all' && c.name.toLowerCase() !== 'all');
  const allTabs = [{ id: 'all', name: 'All', desc: 'All items', order: 0 }, ...cleanCategories];

  return (
    <nav
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 pb-2"
      aria-label="Categories"
    >
      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none items-center">
        {allTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          const emoji = CATEGORY_EMOJIS[tab.id.toLowerCase()] || '🍽️';

          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-[13px] font-extrabold transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#F4651A] text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)]'
                  : 'bg-white text-[#1A1A2E] shadow-xs border border-black/[0.05] hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.image ? (
                <img
                  src={resolveImageUrl(tab.image)}
                  alt={tab.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="text-[14px] sm:text-[15px]">{emoji}</span>
              )}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
