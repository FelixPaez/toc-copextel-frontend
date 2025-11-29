import { DialogMode } from '../../core/models/shared.types';

/**
 * Courier interface
 */
export interface Courier {
  id?: string;
  createdAt?: string;
  userId?: number;
  vendorId: string;
  active: boolean;

  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  obs?: string;

  destinations?: DestinationState[];
}

/**
 * Destination State interface
 */
export interface DestinationState {
  name: string;
  cities: DestinationCity[];
}

/**
 * Destination City interface
 */
export interface DestinationCity {
  name: string;
  costCup: number;
  costMlc: number;
}

/**
 * Courier Dialog interface
 */
export interface CourierDialog {
  courier: Courier;
  dialogMode: DialogMode;
}

