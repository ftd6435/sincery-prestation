export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock';

export type ProductStatus = 'published' | 'draft' | 'archived';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  children?: {slug: string;name: string;}[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  subCategory?: string;
  shortDescription: string;
  description: string;
  specs: {label: string;value: string;}[];
  price: number | null;
  quoteOnly: boolean;
  unit: string;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
}

export interface SelectionItem {
  productId: string;
  quantity: number;
}