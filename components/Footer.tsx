import React from 'react';
import Link from 'next/link';
import { STORE_CONFIG } from '../lib/constants';
import { Phone, ShieldCheck, Flame, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-[#1A1A2E] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4651A] text-white shadow-lg">
              <Flame className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {STORE_CONFIG.name}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-white/50">
                {STORE_CONFIG.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-bold text-white/80">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10">
              <Phone className="h-4 w-4 text-[#F4651A]" />
              <a href={`tel:${STORE_CONFIG.phone1}`} className="hover:text-white transition-colors">
                {STORE_CONFIG.phone1}
              </a>
              <span className="text-white/30">•</span>
              <a href={`tel:${STORE_CONFIG.phone2}`} className="hover:text-white transition-colors">
                {STORE_CONFIG.phone2}
              </a>
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-white transition-all shadow-xs"
            >
              <ShieldCheck className="h-4 w-4 text-[#F4651A]" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 text-center">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 fill-[#F4651A] text-[#F4651A]" />
            <span>for great food lovers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
