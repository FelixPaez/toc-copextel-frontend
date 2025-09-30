export interface Inventory {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  location?: string;
  bin?: string;
  isTracked: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: WarehouseAddress;
  contact: WarehouseContact;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
}

export interface WarehouseAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface WarehouseContact {
  name: string;
  email: string;
  phone: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference: string;
  referenceType: StockMovementReferenceType;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
  DAMAGED = 'damaged',
  EXPIRED = 'expired'
}

export enum StockMovementReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  SALE_ORDER = 'sale_order',
  TRANSFER_ORDER = 'transfer_order',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  MANUAL = 'manual'
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: SupplierContact;
  address: SupplierAddress;
  paymentTerms: string;
  leadTime: number;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
}

export interface SupplierContact {
  name: string;
  email: string;
  phone: string;
  position?: string;
}

export interface SupplierAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  totalAmount: number;
  currency: string;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
  status: PurchaseOrderItemStatus;
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum PurchaseOrderItemStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface InventoryFilter {
  warehouseId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  productId?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface InventorySort {
  field: 'quantity' | 'availableQuantity' | 'lastUpdated' | 'productName';
  order: 'asc' | 'desc';
}

export interface InventoryAnalytics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  averageStockLevel: number;
  topProducts: TopProduct[];
  stockMovements: StockMovementAnalytics[];
}

export interface TopProduct {
  product: Product;
  quantity: number;
  value: number;
  movementCount: number;
}

export interface StockMovementAnalytics {
  date: Date;
  inQuantity: number;
  outQuantity: number;
  netQuantity: number;
}

// Import types from other models
import { Product } from './product.model';
