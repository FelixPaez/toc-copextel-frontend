export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  payment: OrderPayment;
  shipping: OrderShipping;
  billing: OrderBilling;
  totals: OrderTotals;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  tax: number;
  status: OrderItemStatus;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  gateway?: string;
  paidAt?: Date;
  refundedAmount?: number;
  refundedAt?: Date;
}

export interface OrderShipping {
  method: ShippingMethod;
  status: ShippingStatus;
  address: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cost: number;
  estimatedDelivery?: Date;
}

export interface OrderBilling {
  address: Address;
  invoiceNumber?: string;
  invoiceUrl?: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CRYPTO = 'crypto'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  PICKUP = 'pickup'
}

export enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}

export interface OrderFilter {
  status?: OrderStatus;
  customerId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  totalRange?: {
    min: number;
    max: number;
  };
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  shippingMethod?: ShippingMethod;
  tags?: string[];
}

export interface OrderSort {
  field: 'orderNumber' | 'createdAt' | 'updatedAt' | 'total' | 'status';
  order: 'asc' | 'desc';
}

// Import types from other models
import { Product, ProductVariant } from './product.model';
import { Customer } from './customer.model';
