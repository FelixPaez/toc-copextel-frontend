/**
 * Orders Types
 * Tipos para gestión de pedidos
 */

/**
 * Order interface
 */
export interface Order {
  // General info
  id?: number;
  orderNo: number;
  currency: Currency;
  vendorId: string;

  // Owner info
  clientId: number;

  // Beneficiary info
  beneficiaryIdNumber: string;
  beneficiaryName: string;
  beneficiaryLastname1: string;
  beneficiaryLastname2: string;
  beneficiaryCell: string;
  beneficiaryPhone: string;

  // Delivery address
  address: string;
  city: string;
  state: string;
  obs: string;

  // Payment info
  paymentWay: PaymentWay;
  paymentStatus: PaymentStatus;

  // Shipping info
  shippingWay: ShippingWay;
  shippingMethod: string;

  // Order details
  products: OrderProduct[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;

  // Tracking info
  createdAt: Date;

  payed: boolean;
  payedAt?: Date;

  ready: boolean;
  readyAt?: Date;

  shipped: boolean;
  shippedAt?: Date;

  delivered: boolean;
  deliveredAt?: Date;

  canceled: boolean;
  canceledAt?: Date;
  cancelObs?: string;

  changeStateAt?: Date;
  status: OrderStatus;

  // transfermovil refund fields
  source?: string;
  bankId?: string;
  tmId?: string;

  // Descripción de la devolución de enzona y transfermovil
  refundObs?: string;

  externalID?: string;
  statusTM?: number;
  bank?: number;

  refundID?: string;
  referenceRefund?: string;
  referenceRefundTM?: string;

  // enzona refund field
  transaction_uuid?: string;
}

/**
 * Order Product interface
 */
export interface OrderProduct {
  id?: number;
  productId: number;
  productPrice?: number;
  quantity: number;
}

/**
 * Order Update Status interface
 */
export interface OrderUpdateStatus {
  orderId: number;
  ready?: boolean;
  shipped?: boolean;
  delivered?: boolean;
  canceled?: boolean;
  cancelObs?: string;
  status: OrderStatus;
}

/**
 * Payment way types
 */
export type PaymentWay = 'Transfermovil' | 'ENZONA' | 'Enzona' | 'Transfermóvil' | 'Efectivo';

/**
 * Payment status types
 */
export type PaymentStatus = 'Pendiente' | 'Pagada';

/**
 * Shipping way types
 */
export type ShippingWay = 'Entrega a domicilio' | 'Recogida en tienda';

/**
 * Order status types
 */
export type OrderStatus =
  | 'Pendiente de pago'
  | 'Pagada'
  | 'Lista'
  | 'Transportando'
  | 'Entregada'
  | 'Cancelada'
  | 'Reembolsada'
  | 'Pendiente de Reembolso';

/**
 * Currency types
 */
export type Currency = 'CUP' | 'MLC';

