'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function Banner() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2"
      aria-label="Welcome banner"
    >
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5EF] px-3 py-1 text-xs font-black text-[#F4651A] border border-[#F4651A]/20 mb-2">
          <Sparkles className="h-3.5 w-3.5 fill-[#F4651A]" aria-hidden="true" />
          <span>Craving Authentic Flavors?</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A2E] leading-[1.15] tracking-tight">
          Hungry? We Got You Served!
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#8E8E93] max-w-xl">
          Artisanal stone-baked pizzas, handcrafted smash burgers &amp; crispy sides, freshly prepared for you.
        </p>
      </div>
    </section>
  );
}
