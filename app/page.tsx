'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Banner } from '../components/Banner';
import { CategoryTabs } from '../components/CategoryTabs';
import { MenuList } from '../components/MenuList';
import { BottomCartBar } from '../components/BottomCartBar';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { Footer } from '../components/Footer';
import { getCategories, getProducts } from '../lib/api';
import { Category, Product } from '../types';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../lib/constants';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initial load for categories and products from backend database
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts('all'),
        ]);
        if (isMounted) {
          const cleanCats = (cats || []).filter((c) => c.id !== 'all' && c.name.toLowerCase() !== 'all');
          setCategories(cleanCats);
          setProducts(prods || []);
        }
      } catch (err) {
        console.error('Backend load failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by active category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'all' || p.cat === activeCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.section && p.section.toLowerCase().includes(q));

      return matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A2E] flex flex-col font-sans antialiased selection:bg-[#F4651A]/20 selection:text-[#F4651A]">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        <Banner />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />

        <MenuList
          products={filteredProducts}
          isLoading={isLoading}
          onOpenDetails={(p) => setSelectedProduct(p)}
        />
      </main>

      <Footer />

      {/* Floating Cart Bar (Bottom island on mobile & desktop) */}
      <BottomCartBar />

      {/* Product Details Sheet / Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart Drawer & Checkout Overlays */}
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
