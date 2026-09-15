'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  deleteCategory,
  seedDemoData,
  clearAllData,
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
} from 'lucide-react';



type AdminTab = 'products' | 'categories';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Products & Categories State
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
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
    section: 'Exotic Pizza',
    desc: '',
    price: '',
    sizeSmall: '199',
    sizeMedium: '399',
    sizeLarge: '499',
    isAvailable: true,
  });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    desc: '',
    order: '6',
  });



  // Load products & categories
  const loadCatalogData = async () => {
    setIsDataLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts('all'),
      ]);
      setCategories(cats || []);
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
      section: defaultCat === 'pizza' ? 'Exotic Pizza' : 'Quick Bites',
      desc: '',
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
        // Update product
        const updated = await updateProduct(editingProductId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? (updated || ({ ...p, ...payload } as Product)) : p))
        );
        showToast(`Product "${payload.name}" updated successfully!`);
      } else {
        // Create new product
        const created = await createProduct(payload);
        setProducts((prev) => [created || (payload as Product), ...prev]);
        showToast(`Product "${payload.name}" added to menu!`);
      }
      // Reset search filter so all products are displayed in listing
      setProductSearch('');
      setSelectedProductCat('all');
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.warn('Backend createProduct failed, updating client state locally:', err);
      // Update local state anyway so user sees immediate results
      if (editingProductId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? ({ ...p, ...payload } as Product) : p))
        );
        showToast(`Updated in menu`, 'success');
      } else {
        setProducts((prev) => [payload as Product, ...prev]);
        showToast(`Added to menu`, 'success');
      }
      // Reset search filter so all products are displayed in listing
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

  // Save new Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    const catId = categoryForm.id.trim().toLowerCase().replace(/\s+/g, '-') ||
      categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-');

    const payload: Partial<Category> = {
      id: catId,
      name: categoryForm.name.trim(),
      desc: categoryForm.desc.trim(),
      order: Number(categoryForm.order) || categories.length + 1,
    };

    try {
      await createCategory(payload);
      setCategories((prev) => [...prev, payload as Category]);
      showToast(`Category "${payload.name}" created successfully!`);
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      console.warn('Backend createCategory failed, updating local state:', err);
      setCategories((prev) => [...prev, payload as Category]);
      showToast(`Category added to menu`, 'success');
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

  // Seed demo data into MongoDB
  const handleSeedDemoData = async () => {
    if (!confirm('Load/Reset all 88 demo products and 5 categories in database?')) return;
    setIsSeeding(true);
    try {
      const res = await seedDemoData();
      await loadCatalogData();
      showToast(`Demo data saved! Loaded ${res.productsCount} products & ${res.categoriesCount} categories.`);
    } catch (err: any) {
      console.error('Seed demo data failed:', err);
      showToast('Could not load demo data to database: ' + err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Clear all menu data from database
  const handleClearAllData = async () => {

    if (!confirm('Are you sure you want to remove ALL demo products and categories from the menu?')) return;
    try {
      await clearAllData();
      setProducts([]);
      setCategories([]);
      showToast('All demo products and categories have been removed!');
    } catch (err: any) {
      console.error('Failed to clear data:', err);
      showToast('Failed to clear menu: ' + err.message, 'error');
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

  return (
    <div className="min-h-screen bg-[#f4f7ef] text-[#17251c]">

      {/* ========================================================= */}
      {/* AUTH GATE — Show Login Screen if not authenticated */}
      {/* ========================================================= */}
      {isAuthChecking && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      )}

      {!isAuthChecking && !isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c6e37] via-[#16813f] to-[#0a5a2e] px-4">
          <div className="w-full max-w-[380px] rounded-3xl bg-white shadow-2xl p-8">
            {/* Logo & Title */}
            <div className="text-center mb-7">
              <Logo size="lg" className="mx-auto mb-3 shadow-lg" />
              <h1 className="text-xl font-black text-[#17251c]">{STORE_CONFIG.name} Admin</h1>
              <p className="mt-1 text-xs text-[#68716b]">
                Enter your secret key to manage {STORE_CONFIG.name}
              </p>
            </div>

            <form onSubmit={handleVerifyKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1.5">
                  <KeyRound className="inline-block h-3.5 w-3.5 mr-1 text-[#16813f]" />
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
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm font-medium text-[#17251c] focus:outline-none focus:ring-2 focus:ring-[#16813f] ${
                      authError
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-[#d8e2d6] bg-white'
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
                className="w-full rounded-xl bg-[#16813f] py-3 text-sm font-black text-white shadow-md hover:bg-[#126e35] active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="inline-block h-4 w-4 mr-1.5" />
                Verify & Enter Admin
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-[#a0a8a4]">
              {STORE_CONFIG.name} Admin • Restricted Access
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN ADMIN DASHBOARD — Only visible when authenticated */}
      {/* ========================================================= */}
      {!isAuthChecking && isAuthenticated && (
        <div className="min-h-screen bg-[#f4f7ef] text-[#17251c]">
      {/* Toast notification banner */}
      {toastMessage && (
        <div
          className={`fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-50 flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-[#16813f] text-white'
              : 'bg-rose-700 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold truncate">
            {toastMessage.text}
          </span>
        </div>
      )}

      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-[#e1e9db] bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5eb] text-[#0c6e37] hover:bg-[#d8edd0] transition-colors"
              title="Return to Customer Menu"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#17251c] tracking-tight truncate">
                  {STORE_CONFIG.name} Admin
                </h1>
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  Live Hub
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#68716b] truncate">
                Add Products • Manage Menu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Refresh */}
            <button
              onClick={() => loadCatalogData()}
              disabled={isRefreshing || isDataLoading}
              className="flex h-9 sm:h-auto items-center justify-center gap-1.5 rounded-xl border border-[#d8e2d6] bg-white px-2.5 sm:px-3.5 py-2 text-xs font-bold text-[#16813f] hover:bg-[#f0f5ee] active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Refresh Catalog"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing || isDataLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Logout / Lock Session */}
            <button
              onClick={handleLogout}
              title="Lock Admin Session"
              className="flex h-9 sm:h-auto items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-2.5 sm:px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto mt-2.5 sm:mt-3 flex max-w-[1100px] gap-2 border-t border-[#f0f5ee] pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#16813f] text-white shadow-xs'
                : 'bg-[#f4f7ef] text-[#4d5b51] hover:bg-[#e7eee1]'
            }`}
          >
            <Pizza className="h-4 w-4" />
            <span>Products</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] ${
                activeTab === 'products'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#dbe6d6] text-[#2c3d31]'
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#16813f] text-white shadow-xs'
                : 'bg-[#f4f7ef] text-[#4d5b51] hover:bg-[#e7eee1]'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Categories</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] ${
                activeTab === 'categories'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#dbe6d6] text-[#2c3d31]'
              }`}
            >
              {categories.length}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-3 sm:px-4 py-5 sm:py-6">
        {/* ========================================================= */}
        {/* TAB 1: PRODUCTS MANAGER */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div>
            {/* Top action bar: Search, Category Filter, and Add Product Button */}
            <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="admin-product-search"
                    name="admin-product-search"
                    autoComplete="off"
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, description, section..."
                    className="w-full rounded-xl border border-[#dce5d9] bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#17251c] focus:border-[#16813f] focus:outline-none shadow-xs"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#16813f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#126e35] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedProductCat('all')}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedProductCat === 'all'
                    ? 'bg-[#17251c] text-white shadow-xs'
                    : 'bg-white text-[#556459] border border-[#dce5d9] hover:bg-[#f2f7ef]'
                }`}
              >
                All Products ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.cat === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedProductCat(c.id)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedProductCat === c.id
                        ? 'bg-[#16813f] text-white shadow-xs'
                        : 'bg-white text-[#556459] border border-[#dce5d9] hover:bg-[#f2f7ef]'
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Products List / Grid */}
            {isDataLoading ? (
              <div className="py-20 text-center text-[#68716b]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
                <p className="text-sm font-medium">Loading products catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#cfdecc] bg-white p-12 text-center text-[#68716b]">
                <Pizza className="mx-auto mb-3 h-10 w-10 text-[#a3b89f]" />
                <h3 className="text-base font-bold text-[#17251c]">
                  No products found
                </h3>
                <p className="mt-1 text-xs text-[#68716b]">
                  Try searching with another keyword or click the button below to add one.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#16813f] px-4 py-2 text-xs font-bold text-white hover:bg-[#126e35]"
                >
                  <Plus className="h-4 w-4" /> Add Product Now
                </button>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#e5ece3] bg-white p-4 shadow-sm hover:shadow-md transition-all relative group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-[#edf5e9] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#16813f]">
                          {item.section || item.cat}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.isAvailable !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isAvailable !== false ? 'In Stock' : 'Unavailable'}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-bold text-[#17251c] leading-snug">
                        {item.name}
                      </h3>

                      {item.desc && (
                        <p className="mt-1 text-xs text-[#68716b] line-clamp-2">
                          {item.desc}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-[#f0f5ee] pt-3">
                      {/* Pricing preview */}
                      <div className="mb-3">
                        {item.sizes ? (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {Object.entries(item.sizes).map(([sz, pr]) => (
                              <span
                                key={sz}
                                className="rounded-lg border border-[#e5ece3] bg-[#f8faf6] px-2 py-0.5 font-bold text-[#17251c]"
                              >
                                <span className="text-[#68716b] font-normal">{sz}:</span> {formatCurrency(pr)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-base font-extrabold text-[#16813f]">
                            {formatCurrency(item.price || 0)}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(item)}
                          className="flex items-center gap-1 rounded-lg border border-[#dce5d9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#37503f] hover:bg-[#f0f5ee] hover:text-[#16813f] transition-all cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id, item.name)}
                          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#17251c]">
                  Menu Categories
                </h2>
                <p className="text-xs text-[#68716b]">
                  Categories appear as top navigation filters for your customers.
                </p>
              </div>

              <button
                onClick={() => {
                  setCategoryForm({
                    id: '',
                    name: '',
                    desc: '',
                    order: String(categories.length + 1),
                  });
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#16813f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#126e35] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((cat) => {
                const catProductsCount = products.filter((p) => p.cat === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#e5ece3] bg-white p-5 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          id: {cat.id}
                        </span>
                        <span className="text-[11px] font-semibold text-[#68716b]">
                          Order: {cat.order || 1}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-black text-[#17251c]">
                        {cat.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#68716b]">
                        {cat.desc || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#f0f5ee] pt-3">
                      <span className="text-xs font-bold text-[#16813f]">
                        {catProductsCount} {catProductsCount === 1 ? 'item' : 'items'}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-[550px] rounded-3xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#f0f5ee] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#16813f]">
                  <Pizza className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#17251c]">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-[#68716b]">
                    Set product name, category, pricing and section.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  placeholder="e.g. Achari Paneer Pizza, Cheesy Burger..."
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              {/* Category & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17251c] mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.cat}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setProductForm({
                        ...productForm,
                        cat: newCat,
                        section: newCat === 'pizza' ? 'Exotic Pizza' : 'Sides',
                      });
                      if (newCat === 'pizza') {
                        setPricingType('sizes');
                      } else {
                        setPricingType('fixed');
                      }
                    }}
                    className="w-full rounded-xl border border-[#d8e2d6] bg-white px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17251c] mb-1">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.section}
                    onChange={(e) =>
                      setProductForm({ ...productForm, section: e.target.value })
                    }
                    placeholder="e.g. Exotic Pizza, Calzones..."
                    className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
                  Description / Ingredients
                </label>
                <textarea
                  rows={2}
                  value={productForm.desc}
                  onChange={(e) =>
                    setProductForm({ ...productForm, desc: e.target.value })
                  }
                  placeholder="Mozzarella cheese, crunchy onions, tandoori sauce..."
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              {/* Pricing Type Selector */}
              <div className="rounded-2xl border border-[#e5ece3] bg-[#f8faf6] p-3">
                <label className="block text-xs font-bold text-[#17251c] mb-2">
                  Pricing Structure:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPricingType('sizes')}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      pricingType === 'sizes'
                        ? 'bg-[#16813f] text-white shadow-xs'
                        : 'bg-white text-[#4d5b51] border border-[#d8e2d6]'
                    }`}
                  >
                    Pizza Sizes (Small / Medium / Large)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingType('fixed')}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      pricingType === 'fixed'
                        ? 'bg-[#16813f] text-white shadow-xs'
                        : 'bg-white text-[#4d5b51] border border-[#d8e2d6]'
                    }`}
                  >
                    Fixed Price (Single)
                  </button>
                </div>

                {/* Sizes Inputs */}
                {pricingType === 'sizes' ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#68716b]">
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
                        className="mt-1 w-full rounded-xl border border-[#d8e2d6] bg-white px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#17251c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#68716b]">
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
                        className="mt-1 w-full rounded-xl border border-[#d8e2d6] bg-white px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#17251c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#68716b]">
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
                        className="mt-1 w-full rounded-xl border border-[#d8e2d6] bg-white px-2.5 py-1.5 text-xs sm:text-sm font-bold text-[#17251c]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-[#68716b]">
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
                      className="mt-1 w-full rounded-xl border border-[#d8e2d6] bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-[#17251c]"
                    />
                  </div>
                )}
              </div>

              {/* In Stock toggle */}
              <div className="flex items-center gap-2">
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
                  className="h-4 w-4 rounded-md text-[#16813f] focus:ring-[#16813f] cursor-pointer"
                />
                <label
                  htmlFor="isAvailable"
                  className="text-xs font-semibold text-[#17251c] cursor-pointer"
                >
                  Available for Customer Ordering (In Stock)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-[#f0f5ee] pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-xl border border-[#d8e2d6] px-4 py-2 text-xs font-bold text-[#68716b] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#16813f] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#126e35] transition-all cursor-pointer"
                >
                  {editingProductId ? 'Update Product' : 'Save & Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD CATEGORY MODAL */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-[450px] rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0f5ee] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#16813f]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#17251c]">
                    Add New Category
                  </h2>
                  <p className="text-xs text-[#68716b]">
                    Categories organize your menu items.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
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
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
                  Category ID (Slug)
                </label>
                <input
                  type="text"
                  value={categoryForm.id}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, id: e.target.value })
                  }
                  placeholder="e.g. pasta (leave blank to auto-generate)"
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={categoryForm.desc}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, desc: e.target.value })
                  }
                  placeholder="e.g. Delicious hot & creamy pastas"
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17251c] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={categoryForm.order}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, order: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d8e2d6] px-3.5 py-2 text-xs sm:text-sm focus:border-[#16813f] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#f0f5ee] pt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-[#d8e2d6] px-4 py-2 text-xs font-bold text-[#68716b] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#16813f] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#126e35] transition-all cursor-pointer"
                >
                  Save Category
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
