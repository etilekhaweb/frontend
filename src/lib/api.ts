// Prefer explicit env var `VITE_API_BASE_URL` (set this in Pages/Render or your dev env).
// Fallback rules:
// - If running on `localhost` or `127.*` use local backend `http://localhost:5000/api/sb`
// - If running on the Pages domain (e.g. `etilekha.pages.dev`) use the Render backend
// - Otherwise default to Render backend. You can still override with `VITE_API_BASE_URL`.
const API_CANDIDATES = (() => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return [env];
  // prefer localhost when running locally
  if (typeof window === 'undefined') return ['https://backend-4ry8.onrender.com/api/sb'];
  const host = window.location.hostname || '';
  if (host === 'localhost' || host.startsWith('127.')) return ['http://localhost:5000/api/sb', 'https://backend-4ry8.onrender.com/api/sb'];
  // prefer Render for pages and other hosts
  return ['https://backend-4ry8.onrender.com/api/sb', 'http://localhost:5000/api/sb'];
})();

// Active API base used by requests. Start with the first candidate as a best-effort initial value.
let ACTIVE_API_BASE = API_CANDIDATES[0];

// Probe candidates in order and select the first one that responds to /api/health
async function probeApiBases() {
  if (typeof window === 'undefined') return;
  const protocol = window.location.protocol || 'http:';
  for (const candidate of API_CANDIDATES) {
    try {
      // avoid mixed-content: don't probe http from https page
      if (protocol === 'https:' && candidate.startsWith('http://')) continue;
      // derive health URL (candidate may include /api/sb)
      const base = candidate.replace(/\/api\/sb\/?$/, '');
      const healthUrl = `${base}/api/health`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const resp = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(id);
      if (resp.ok) {
        ACTIVE_API_BASE = candidate;
        // eslint-disable-next-line no-console
        console.info('[api] selected API_BASE_URL ->', ACTIVE_API_BASE);
        if (typeof window !== 'undefined') (window as any).__API_BASE_URL__ = ACTIVE_API_BASE;
        return;
      }
    } catch (e) {
      // probe failed, try next
    }
  }
  // if none succeeded, stick with initial candidate and expose it
  // eslint-disable-next-line no-console
  console.info('[api] using fallback API_BASE_URL ->', ACTIVE_API_BASE);
  if (typeof window !== 'undefined') (window as any).__API_BASE_URL__ = ACTIVE_API_BASE;
}

// start probe in background
void probeApiBases();

export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
  _count?: {
    products: number;
  };
};

export type ProductImage = {
  id: string;
  url: string;
};

export type ProductVariation = {
  id: string;
  name: string;
  value: string;
  priceAdded: number;
  imageUrl?: string | null;
};

export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description?: string | null;
  price: number;
  mainImage: string;
  isSignature: boolean;
  categoryId?: string | null;
  category?: Category | null;
  images: ProductImage[];
  variations: ProductVariation[];
};

export type OrderStatus = 'PENDING' | 'APPROVED' | 'DELIVERED' | 'CANCELLED';

export type Order = {
  id: string;
  guestDeviceId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    variationId?: string | null;
    quantity: number;
    priceAtOrder: number;
    product: Product;
  }>;
};

type OrderPayload = {
  guestDeviceId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    variationId?: string;
    quantity: number;
    priceAtOrder: number;
  }>;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${ACTIVE_API_BASE}${path}`, options);
  } catch {
    throw new Error(`Backend API is not reachable at ${ACTIVE_API_BASE}. Please start the backend server.`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error ?? 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const api = {
  getCategories: async () => {
    const raw = await request<any[]>('/categories');
    return raw.map((r) => ({
      id: r.id,
      name: r.name,
      imageUrl: r.image_url ?? r.imageUrl ?? null,
      _count: { products: r._count?.products ?? 0 },
    })) as Category[];
  },
  // createCategory now posts JSON { name, image_url }
  createCategory: (payload: { name: string; image_url?: string | null }) =>
    request<any>('/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request<{ success: true }>(`/categories/${id}`, { method: 'DELETE' }),

  getProducts: async (params?: { isSignature?: boolean; categoryId?: string }) => {
    const search = new URLSearchParams();
    if (params?.isSignature) search.set('isSignature', 'true');
    if (params?.categoryId) search.set('categoryId', params.categoryId);
    const query = search.toString();
    const raw = await request<any[]>(`/products${query ? `?${query}` : ''}`);
    return raw.map((p) => ({
      id: p.id,
      name: p.name,
      shortDescription: p.short_description ?? p.shortDescription ?? '',
      description: p.description ?? null,
      price: Number(p.price),
      mainImage: p.main_image ?? p.mainImage ?? '',
      isSignature: Boolean(p.is_signature ?? p.isSignature ?? false),
      categoryId: p.category_id ?? p.categoryId ?? null,
      category: p.category ? { id: p.category.id, name: p.category.name, imageUrl: p.category.image_url ?? null } : null,
      images: (p.product_image ?? p.images ?? []).map((img: any) => ({ id: img.id, url: img.url })),
      variations: (p.product_variation ?? p.variations ?? []).map((v: any) => ({ id: v.id, name: v.name, value: v.value, priceAdded: Number(v.price_added ?? v.priceAdded ?? 0), imageUrl: v.image_url ?? v.imageUrl ?? null })),
    })) as Product[];
  },
  getProduct: async (id: string) => {
    const p = await request<any>(`/products/${id}`);
    return {
      id: p.id,
      name: p.name,
      shortDescription: p.short_description ?? p.shortDescription ?? '',
      description: p.description ?? null,
      price: Number(p.price),
      mainImage: p.main_image ?? p.mainImage ?? '',
      isSignature: Boolean(p.is_signature ?? p.isSignature ?? false),
      categoryId: p.category_id ?? p.categoryId ?? null,
      category: p.category ? { id: p.category.id, name: p.category.name, imageUrl: p.category.image_url ?? null } : null,
      images: (p.product_image ?? p.images ?? []).map((img: any) => ({ id: img.id, url: img.url })),
      variations: (p.product_variation ?? p.variations ?? []).map((v: any) => ({ id: v.id, name: v.name, value: v.value, priceAdded: Number(v.price_added ?? v.priceAdded ?? 0), imageUrl: v.image_url ?? v.imageUrl ?? null })),
    } as Product;
  },
  createProduct: (payload: {
    name: string;
    short_description?: string;
    description?: string | null;
    price: number;
    is_signature?: boolean;
    category_id?: string | null;
    main_image?: string | null;
    images?: string[];
    variations?: any[];
    stock?: number;
    metadata?: any;
  }) => request<any>('/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: any) => request<any>(`/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  deleteProduct: (id: string) => request<{ success: true }>(`/products/${id}`, { method: 'DELETE' }),

  createOrder: (payload: OrderPayload) =>
    request<Order>('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getOrders: async () => {
    const raw = await request<any[]>('/orders');
    return raw.map((o) => ({
      id: o.id,
      guestDeviceId: o.guest_device_id ?? o.guestDeviceId ?? '',
      customerName: o.customer_name ?? o.customerName ?? '',
      customerEmail: o.customer_email ?? o.customerEmail ?? null,
      customerPhone: o.customer_phone ?? o.customerPhone ?? '',
      shippingAddress: o.shipping_address ?? o.shippingAddress ?? '',
      totalAmount: Number(o.total_amount ?? o.totalAmount ?? 0),
      status: (o.status ?? 'PENDING') as OrderStatus,
      createdAt: o.created_at ?? o.createdAt,
      items: (o.order_item ?? o.items ?? []).map((it: any) => ({
        id: it.id,
        productId: it.product_id ?? it.productId,
        variationId: it.variation_id ?? it.variationId ?? null,
        quantity: Number(it.quantity),
        priceAtOrder: Number(it.unit_price ?? it.price_at_order ?? it.priceAtOrder ?? 0),
        product: it.product ? {
          id: it.product.id,
          name: it.product.name,
          shortDescription: it.product.short_description ?? '',
          description: it.product.description ?? null,
          price: Number(it.product.price ?? 0),
          mainImage: it.product.main_image ?? '',
          isSignature: Boolean(it.product.is_signature ?? false),
          categoryId: it.product.category_id ?? null,
          category: null,
          images: [],
          variations: [],
        } : (it.product ?? null),
      })),
    })) as Order[];
  },
  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
};
