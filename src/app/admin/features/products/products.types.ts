/**
 * Products Types
 * Tipos para gestión de productos/inventario
 */

export interface InventoryProduct {
  id: number;
  userId?: string;
  createdAt?: Date;

  active: boolean;
  images?: string[] | any;
  imagesArr?: string[];

  name: string;
  code?: string | null;
  description?: string;

  categoryId?: number;
  category?: InventoryCategory;
  stock: number;
  onSale: number;
  unit: string;
  guaranty?: string;

  uo: string | null;
  vendorId: null;

  sellToLegalCustomer: boolean;
  sellToLegalPriceCup: boolean;
  legalPriceCup: number;
  sellToLegalPriceMlc: boolean;
  legalPriceMlc: number;

  sellToNaturalCustomer: boolean;
  sellToNaturalPriceMlc: boolean;
  naturalPriceCup: number;
  sellToNaturalPriceCup: boolean;
  naturalPriceMlc: number;

  sellToPymesCustomer: boolean;
  sellToPymesPriceMlc: boolean;
  pymesPriceCup: number;
  sellToPymesPriceCup: boolean;
  pymesPriceMlc: number;

  weight?: string;
  volume?: string;
  dimensions?: string;

  services?: any[];
}

export interface InventoryCategory {
  id: string | number;
  parentId?: string | number;
  name: string;
  slug?: string;
  active?: boolean;
}

export interface InventoryPagination {
  length: number;
  size: number;
  page: number;
  lastPage: number;
  startIndex: number;
  endIndex: number;
}

export interface InventoryDialog {
  product: InventoryProduct;
  dialogMode: InventoryDialogMode;
}

export type InventoryDialogMode = 'view' | 'add' | 'edit';

export interface InventoryResponse {
  count: number;
  page: number;
  size: number;
  totalCount: number;
  data: InventoryProduct[];
}

