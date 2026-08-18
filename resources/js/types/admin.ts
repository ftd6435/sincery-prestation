export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string[] | undefined>;
}

export interface ApiSuccessShape<T> {
  success: boolean;
  message?: string;
  data: T;
  token?: string;
  meta?: unknown;
}

export interface ApiUser {
  id: number;
  name: string;
  username: string | null;
  telephone: string;
  email: string | null;
  avatar_url: string | null;
  role: string; // e.g. super_admin / admin / editor / user
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminCustomer {
  id: number;
  full_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'new' | 'pending' | 'confirmed' | 'delivered' | 'canceled';
export type OrderDeliveryMode = 'Livraison' | 'Retrait boutique';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_unit: string | null;
  quantity: number;
  price: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminOrder {
  id: number;
  reference: string;
  status: OrderStatus;
  status_label: string;
  delivery_mode: OrderDeliveryMode;
  comment: string | null;
  internal_notes?: string | null;
  customer: AdminCustomer;
  items?: OrderItem[];
  items_count?: number;
  items_total?: number;
  can_confirm: boolean;
  can_cancel: boolean;
  can_deliver: boolean;
  created_at?: string;
  updated_at?: string;
}

export type QuoteRequestStatus = 'new' | 'priced' | 'approved' | 'rejected' | 'expired';

export interface QuoteItem {
  id: number;
  quote_request_id: number;
  product_id: number | null;
  product_name: string;
  product_unit: string | null;
  quantity: number;
  price_snapshot?: number | null;
  total_price: number;
}

export interface QuoteRequest {
  id: number;
  reference: string;
  status: QuoteRequestStatus;
  status_label: string;
  validity_date?: string | null;
  comment: string | null;
  internal_notes?: string | null;
  customer: AdminCustomer;
  items?: QuoteItem[];
  items_count?: number;
  items_total?: number;
  can_set_pricing: boolean;
  can_approve: boolean;
  can_reject: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  image_url: string | null;
  is_active: boolean;
  created_by_name: string | null;
  updated_by_name: string | null;
  children?: ProductCategory[];
  parent?: ProductCategory | null;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Product {
  id: number;
  reference: string;
  name: string;
  slug: string;
  category_id: number | null;
  category?: ProductCategory | null;
  short_description: string;
  description?: string | null;
  price: number | null;
  stock: number;
  low_stock_threshold: number;
  is_quote_only: boolean;
  unit: string | null;
  is_featured: boolean;
  is_available: boolean;
  is_published: boolean;
  published_at?: string | null;
  thumbnail_url: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  posts_count?: number;
  created_at?: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  category?: PostCategory | null;
  description?: string | null;
  content?: string | null;
  thumbnail_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  published_at?: string | null;
  created_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PartnerCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  category_id: number | null;
  category?: PartnerCategory | null;
  sector?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  website?: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  post?: Post | null;
  parent_id: number | null;
  parent?: Comment | null;
  children?: Comment[];
  author_name?: string | null;
  author_email?: string | null;
  content: string;
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  created_at?: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  is_verified: boolean;
  has_pending_verification: boolean;
  verified_at?: string | null;
  created_at?: string;
}

export type SettingType = 'boolean' | 'integer' | 'decimal' | 'json' | 'image' | 'text';

export interface SettingRow {
  id: number;
  key: string;
  raw_value: string | null;
  type: SettingType;
  value: unknown;
  value_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// —————————————————————————————————————————————————————————————————————————
// Dashboard stats
// —————————————————————————————————————————————————————————————————————————

export interface DashboardKpiBase {
  label: string;
  value: number;
}

export interface DashboardStats {
  generated_at: string;
  kpis: {
    products: DashboardKpiBase & { published: number; unavailable: number };
    revenue_month_confirmed: DashboardKpiBase & {
      value_formatted: string;
      variation_vs_last_month_pct: number;
      previous_value: number;
      previous_value_formatted: string;
    };
    orders: DashboardKpiBase & { pending: number; month_count: number };
    quotes: DashboardKpiBase & { pending: number; approved: number };
    contacts: DashboardKpiBase & { new_7d: number };
    newsletter: DashboardKpiBase & { verified: number; new_30d: number };
    posts: DashboardKpiBase & { published: number; last_6m: number };
    partners: DashboardKpiBase & { categories_total: number };
  };
  monthly_revenue: Array<{
    month_label: string;
    month_key: string;
    revenue_confirmed: number;
    revenue_formatted: string;
    orders_count: number;
    quotes_count: number;
  }>;
  quote_monthly_counts: Array<{
    month_label: string;
    month_key: string;
    new: number;
    priced: number;
    approved: number;
    rejected: number;
    expired: number;
  }>;
  order_status_breakdown: {
    total: number;
    items: Array<{ status: OrderStatus; label: string; count: number; pct: number }>;
  };
  quote_status_breakdown: {
    total: number;
    items: Array<{
      status: QuoteRequestStatus;
      label: string;
      count: number;
      pct: number;
    }>;
  };
  low_stock_products: Array<{
    id: number;
    reference: string;
    name: string;
    stock: number;
    low_stock_threshold: number;
    is_available: boolean;
    unit: string | null;
    price: number | null;
    status_tone: 'danger' | 'warning';
    status_label: string;
  }>;
  pending_items: {
    orders_new: number;
    quotes_new: number;
    contacts_unread: number;
    comments_unapproved: number;
    products_zero_stock: number;
  };
  recent_orders: Array<{
    id: number;
    reference: string;
    status: OrderStatus;
    delivery_mode: OrderDeliveryMode;
    created_at: string;
    created_at_fr: string;
    customer: Pick<AdminCustomer, 'full_name' | 'company_name' | 'phone' | 'email'>;
    items_count: number;
    items_total: number;
    items_total_formatted: string;
  }>;
  recent_quotes: Array<{
    id: number;
    reference: string;
    status: QuoteRequestStatus;
    validity_date?: string | null;
    created_at: string;
    created_at_fr: string;
    customer: Pick<AdminCustomer, 'full_name' | 'company_name' | 'phone' | 'email'>;
    items_count: number;
    items_total: number;
    items_total_formatted: string;
  }>;
  recent_contacts: Array<{
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    created_at: string;
    created_at_fr: string;
  }>;
  unapproved_comments_count: number;
}
