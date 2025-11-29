/**
 * Customers Types
 * Tipos para gestión de clientes
 */

export interface NaturalCustomer {
  id: number;
  imageUrl?: string;

  name: string;
  lastname1: string;
  lastname2: string;

  email: string;
  phone: string;
  gender: string;

  idNumber: string;
  birthDate?: string;
  age?: string;

  address: string;
  state: string;
  city: string;
}

export interface LegalCustomer {
  _id: string;
  user: string;
  code: string;
  name: string;
  organism: string;
  email: string;
  webSite?: string;

  rep: string;
  nit: string;
  cupCount: string;
  recipientCUPCount: string;
  branchOfficeCUPCount: string;
  mlcCount: string;
  recipientmlcCount: string;
  branchOfficemlcCount: string;

  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;

  ceoName: string;
  ceoIdNumber: string;
  ceoPhone: string;
  cfoName: string;
  cfoIdNumber: string;
  cfoPhone: string;

  logo?: string;
  logoUrl?: string;
  review?: string;
}

export interface CustomersPagination {
  length: number;
  size: number;
  page: number;
  lastPage: number;
  startIndex: number;
  endIndex: number;
}

export interface CustomerDialog {
  selectedCustomer: NaturalCustomer;
}

