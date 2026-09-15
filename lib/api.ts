import { Category, CreateOrderPayload, OrderRecord, Product } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const FETCH_TIMEOUT_MS = 15000;

/** Creates a fetch request with an AbortController timeout */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

/** Returns admin headers with the x-admin-key for protected endpoints */
function getAdminHeaders(adminKey?: string): Record<string, string> {
  const key =
    adminKey ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('ph_admin_key') || 'admin786' : 'admin786');
  return {
    'Content-Type': 'application/json',
    'x-admin-key': key,
  };
}

// ─── Public (Customer) Endpoints ────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/categories`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Backend categories unavailable:', err);
    return [];
  }
}

export async function getProducts(cat?: string, search?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (cat && cat !== 'all') params.append('cat', cat);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await fetchWithTimeout(`${API_BASE_URL}/products?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Backend products unavailable:', err);
    return [];
  }
}

export async function submitOrder(payload: CreateOrderPayload): Promise<OrderRecord> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to save order: status ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function getOrders(status?: string): Promise<OrderRecord[]> {
  try {
    const url = status && status !== 'all'
      ? `${API_BASE_URL}/orders?status=${encodeURIComponent(status)}`
      : `${API_BASE_URL}/orders`;
    const res = await fetchWithTimeout(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<OrderRecord | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error updating order status:', err);
    return null;
  }
}

// ─── Admin (Protected) Endpoints ────────────────────────────

export async function createProduct(payload: Partial<Product>, adminKey?: string): Promise<Product> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAdminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to create product: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function updateProduct(id: string, payload: Partial<Product>, adminKey?: string): Promise<Product> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAdminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to update product: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function deleteProduct(id: string, adminKey?: string): Promise<boolean> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product: ${res.status}`);
  }
  return true;
}

export async function createCategory(payload: Partial<Category>, adminKey?: string): Promise<Category> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAdminHeaders(adminKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to create category: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function deleteCategory(id: string, adminKey?: string): Promise<boolean> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete category: ${res.status}`);
  }
  return true;
}

export async function seedDemoData(adminKey?: string): Promise<{ message: string; categoriesCount: number; productsCount: number }> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/seed?force=true`, {
    method: 'POST',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to seed data: ${res.status}`);
  }
  return await res.json();
}

export async function clearAllData(adminKey?: string): Promise<{ message: string; deletedCategories: number; deletedProducts: number }> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/seed/clear`, {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to clear data: ${res.status}`);
  }
  return await res.json();
}
