'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 'md', className = '', priority = false }: LogoProps) {
  const sizeMap = {
    sm: 'h-8 w-8 rounded-xl',
    md: 'h-11 w-11 sm:h-12 sm:w-12 rounded-2xl',
    lg: 'h-14 w-14 sm:h-16 sm:w-16 rounded-2xl',
    xl: 'h-20 w-20 rounded-3xl',
  };

  const pixelMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-md ring-2 ring-white/30 transition-transform hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Crust & Crave Logo"
        width={pixelMap[size]}
        height={pixelMap[size]}
        priority={priority}
        className="h-full w-full object-cover scale-105"
      />
    </div>
  );
}
