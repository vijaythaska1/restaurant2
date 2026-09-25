'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

function resolveImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
  }
  return url;
}

export function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const { addItem, changeQty, items } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasSizes = !!(product.sizes && Object.keys(product.sizes).length > 0);
  const sizeKeys = hasSizes ? Object.keys(product.sizes!) : [];
  const defaultSize = hasSizes ? sizeKeys[0] : undefined;

  const currentKey = product.id + (defaultSize ? `:${defaultSize}` : '');
  const addedItem = items.find((item) => item.key === currentKey);
  const isAdded = !!addedItem;
  const addedQty = addedItem?.qty ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, defaultSize);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedQty > 0) {
      changeQty(currentKey, -1);
    }
  };

  const displayPrice = hasSizes
    ? (product.sizes?.[defaultSize!] ?? 0)
    : (product.price ?? 0);

  const rating = product.rating || 4.7;
  const prepTime = product.prepTime || (product.cat === 'beverages' ? '5 min' : '20 min');
  const calories = product.calories || (product.cat === 'beverages' ? '180 kcal' : '480 kcal');

  return (
    <article
      onClick={() => onOpenDetails?.(product)}
      className="group relative flex flex-col rounded-[20px] sm:rounded-[28px] bg-white p-1.5 sm:p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-black/[0.04] transition-all duration-300 cursor-pointer overflow-hidden min-w-0 w-full h-full"
    >
      {/* Top Image Squircle Container */}
      <div className="relative w-full aspect-square rounded-[16px] sm:rounded-[22px] bg-[#F4F7F2] p-1.5 sm:p-2 flex items-center justify-center overflow-hidden shrink-0">
        {/* Floating Heart / Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all active:scale-80 cursor-pointer ${
            isLiked
              ? 'bg-[#F4651A] text-white'
              : 'bg-white/90 text-[#8E8E93] hover:text-[#F4651A]'
          }`}
          aria-label="Save to favorites"
        >
          <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isLiked ? 'fill-white' : ''}`} />
        </button>

        {/* Product Image */}
        {product.image && !imgError ? (
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-[12px] sm:rounded-[18px] transition-transform duration-500 group-hover:scale-105"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <span className="text-4xl sm:text-5xl select-none filter drop-shadow-sm">
            {product.cat === 'pizza' ? '🍕' : product.cat === 'burgers' ? '🍔' : product.cat === 'beverages' ? '🥤' : product.cat === 'sides' ? '🍟' : '🍽️'}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 justify-between p-1.5 sm:p-2 pt-2 min-w-0 min-h-0">
        <div className="min-w-0">
          {/* Title & Star Rating */}
          <div className="flex items-start justify-between gap-1 min-w-0">
            <h3 className="text-[12px] sm:text-[14px] font-extrabold text-[#1A1A2E] leading-snug tracking-tight line-clamp-2 min-h-[2.5em] group-hover:text-[#F4651A] transition-colors min-w-0 break-words">
              {product.name}
            </h3>
            <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black text-[#1A1A2E] shrink-0">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Badges: Time & Calories */}
          <div className="mt-1 sm:mt-1.5 flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="rounded-md bg-[#F2F2F7] px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#8E8E93]">
              {prepTime}
            </span>
            <span className="rounded-md bg-[#F2F2F7] px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#8E8E93]">
              {calories}
            </span>
          </div>
        </div>

        {/* Bottom Row: Price & Add Button */}
        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1 min-w-0">
          <div className="min-w-0 shrink">
            <span className="text-[13px] sm:text-[16px] font-black text-[#1A1A2E] whitespace-nowrap">
              {formatCurrency(displayPrice)}
            </span>
            {hasSizes && (
              <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-[9px] font-bold text-[#8E8E93]">
                {defaultSize}
              </span>
            )}
          </div>

          {/* Add to Cart Organic Button */}
          {isAdded ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0 rounded-full bg-[#F4651A] shadow-[0_2px_12px_rgba(244,101,26,0.3)] shrink-0"
            >
              <button
                type="button"
                onClick={handleDecrease}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white transition-all active:scale-90 cursor-pointer hover:bg-[#E05A15]"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3 stroke-[3]" />
              </button>
              <span className="min-w-[16px] sm:min-w-[20px] text-center text-[11px] sm:text-[12px] font-black text-white">
                {addedQty}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white transition-all active:scale-90 cursor-pointer hover:bg-[#E05A15]"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl bg-[#F4651A] text-white shadow-[0_4px_12px_rgba(244,101,26,0.25)] hover:bg-[#E05A15] active:scale-90 transition-all cursor-pointer shrink-0"
              aria-label={`Add ${product.name}`}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
