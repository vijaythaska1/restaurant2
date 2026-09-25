'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import {
  X,
  Heart,
  Star,
  Clock,
  MapPin,
  Flame,
  Wheat,
  Droplets,
  Beef,
  ArrowLeft,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { addItem } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const hasSizes = !!(product.sizes && Object.keys(product.sizes).length > 0);
  const sizeKeys = hasSizes ? Object.keys(product.sizes!) : [];

  // Default to first size if not selected
  const activeSize = hasSizes ? (selectedSize || sizeKeys[0]) : undefined;
  const unitPrice = hasSizes
    ? (product.sizes?.[activeSize!] ?? 0)
    : (product.price ?? 0);
  const totalPrice = unitPrice * quantity;

  // Nutritional values fallback
  const calories = product.calories || '459 kcal';
  const carbs = '36 gm';
  const fats = '44 gm';
  const protein = '55 gm';
  const rating = product.rating || 4.7;
  const prepTime = product.prepTime || '20 min';

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, activeSize);
    }
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative z-10 w-full max-w-[440px] max-h-[92vh] flex flex-col rounded-t-[36px] sm:rounded-[36px] bg-[#FAF8F5] shadow-2xl overflow-hidden border border-white/50">
        
        {/* Top Floating Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 pt-5 pb-2 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#1A1A2E] hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">Details</span>

          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md shadow-md active:scale-95 transition-all cursor-pointer ${
              isLiked ? 'bg-[#F4651A] text-white' : 'bg-white/90 text-[#8E8E93] hover:text-[#F4651A]'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-28 scrollbar-none">
          
          {/* Hero Food Visual */}
          <div className="relative mx-auto my-2 flex items-center justify-center">
            <div className="relative w-full max-w-[280px] aspect-square rounded-[32px] overflow-hidden bg-gradient-to-b from-white/90 to-amber-50/50 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white">
              {product.image ? (
                <img
                  src={resolveImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[24px] drop-shadow-md transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                  {product.cat === 'pizza' ? '🍕' : product.cat === 'burgers' ? '🍔' : '🍟'}
                </div>
              )}
            </div>
          </div>

          {/* Title & Price Row */}
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-black tracking-tight text-[#1A1A2E] leading-snug">
                {product.name}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1 text-[13px] font-bold text-[#1A1A2E]">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                </div>
                <span className="text-[12px] text-[#8E8E93] font-medium">(2.3k Reviews)</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[22px] font-black text-[#1A1A2E]">
                {formatCurrency(unitPrice)}
              </div>
              <div className="text-[12px] font-semibold text-[#8E8E93] line-through">
                {formatCurrency(Math.round(unitPrice * 1.25))}
              </div>
            </div>
          </div>

          {/* Badges Row */}
          <div className="mt-3.5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1A1A2E] shadow-sm border border-black/5">
              <span>{product.cat === 'pizza' ? '🍕 Artisanal' : '🍔 Gourmet'}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1A1A2E] shadow-sm border border-black/5">
              <Clock className="h-3 w-3 text-[#F4651A]" />
              <span>{prepTime}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1A1A2E] shadow-sm border border-black/5">
              <MapPin className="h-3 w-3 text-[#F4651A]" />
              <span>Free Delivery</span>
            </span>
          </div>

          {/* Nutrition 4-Pillar Glass Cards (Matches screenshot 2) */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#E8F5E9]/70 border border-[#C8E6C9] py-2.5 px-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#2E7D32]">Energy</span>
              <span className="mt-1 text-[12px] font-black text-[#1B5E20]">{calories}</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF8E1]/80 border border-[#FFE082] py-2.5 px-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#F57F17]">Carbs</span>
              <span className="mt-1 text-[12px] font-black text-[#E65100]">{carbs}</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF3E0]/80 border border-[#FFCC80] py-2.5 px-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#E65100]">Fats</span>
              <span className="mt-1 text-[12px] font-black text-[#BF360C]">{fats}</span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FCE4EC]/80 border border-[#F8BBD0] py-2.5 px-1 shadow-sm">
              <span className="text-[10px] font-bold text-[#C2185B]">Protein</span>
              <span className="mt-1 text-[12px] font-black text-[#880E4F]">{protein}</span>
            </div>
          </div>

          {/* Size Selector for Pizzas */}
          {hasSizes && product.sizes && (
            <div className="mt-5">
              <label className="block text-[12px] font-black text-[#1A1A2E] mb-2 uppercase tracking-wider">
                Select Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {sizeKeys.map((sz) => {
                  const isSelected = sz === activeSize;
                  const price = product.sizes![sz];
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F4651A] text-white border-[#F4651A] shadow-[0_4px_16px_rgba(244,101,26,0.3)]'
                          : 'bg-white text-[#1A1A2E] border-black/5 hover:border-[#F4651A]/40'
                      }`}
                    >
                      <span className={`text-[12px] font-black ${isSelected ? 'text-white' : 'text-[#1A1A2E]'}`}>
                        {sz}
                      </span>
                      <span className={`mt-0.5 text-[11px] font-bold ${isSelected ? 'text-white/90' : 'text-[#8E8E93]'}`}>
                        {formatCurrency(price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-5">
            <h3 className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-wider">
              Description
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6E6E73]">
              {product.desc || 'Crafted for those who crave bold flavor with a touch of elegance. Fresh artisanal ingredients hand-prepared daily.'}
              {!isExpanded && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="ml-1 font-bold text-[#F4651A] hover:underline cursor-pointer"
                >
                  Read more
                </button>
              )}
              {isExpanded && (
                <span className="block mt-1 text-[#8E8E93]">
                  All items are prepared fresh to order in our artisanal stone ovens using 100% natural ingredients, zero artificial preservatives, and extra virgin olive oil.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Bottom Fixed Action Bar (Matches screenshot 2) */}
        <div className="absolute bottom-0 inset-x-0 z-20 flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur-lg border-t border-black/5 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
          {/* Stepper */}
          <div className="flex items-center rounded-full bg-[#F2F2F7] px-1 py-1 shadow-inner">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A2E] shadow-sm active:scale-90 transition-all cursor-pointer"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[32px] text-center text-[13px] font-black text-[#1A1A2E]">
              {String(quantity).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1A1A2E] shadow-sm active:scale-90 transition-all cursor-pointer"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 px-6 font-black text-[14px] text-white shadow-[0_6px_20px_rgba(244,101,26,0.35)] active:scale-95 transition-all cursor-pointer ${
              addedAnimation ? 'bg-emerald-600' : 'bg-[#F4651A] hover:bg-[#E05A15]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <span>Add to Cart • {formatCurrency(totalPrice)}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
