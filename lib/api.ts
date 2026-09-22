import { Category, CreateOrderPayload, OrderRecord, Product } from '../types';

/**
 * Resolves the backend API base URL from runtime environment (window.__ENV__)
 * or build-time environment variable (process.env.NEXT_PUBLIC_API_URL).
 * Strips any trailing slashes.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__ENV__?.NEXT_PUBLIC_API_URL) {
    const runtimeUrl = ((window as any).__ENV__.NEXT_PUBLIC_API_URL as string).trim();
    if (runtimeUrl) return runtimeUrl.replace(/\/+$/, '');
  }
  const buildUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (buildUrl) {
    return buildUrl.replace(/\/+$/, '');
  }
  return '';
}

/** Formats endpoint with API base URL */
function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!base && typeof window !== 'undefined') {
    console.error(`[API Error] NEXT_PUBLIC_API_URL is not set in .env! Unable to reach: ${cleanPath}`);
  }
  return `${base}${cleanPath}`;
}

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
    const res = await fetchWithTimeout(apiUrl('/categories'), {
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

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithTimeout(apiUrl(`/products${queryString}`), {
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
  const res = await fetchWithTimeout(apiUrl('/orders'), {
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
      ? apiUrl(`/orders?status=${encodeURIComponent(status)}`)
      : apiUrl('/orders');
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
    const res = await fetchWithTimeout(apiUrl(`/orders/${id}/status`), {
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
  const res = await fetchWithTimeout(apiUrl('/products'), {
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
  const res = await fetchWithTimeout(apiUrl(`/products/${encodeURIComponent(id)}`), {
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
  const res = await fetchWithTimeout(apiUrl(`/products/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product: ${res.status}`);
  }
  return true;
}

export async function createCategory(payload: Partial<Category>, adminKey?: string): Promise<Category> {
  const res = await fetchWithTimeout(apiUrl('/categories'), {
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
  const res = await fetchWithTimeout(apiUrl(`/categories/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete category: ${res.status}`);
  }
  return true;
}

export async function seedDemoData(adminKey?: string): Promise<{ message: string; categoriesCount: number; productsCount: number }> {
  const res = await fetchWithTimeout(apiUrl('/seed?force=true'), {
    method: 'POST',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to seed data: ${res.status}`);
  }
  return await res.json();
}

export async function clearAllData(adminKey?: string): Promise<{ message: string; deletedCategories: number; deletedProducts: number }> {
  const res = await fetchWithTimeout(apiUrl('/seed/clear'), {
    method: 'DELETE',
    headers: getAdminHeaders(adminKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to clear data: ${res.status}`);
  }
  return await res.json();
}
