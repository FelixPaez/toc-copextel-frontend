import { DialogMode } from '../../core/models/shared.types';

/**
 * Vendor interface
 */
export interface Vendor {
  id: string;
  userId?: number;
  active: boolean;
  createAt?: Date;

  name: string;
  description: string;
  imageId?: string;
  logoId?: string;

  email: string;
  phone: string;

  address: string;
  state: string;
  province?: string; // Alias para state, usado en algunos componentes
  city: string;

  cupAccount?: string;
  mlcAccount?: string;

  eCollections?: ECollection[];
  tCollections?: TCollection[];
}

/**
 * Vendor Dialog interface
 */
export interface VendorDialog {
  vendor: Vendor;
  dialogMode: DialogMode;
}

/**
 * ECollection interface (Enzona)
 */
export interface ECollection {
  consumerKey?: string;
  consumerSecret?: string;
  merchantUuid?: string;
  currency?: string;
}

/**
 * TCollection interface (Transfermóvil)
 */
export interface TCollection {
  source?: number;
  currency?: string;
  transfermovilUserName?: string;
}

/**
 * Image Type
 */
export type ImageType = 'imageId' | 'logoId';

