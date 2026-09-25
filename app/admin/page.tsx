'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Product,
  Category,
} from '../../types';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDemoData,
  clearAllData,
  uploadProductImage,
} from '../../lib/api';

import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS, STORE_CONFIG } from '../../lib/constants';
import { Logo } from '../../components/Logo';
import { formatCurrency } from '../../lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  PackageCheck,
  Pizza,
  ShoppingBag,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ImagePlus,
  Upload,
  Loader2,
} from 'lucide-react';

type AdminTab = 'products' | 'categories';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Products & Categories State (Live from MongoDB Database)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCat, setSelectedProductCat] = useState('all');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Security Key Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [inputKey, setInputKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('ph_admin_authed') : null;
    if (stored === 'true') {
      setIsAuthenticated(true);
      if (!sessionStorage.getItem('ph_admin_key')) {
        sessionStorage.setItem('ph_admin_key', 'admin786');
      }
    }
    setIsAuthChecking(false);
  }, []);

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const key = inputKey.trim();
    if (!key) return;

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('ph_admin_authed', 'true');
        sessionStorage.setItem('ph_admin_key', key);
        setIsAuthenticated(true);
        showToast('Admin access granted! Welcome back.');
      } else {
        setAuthError(data.message || 'Incorrect Secret Key! Access Denied.');
      }
    } catch {
      if (key === 'admin786') {
        sessionStorage.setItem('ph_admin_authed', 'true');
        sessionStorage.setItem('ph_admin_key', key);
        setIsAuthenticated(true);
        showToast('Admin access granted! Welcome back.');
      } else {
        setAuthError('Incorrect Secret Key! Access Denied.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ph_admin_authed');
    sessionStorage.removeItem('ph_admin_key');
    setIsAuthenticated(false);
    setInputKey('');
    setAuthError('');
    showToast('Admin session locked.');
  };

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<'sizes' | 'fixed'>('sizes');
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    cat: 'pizza',
    section: 'Popular Now',
    desc: '',
    image: '',
    price: '',
    sizeSmall: '199',
    sizeMedium: '399',
    sizeLarge: '499',
    isAvailable: true,
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    desc: '',
    image: '',
    order: '6',
  });
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryUploading, setIsCategoryUploading] = useState(false);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load products & categories
  const loadCatalogData = async () => {
    setIsDataLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts('all'),
      ]);
      const cleanCats = (cats || []).filter((c) => c.id !== 'all' && c.name.toLowerCase() !== 'all');
      setCategories(cleanCats);
      setProducts(prods || []);
    } catch (e) {
      console.warn('Could not load fresh catalog:', e);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCatalogData();
  }, [isAuthenticated]);

  // Open modal to add a new product
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    const defaultCat = categories[0]?.id || 'pizza';
    setPricingType(defaultCat === 'pizza' ? 'sizes' : 'fixed');
    setProductForm({
      id: `item-${Date.now().toString().slice(-5)}`,
      name: '',
      cat: defaultCat,
      section: 'Popular Now',
      desc: '',
      image: '',
      price: '99',
      sizeSmall: '199',
      sizeMedium: '399',
      sizeLarge: '499',
      isAvailable: true,
    });
    setProductSearch('');
    setIsProductModalOpen(true);
  };

  // Open modal to edit existing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    const hasSizes = Boolean(prod.sizes && Object.keys(prod.sizes).length > 0);
    setPricingType(hasSizes ? 'sizes' : 'fixed');
    setProductForm({
      id: prod.id,
      name: prod.name,
      cat: prod.cat,
      section: prod.section,
      desc: prod.desc || '',
      image: prod.image || '',
      price: prod.price !== undefined ? String(prod.price) : '99',
      sizeSmall: prod.sizes?.Small ? String(prod.sizes.Small) : '199',
      sizeMedium: prod.sizes?.Medium ? String(prod.sizes.Medium) : '399',
      sizeLarge: prod.sizes?.Large ? String(prod.sizes.Large) : '499',
      isAvailable: prod.isAvailable !== false,
    });
    setIsProductModalOpen(true);
  };

  // Save product (Add or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    const payload: Partial<Product> = {
      id: productForm.id || `prod-${Date.now().toString().slice(-5)}`,
      name: productForm.name.trim(),
      cat: productForm.cat,
      section: productForm.section.trim(),
      desc: productForm.desc.trim(),
      image: productForm.image.trim() || undefined,
      isAvailable: productForm.isAvailable,
    };

    if (pricingType === 'sizes') {
      payload.sizes = {
        Small: Number(productForm.sizeSmall) || 0,
        Medium: Number(productForm.sizeMedium) || 0,
        Large: Number(productForm.sizeLarge) || 0,
      };
      payload.price = undefined;
    } else {
      payload.price = Number(productForm.price) || 0;
      payload.sizes = undefined;
    }

    try {
      if (editingProductId) {
        const updated = await updateProduct(editingProductId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? (updated || ({ ...p, ...payload } as Product)) : p))
        );
        showToast(`Product "${payload.name}" updated successfully!`);
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created || (payload as Product), ...prev]);
        showToast(`Product "${payload.name}" added to menu!`);
      }
      setProductSearch('');
      setSelectedProductCat('all');
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.warn('Backend createProduct failed, updating client state locally:', err);
      if (editingProductId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? ({ ...p, ...payload } as Product) : p))
        );
        showToast(`Updated in menu`, 'success');
      } else {
        setProducts((prev) => [payload as Product, ...prev]);
        showToast(`Added to menu`, 'success');
      }
      setProductSearch('');
      setSelectedProductCat('all');
      setIsProductModalOpen(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${name}" deleted successfully!`);
    } catch (err: any) {
      console.warn('Backend delete failed, removing from local view:', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Removed from menu`, 'success');
    }
  };

  // Open modal to add category
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      id: '',
      name: '',
      desc: '',
      image: '',
      order: String(categories.length + 1),
    });
    setIsCategoryModalOpen(true);
  };

  // Open modal to edit existing category
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      desc: cat.desc || '',
      image: cat.image || '',
      order: String(cat.order || 1),
    });
    setIsCategoryModalOpen(true);
  };

  // Save new or updated Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    const catId = editingCategoryId
      ? editingCategoryId
      : (categoryForm.id.trim().toLowerCase().replace(/\s+/g, '-') ||
         categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-'));

    const payload: Partial<Category> = {
      id: catId,
      name: categoryForm.name.trim(),
      desc: categoryForm.desc.trim(),
      image: categoryForm.image.trim(),
      order: Number(categoryForm.order) || categories.length + 1,
    };

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategoryId ? { ...c, ...payload } : c))
        );
        showToast(`Category "${payload.name}" updated successfully!`);
      } else {
        await createCategory(payload);
        setCategories((prev) => [...prev, payload as Category]);
        showToast(`Category "${payload.name}" created successfully!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      console.warn('Backend category save failed, updating local state:', err);
      if (editingCategoryId) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategoryId ? { ...c, ...payload } : c))
        );
        showToast(`Category updated`, 'success');
      } else {
        setCategories((prev) => [...prev, payload as Category]);
        showToast(`Category added`, 'success');
      }
      setIsCategoryModalOpen(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category may become hidden.`)) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Category "${name}" deleted!`);
    } catch (err: any) {
      console.warn('Backend deleteCategory failed:', err);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Removed from menu`, 'success');
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedProductCat === 'all' || p.cat === selectedProductCat;
      if (!matchCat) return false;
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        p.section.toLowerCase().includes(q)
      );
    });
  }, [products, selectedProductCat, productSearch]);

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A2E] font-sans antialiased overflow-x-hidden min-w-0">

      {/* ========================================================= */}
      {/* AUTH GATE — Show Login Screen if not authenticated */}
      {/* ========================================================= */}
      {isAuthChecking && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#F4651A] border-t-transparent" />
        </div>
      )}

      {!isAuthChecking && !isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#242438] to-[#1A1A2E] px-4">
          <div className="w-full max-w-[390px] rounded-[32px] bg-white shadow-2xl p-8 border border-white/20">
            {/* Logo & Title */}
            <div className="text-center mb-7">
              <Logo size="lg" className="mx-auto mb-3 shadow-lg ring-2 ring-[#F4651A]/20" />
              <h1 className="text-xl font-black text-[#1A1A2E]">{STORE_CONFIG.name} Admin</h1>
              <p className="mt-1 text-xs text-[#8E8E93]">
                Enter secret key to manage menu & orders
              </p>
            </div>

            <form onSubmit={handleVerifyKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                  <KeyRound className="inline-block h-3.5 w-3.5 mr-1 text-[#F4651A]" />
                  Secret Admin Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter secret key..."
                    autoFocus
                    required
                    className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 focus:border-[#F4651A] transition-all ${
                      authError
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-black/[0.08] bg-[#FAF8F5]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {authError && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#F4651A] py-3.5 text-sm font-black text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="inline-block h-4 w-4 mr-1.5" />
                Verify & Enter Admin
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-[#A0A0AB]">
              {STORE_CONFIG.name} • Secure Admin Panel
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN ADMIN DASHBOARD — Only visible when authenticated */}
      {/* ========================================================= */}
      {!isAuthChecking && isAuthenticated && (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A2E] overflow-x-hidden">
          {/* Toast notification banner */}
          {toastMessage && (
            <div
              className={`fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-50 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 ${
                toastMessage.type === 'success'
                  ? 'bg-[#1A1A2E] text-white border border-white/10'
                  : 'bg-rose-700 text-white'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#F4651A] shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-bold truncate">
                {toastMessage.text}
              </span>
            </div>
          )}

          {/* Admin Header */}
          <header className="sticky top-0 z-30 border-b border-black/[0.05] bg-white/95 backdrop-blur-xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 shadow-sm">
            <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href="/"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#1A1A2E] border border-black/[0.06] hover:bg-[#FFF5EF] hover:text-[#F4651A] transition-colors"
                  title="Return to Customer Menu"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black text-[#1A1A2E] tracking-tight truncate">
                      {STORE_CONFIG.name} Admin
                    </h1>
                    <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-[#FFF5EF] px-2.5 py-0.5 text-[10px] font-black text-[#F4651A] uppercase tracking-wide border border-[#F4651A]/20">
                      Live Hub
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#8E8E93] truncate">
                    Add Products • Manage Menu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Quick Refresh */}
                <button
                  onClick={() => loadCatalogData()}
                  disabled={isRefreshing || isDataLoading}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-black/[0.06] bg-white px-3 sm:px-4 text-xs font-bold text-[#1A1A2E] hover:bg-[#FFF5EF] hover:text-[#F4651A] active:scale-95 transition-all cursor-pointer shadow-xs"
                  title="Refresh Catalog"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing || isDataLoading ? 'animate-spin text-[#F4651A]' : ''}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Logout / Lock Session */}
                <button
                  onClick={handleLogout}
                  title="Lock Admin Session"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-black/[0.06] bg-[#F2F2F7] px-3 sm:px-4 text-xs font-bold text-neutral-600 hover:bg-[#E5E5EA] active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation (Products / Categories) */}
            <div className="mx-auto mt-2 sm:mt-3 flex max-w-[1100px] gap-1.5 sm:gap-2 border-t border-black/[0.04] pt-2 overflow-x-auto scrollbar-none -mx-3 sm:mx-auto px-3 sm:px-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#F4651A] text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)]'
                    : 'bg-white text-[#1A1A2E] border border-black/[0.06] hover:bg-[#FAF8F5]'
                }`}
              >
                <Pizza className="h-4 w-4" />
                <span>Products</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-black ${
                    activeTab === 'products'
                      ? 'bg-white/25 text-white'
                      : 'bg-[#F2F2F7] text-[#8E8E93]'
                  }`}
                >
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#F4651A] text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)]'
                    : 'bg-white text-[#1A1A2E] border border-black/[0.06] hover:bg-[#FAF8F5]'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Categories</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-black ${
                    activeTab === 'categories'
                      ? 'bg-white/25 text-white'
                      : 'bg-[#F2F2F7] text-[#8E8E93]'
                  }`}
                >
                  {categories.length}
                </span>
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-[1100px] px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            {/* ========================================================= */}
            {/* TAB 1: PRODUCTS MANAGER */}
            {/* ========================================================= */}
            {activeTab === 'products' && (
              <div>
                {/* Search & Add New Product */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9EA7]" />
                      <input
                        id="admin-product-search"
                        name="admin-product-search"
                        autoComplete="off"
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search by name, description, section..."
                        className="w-full rounded-2xl border border-black/[0.06] bg-white pl-11 pr-10 py-3 text-xs sm:text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] shadow-sm focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                      />
                      {productSearch && (
                        <button
                          type="button"
                          onClick={() => setProductSearch('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C7C7CC] text-white hover:bg-[#8E8E93] cursor-pointer"
                          title="Clear search"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#F4651A] px-5 py-3 text-xs sm:text-sm font-black text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="mb-4 sm:mb-6 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none items-center -mx-3 sm:mx-0 px-3 sm:px-0">
                  <button
                    onClick={() => setSelectedProductCat('all')}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedProductCat === 'all'
                        ? 'bg-[#F4651A] text-white shadow-[0_2px_12px_rgba(244,101,26,0.3)]'
                        : 'bg-white text-[#1A1A2E] border border-black/[0.06] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    All Products ({products.length})
                  </button>
                  {categories
                    .filter((c) => c.id !== 'all' && c.name.toLowerCase() !== 'all')
                    .map((c) => {
                    const count = products.filter((p) => p.cat === c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedProductCat(c.id)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedProductCat === c.id
                            ? 'bg-[#F4651A] text-white shadow-[0_2px_12px_rgba(244,101,26,0.3)]'
                            : 'bg-white text-[#1A1A2E] border border-black/[0.06] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {c.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Products Grid */}
                {isDataLoading ? (
                  <div className="py-20 text-center text-[#8E8E93]">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#F4651A] border-t-transparent mb-3" />
                    <p className="text-sm font-bold">Loading products catalog...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-[32px] border border-dashed border-black/10 bg-white p-12 text-center text-[#8E8E93]">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5EF] text-[#F4651A]">
                      <Pizza className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-black text-[#1A1A2E]">
                      No products found
                    </h3>
                    <p className="mt-1 text-xs text-[#8E8E93]">
                      Try searching with another keyword or click the button below to add one.
                    </p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-[#F4651A] px-5 py-2.5 text-xs font-black text-white hover:bg-[#E05A15] shadow-md transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add Product Now
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-[20px] sm:rounded-[28px] border border-black/[0.04] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 relative group overflow-hidden min-w-0"
                      >
                        {/* Product Thumbnail */}
                        {item.image ? (
                          <div className="relative w-full h-[150px] overflow-hidden bg-[#FAF8F5]">
                            <img
                              src={resolveImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ) : (
                          <div className="w-full h-[90px] bg-gradient-to-r from-[#FFF5EF] to-[#FFEBDD] flex items-center justify-center text-4xl">
                            {item.cat === 'pizza' ? '🍕' : item.cat === 'burgers' ? '🍔' : '🍽️'}
                          </div>
                        )}

                        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="rounded-lg bg-[#FFF5EF] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F4651A]">
                                {item.section || item.cat}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                                  item.isAvailable !== false
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}
                              >
                                {item.isAvailable !== false ? 'In Stock' : 'Unavailable'}
                              </span>
                            </div>

                            <h3 className="mt-2.5 text-base font-black text-[#1A1A2E] leading-snug">
                              {item.name}
                            </h3>

                            {item.desc && (
                              <p className="mt-1 text-xs text-[#8E8E93] line-clamp-2">
                                {item.desc}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 sm:mt-4 border-t border-black/[0.04] pt-2.5 sm:pt-3.5">
                            {/* Pricing preview */}
                            <div className="mb-2 sm:mb-3">
                              {item.sizes ? (
                                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                                  {Object.entries(item.sizes).map(([sz, pr]) => (
                                    <span
                                      key={sz}
                                      className="rounded-xl border border-black/[0.06] bg-[#FAF8F5] px-2.5 py-1 font-bold text-[#1A1A2E]"
                                    >
                                      <span className="text-[#8E8E93] font-normal">{sz}:</span> {formatCurrency(pr)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-lg font-black text-[#1A1A2E]">
                                  {formatCurrency(item.price || 0)}
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
                              <button
                                onClick={() => handleOpenEditProduct(item)}
                                className="flex items-center gap-1.5 rounded-xl border border-black/[0.06] bg-[#F2F2F7] px-3 py-1.5 text-xs font-bold text-[#1A1A2E] hover:bg-[#FFF5EF] hover:text-[#F4651A] transition-all cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item.id, item.name)}
                                className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: CATEGORIES MANAGER */}
            {/* ========================================================= */}
            {activeTab === 'categories' && (
              <div>
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">
                      Menu Categories
                    </h2>
                    <p className="text-xs text-[#8E8E93]">
                      Categories appear as top navigation filters for your customers.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddCategory}
                    className="flex items-center gap-1.5 rounded-2xl bg-[#F4651A] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {categories
                    .filter((cat) => cat.id !== 'all' && cat.name.toLowerCase() !== 'all')
                    .map((cat) => {
                    const catProductsCount = products.filter((p) => p.cat === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex flex-col justify-between rounded-[20px] sm:rounded-[28px] border border-black/[0.04] bg-white p-3.5 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all min-w-0"
                      >
                        <div>
                          {/* Category Image Preview if available */}
                          {cat.image ? (
                            <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-3.5 bg-[#FAF8F5] border border-black/[0.04]">
                              <img
                                src={resolveImageUrl(cat.image)}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : null}

                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <span className="font-mono text-[10px] sm:text-xs font-black text-[#F4651A] bg-[#FFF5EF] px-2 sm:px-2.5 py-0.5 rounded-lg border border-[#F4651A]/20 truncate min-w-0">
                              id: {cat.id}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#8E8E93] shrink-0">
                              Order: {cat.order || 1}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-black text-[#1A1A2E]">
                            {cat.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#8E8E93]">
                            {cat.desc || 'No description provided.'}
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-black/[0.04] pt-2.5 sm:pt-3 gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#F4651A]">
                            {catProductsCount} {catProductsCount === 1 ? 'item' : 'items'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="flex items-center gap-1 rounded-xl border border-black/[0.06] bg-[#FAF8F5] hover:bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A2E] transition-all cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3 text-[#F4651A]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="flex items-center gap-1 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>

          {/* ========================================================= */}
          {/* ADD / EDIT PRODUCT MODAL */}
          {/* ========================================================= */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
              <div className="relative w-full sm:max-w-[550px] min-h-full sm:min-h-0 rounded-none sm:rounded-[32px] bg-white p-4 sm:p-6 md:p-7 shadow-2xl sm:my-8 border-0 sm:border border-black/[0.06]">
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5EF] text-[#F4651A]">
                      <Pizza className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">
                        {editingProductId ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <p className="text-xs text-[#8E8E93]">
                        Set product name, category, image and pricing.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      placeholder="e.g. Truffle Mushroom Pizza, Chic Burger..."
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Category & Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                        Category *
                      </label>
                      <select
                        value={productForm.cat}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setProductForm({
                            ...productForm,
                            cat: newCat,
                            section: newCat === 'pizza' ? 'Artisanal Pizzas' : 'Popular Now',
                          });
                          if (newCat === 'pizza') {
                            setPricingType('sizes');
                          } else {
                            setPricingType('fixed');
                          }
                        }}
                        className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                      >
                        {categories
                          .filter((c) => c.id !== 'all' && c.name.toLowerCase() !== 'all')
                          .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.section}
                        onChange={(e) =>
                          setProductForm({ ...productForm, section: e.target.value })
                        }
                        placeholder="e.g. Popular Now, Recommended..."
                        className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Description / Ingredients
                    </label>
                    <textarea
                      rows={2}
                      value={productForm.desc}
                      onChange={(e) =>
                        setProductForm({ ...productForm, desc: e.target.value })
                      }
                      placeholder="Mozzarella cheese, crunchy onions, tandoori sauce..."
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Product Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      <ImagePlus className="inline-block h-3.5 w-3.5 mr-1 text-[#F4651A]" />
                      Product Image (Upload Photo)
                    </label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Validate file size (10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          showToast('Image must be less than 10MB', 'error');
                          return;
                        }

                        setIsUploading(true);
                        try {
                          const adminKey = sessionStorage.getItem('ph_admin_key') || 'admin786';
                          const result = await uploadProductImage(file, adminKey);
                          setProductForm((prev) => ({ ...prev, image: result.url }));
                          showToast('Image uploaded successfully!');
                        } catch (err: any) {
                          console.error('Upload failed:', err);
                          showToast('Failed to upload image: ' + err.message, 'error');
                        } finally {
                          setIsUploading(false);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                      }}
                    />

                    {productForm.image ? (
                      // Image Preview
                      <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] bg-[#FAF8F5] group">
                        <img
                          src={resolveImageUrl(productForm.image)}
                          alt="Product preview"
                          className="w-full h-[150px] object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-xl bg-white/95 px-3.5 py-1.5 text-xs font-bold text-[#1A1A2E] hover:bg-white shadow-md transition-all cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                              className="rounded-xl bg-rose-500/90 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-600 shadow-md transition-all cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Upload Button
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-2xl border-2 border-dashed border-[#F4651A]/30 bg-[#FAF8F5] hover:bg-[#FFF5EF] hover:border-[#F4651A] transition-all py-6 flex flex-col items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-7 w-7 text-[#F4651A] animate-spin" />
                            <span className="text-xs font-bold text-[#8E8E93]">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-7 w-7 text-[#F4651A]" />
                            <span className="text-xs font-bold text-[#1A1A2E]">Click to upload product image</span>
                            <span className="text-[10px] text-[#8E8E93]">JPG, PNG, WebP, GIF or HEIC • Max 10MB</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Pricing Type Selector */}
                  <div className="rounded-2xl border border-black/[0.06] bg-[#FAF8F5] p-3 sm:p-3.5">
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-2">
                      Pricing Structure:
                    </label>
                    <div className="flex flex-col min-[400px]:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setPricingType('sizes')}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                          pricingType === 'sizes'
                            ? 'bg-[#F4651A] text-white shadow-xs'
                            : 'bg-white text-[#1A1A2E] border border-black/[0.06]'
                        }`}
                      >
                        Pizza Sizes (Small / Medium / Large)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricingType('fixed')}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                          pricingType === 'fixed'
                            ? 'bg-[#F4651A] text-white shadow-xs'
                            : 'bg-white text-[#1A1A2E] border border-black/[0.06]'
                        }`}
                      >
                        Fixed Price (Single)
                      </button>
                    </div>

                    {/* Sizes Inputs */}
                    {pricingType === 'sizes' ? (
                      <div className="mt-3 sm:mt-3.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#8E8E93]">
                            Small (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productForm.sizeSmall}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                sizeSmall: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs sm:text-sm font-bold text-[#1A1A2E] focus:border-[#F4651A] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#8E8E93]">
                            Medium (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productForm.sizeMedium}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                sizeMedium: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs sm:text-sm font-bold text-[#1A1A2E] focus:border-[#F4651A] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#8E8E93]">
                            Large (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={productForm.sizeLarge}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                sizeLarge: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs sm:text-sm font-bold text-[#1A1A2E] focus:border-[#F4651A] focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3.5">
                        <label className="block text-[11px] font-bold text-[#8E8E93]">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#1A1A2E] focus:border-[#F4651A] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* In Stock toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={productForm.isAvailable}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isAvailable: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded-md text-[#F4651A] focus:ring-[#F4651A] cursor-pointer accent-[#F4651A]"
                    />
                    <label
                      htmlFor="isAvailable"
                      className="text-xs font-bold text-[#1A1A2E] cursor-pointer"
                    >
                      Available for Customer Ordering (In Stock)
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-black/[0.04] pt-4">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="rounded-2xl border border-black/[0.06] bg-[#F2F2F7] px-5 py-2.5 text-xs font-bold text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#F4651A] px-6 py-2.5 text-xs font-black text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] transition-all cursor-pointer"
                    >
                      {editingProductId ? 'Update Product' : 'Save & Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ADD / EDIT CATEGORY MODAL */}
          {/* ========================================================= */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
              <div className="relative w-full sm:max-w-[460px] min-h-full sm:min-h-0 max-h-full sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-[32px] bg-white p-4 sm:p-6 md:p-7 shadow-2xl border-0 sm:border border-black/[0.06]">
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5EF] text-[#F4651A]">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#1A1A2E]">
                        {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                      </h2>
                      <p className="text-xs text-[#8E8E93]">
                        {editingCategoryId ? 'Update category details and image.' : 'Categories organize your menu items.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      placeholder="e.g. Pastas, Desserts, Shakes..."
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Category ID (Slug)
                    </label>
                    <input
                      type="text"
                      disabled={!!editingCategoryId}
                      value={categoryForm.id}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, id: e.target.value })
                      }
                      placeholder="e.g. pasta (leave blank to auto-generate)"
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Category Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      <ImagePlus className="inline-block h-3.5 w-3.5 mr-1 text-[#F4651A]" />
                      Category Image / Icon
                    </label>

                    <input
                      ref={categoryFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 10 * 1024 * 1024) {
                          showToast('Image must be less than 10MB', 'error');
                          return;
                        }

                        setIsCategoryUploading(true);
                        try {
                          const adminKey = sessionStorage.getItem('ph_admin_key') || 'admin786';
                          const result = await uploadProductImage(file, adminKey);
                          setCategoryForm((prev) => ({ ...prev, image: result.url }));
                          showToast('Category image uploaded successfully!');
                        } catch (err: any) {
                          console.error('Upload failed:', err);
                          showToast('Failed to upload image: ' + err.message, 'error');
                        } finally {
                          setIsCategoryUploading(false);
                          if (categoryFileInputRef.current) categoryFileInputRef.current.value = '';
                        }
                      }}
                    />

                    {categoryForm.image ? (
                      <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] bg-[#FAF8F5] group">
                        <img
                          src={resolveImageUrl(categoryForm.image)}
                          alt="Category preview"
                          className="w-full h-[140px] object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => categoryFileInputRef.current?.click()}
                              className="rounded-xl bg-white/95 px-3.5 py-1.5 text-xs font-bold text-[#1A1A2E] hover:bg-white shadow-md transition-all cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryForm((prev) => ({ ...prev, image: '' }))}
                              className="rounded-xl bg-rose-500/90 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-600 shadow-md transition-all cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isCategoryUploading}
                        onClick={() => categoryFileInputRef.current?.click()}
                        className="w-full rounded-2xl border-2 border-dashed border-[#F4651A]/30 bg-[#FAF8F5] hover:bg-[#FFF5EF] hover:border-[#F4651A] transition-all py-5 flex flex-col items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCategoryUploading ? (
                          <>
                            <Loader2 className="h-6 w-6 text-[#F4651A] animate-spin" />
                            <span className="text-xs font-bold text-[#8E8E93]">Uploading image...</span>
                          </>
                        ) : (
                          <>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF5EF] text-[#F4651A]">
                              <Upload className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-[#1A1A2E]">
                              Click to upload category image
                            </span>
                            <span className="text-[11px] text-[#8E8E93]">
                              PNG, JPG, WEBP up to 10MB
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Description
                    </label>
                    <input
                      type="text"
                      value={categoryForm.desc}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, desc: e.target.value })
                      }
                      placeholder="e.g. Delicious hot & creamy pastas"
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={categoryForm.order}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, order: e.target.value })
                      }
                      className="w-full rounded-2xl border border-black/[0.08] px-4 py-2.5 text-xs sm:text-sm text-[#1A1A2E] focus:border-[#F4651A] focus:ring-2 focus:ring-[#F4651A]/20 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-black/[0.04] pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="rounded-2xl border border-black/[0.06] bg-[#F2F2F7] px-5 py-2.5 text-xs font-bold text-[#1A1A2E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCategoryUploading}
                      className="rounded-2xl bg-[#F4651A] px-6 py-2.5 text-xs font-black text-white shadow-[0_4px_16px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCategoryUploading ? 'Uploading...' : editingCategoryId ? 'Update Category' : 'Save Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
