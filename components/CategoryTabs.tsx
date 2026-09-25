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

function CategoryTabItem({
  tab,
  isActive,
  onClick,
}: {
  tab: { id: string; name: string; image?: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [imgErr, setImgErr] = React.useState(false);
  const emoji = CATEGORY_EMOJIS[tab.id.toLowerCase()] || '🍽️';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-full whitespace-nowrap text-xs sm:text-[13px] font-extrabold transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 ${
        isActive
          ? 'bg-[#F4651A] text-white shadow-[0_4px_14px_rgba(244,101,26,0.35)] ring-2 ring-[#F4651A]/20'
          : 'bg-white text-[#1A1A2E] shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-black/[0.06] hover:bg-[#FFF5EF]/60 hover:border-[#F4651A]/30'
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
          isActive ? 'bg-white/20' : 'bg-[#F4F4F6]'
        }`}
      >
        {tab.image && !imgErr ? (
          <img
            src={resolveImageUrl(tab.image)}
            alt={tab.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover rounded-full"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span className="text-[13px] leading-none select-none">{emoji}</span>
        )}
      </span>
      <span className="leading-none">{tab.name}</span>
    </button>
  );
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
        {allTabs.map((tab) => (
          <CategoryTabItem
            key={tab.id}
            tab={tab}
            isActive={activeCategory === tab.id}
            onClick={() => onSelectCategory(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}
