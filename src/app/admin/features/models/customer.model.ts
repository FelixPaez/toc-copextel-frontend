export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  addresses: CustomerAddress[];
  defaultBillingAddress?: CustomerAddress;
  defaultShippingAddress?: CustomerAddress;
  preferences: CustomerPreferences;
  status: CustomerStatus;
  groupId?: string;
  group?: CustomerGroup;
  tags: string[];
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAddress {
  id: string;
  type: 'billing' | 'shipping';
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
  isDefault: boolean;
}

export interface CustomerPreferences {
  language: string;
  currency: string;
  timezone: string;
  marketingEmails: boolean;
  orderNotifications: boolean;
  newsletter: boolean;
  smsNotifications: boolean;
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  discountPercentage?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CustomerFilter {
  status?: CustomerStatus;
  groupId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  totalSpentRange?: {
    min: number;
    max: number;
  };
  totalOrdersRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  hasOrders?: boolean;
  isSubscribed?: boolean;
}

export interface CustomerSort {
  field: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'totalSpent' | 'totalOrders' | 'lastOrderDate';
  order: 'asc' | 'desc';
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  topCustomerGroups: CustomerGroupAnalytics[];
  customerGrowth: CustomerGrowthData[];
}

export interface CustomerGroupAnalytics {
  group: CustomerGroup;
  customerCount: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface CustomerGrowthData {
  date: Date;
  newCustomers: number;
  totalCustomers: number;
}
