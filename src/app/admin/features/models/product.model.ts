export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  category: ProductCategory;
  brand?: string;
  price: ProductPrice;
  inventory: ProductInventory;
  images: ProductImage[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seo: ProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  slug: string;
  image?: string;
  isActive: boolean;
}

export interface ProductPrice {
  basePrice: number;
  salePrice?: number;
  costPrice: number;
  currency: string;
  taxRate: number;
  discountPercentage?: number;
}

export interface ProductInventory {
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  warehouseId: string;
  location?: string;
  isTracked: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  thumbnail?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  isRequired: boolean;
  isFilterable: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: ProductPrice;
  inventory: ProductInventory;
  images: ProductImage[];
  isActive: boolean;
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  slug: string;
  canonicalUrl?: string;
}

export interface ProductFilter {
  categoryId?: string;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  status?: ProductStatus;
  inStock?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  attributes?: Record<string, string>;
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'sales';
  order: 'asc' | 'desc';
}
