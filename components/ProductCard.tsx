'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

function getSizeAbbreviation(size: string): string {
  const s = size.trim().toLowerCase();
  if (s === 'small') return 'S';
  if (s === 'medium') return 'M';
  if (s === 'large') return 'L';
  if (s === 'regular') return 'R';
  if (s === 'half') return 'H';
  if (s === 'full') return 'F';
  if (size.length <= 3) return size.toUpperCase();
  return size.charAt(0).toUpperCase();
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, changeQty, items } = useCart();
  const hasSizes = !!(product.sizes && Object.keys(product.sizes).length > 0);
  const sizeKeys = hasSizes ? Object.keys(product.sizes!) : [];

  const [selectedSize, setSelectedSize] = useState<string>(
    hasSizes ? sizeKeys[0] : ''
  );

  const currentSize = hasSizes ? selectedSize : undefined;
  const currentKey = product.id + (currentSize ? `:${currentSize}` : '');
  const addedItem = items.find((item) => item.key === currentKey);
  const isAdded = !!addedItem;
  const addedQty = addedItem?.qty ?? 0;

  const handleAdd = () => {
    addItem(product, currentSize);
  };

  const handleDecrease = () => {
    if (addedQty > 0) {
      changeQty(currentKey, -1);
    }
  };

  const currentPrice = hasSizes
    ? (product.sizes?.[selectedSize] ?? 0)
    : (product.price ?? 0);

  return (
    <article className="flex flex-col justify-between rounded-[22px] border border-[#e8ece4] bg-white p-3 sm:p-3.5 shadow-[0_1px_4px_rgba(16,24,40,0.03)] transition-shadow hover:shadow-md">
      <div>
        {/* Header: Title and Category/Section Badge */}
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="text-[13px] sm:text-[15px] font-black leading-tight text-[#17251c] tracking-tight line-clamp-2">
            {product.name}
          </h3>
          {product.section && (
            <span className="shrink-0 rounded-md bg-[#eef7f0] px-1.5 py-0.5 text-[9px] font-bold text-[#1a7f40] whitespace-nowrap">
              {product.section}
            </span>
          )}
        </div>

        {/* Description */}
        {product.desc && (
          <p className="mt-1 text-[11px] leading-snug text-[#68716b] line-clamp-2">
            {product.desc}
          </p>
        )}

        {/* Size Selection (S, M, L pills) */}
        {hasSizes && product.sizes && (
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {sizeKeys.map((size) => {
              const price = product.sizes![size];
              const selected = size === selectedSize;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border py-1.5 px-0.5 text-center transition-all cursor-pointer ${
                    selected
                      ? 'border-[#16813f] bg-[#16813f] text-white shadow-xs'
                      : 'border-[#e5ede6] bg-[#f8faf7] text-[#17251c] hover:border-[#16813f]/40'
                  }`}
                >
                  <div className={`text-[11px] font-black uppercase ${selected ? 'text-white' : 'text-[#17251c]'}`}>
                    {getSizeAbbreviation(size)}
                  </div>
                  <div className={`mt-0.5 text-[10px] font-bold ${selected ? 'text-white/95' : 'text-[#505a52]'}`}>
                    {formatCurrency(price)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Area: Dedicated Price Row + Full-Width Action Button */}
      <div className="mt-3 pt-1">
        {/* Price & Size Info */}
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg font-black text-[#107b3b] tracking-tight">
            {formatCurrency(currentPrice)}
          </span>
          {hasSizes && selectedSize && (
            <span className="text-xs font-semibold text-[#68716b]">
              • {selectedSize}
            </span>
          )}
        </div>

        {/* Full-width Add Button / Quantity Controls */}
        {isAdded ? (
          <div className="mt-2 flex w-full items-center justify-between rounded-full bg-[#16813f] px-2 py-1 text-white shadow-xs">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 active:scale-90 cursor-pointer"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="text-xs sm:text-sm font-black text-white">
              {addedQty} in cart
            </span>

            <button
              type="button"
              onClick={handleAdd}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 active:scale-90 cursor-pointer"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#16813f] py-2 text-xs sm:text-sm font-black text-white shadow-xs transition hover:bg-[#126e35] active:scale-[0.98] cursor-pointer"
            aria-label={`Add ${product.name} to order`}
          >
            <span>Add</span>
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}
