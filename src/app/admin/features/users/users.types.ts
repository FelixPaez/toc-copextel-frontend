import { DialogMode } from '../../core/models/shared.types';

/**
 * User interface
 */
export interface User {
  id?: number;
  active: boolean;
  createdAt?: string;

  name: string;
  lastname1: string;
  lastname2: string;
  username: string;
  email: string;

  uo: string;
  vendorId: string;
  title: string;
  gender: Gender;

  password?: string;
  idNumber: string;

  imageUrl?: string;

  roles: string[];
}

/**
 * Roles enum
 */
export enum Roles {
  SYSTEM_ADMIN = 'Administrador del Sistema',
  CORPORATE_ROLE = 'Corporativo',
  SELLER_ROLE = 'Vendedor'
}

/**
 * Role type
 */
export type Role = 'Administrador' | 'Moderador' | 'Supervisor';

/**
 * Gender type
 */
export type Gender = 'femenino' | 'masculino';

/**
 * User Dialog interface
 */
export interface UserDialog {
  user: User;
  dialogMode: DialogMode;
}

