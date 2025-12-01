/**
 * Shared Types
 * Tipos compartidos para toda la aplicación
 */

/**
 * Paginación de tablas
 */
export interface TablePagination {
  length?: number;
  size?: number;
  page?: number;
  lastPage?: number;
  startIndex?: number;
  endIndex?: number;
}

/**
 * Respuesta genérica de la API
 * Compatible con la estructura del backend existente
 */
export interface IResponse {
  ok: boolean;
  message?: string;

  // Autenticación
  token?: string;
  user?: any;
  menu?: any;
  // Nota: 'user' también se usa más abajo para usuarios, pero es el mismo tipo

  // Paginación
  pagination?: TablePagination;

  // Categorías
  categories?: any[];
  category?: any;
  updatedCategory?: any;

  // Clientes
  clients?: any[];
  client?: any;
  updatedClient?: any;

  // Productos
  products?: any[];
  product?: any;
  updatedProduct?: any;

  // Pedidos
  orders?: any[];
  order?: any;
  updatedOrder?: any;

  // Servicios
  services?: any[];
  service?: any;
  updatedService?: any;

  // Slides
  slides?: any[];
  slide?: any;
  updatedSlide?: any;

  // Banners
  banners?: any[];
  banner?: any;
  updatedBanner?: any;

  // Usuarios
  users?: any[];
  updatedUser?: any;
  userProfile?: any;

  // Vendedores
  vendors?: any[];
  vendor?: any;
  updatedVendor?: any;

  // Transportistas
  couriers?: any[];
  courier?: any;
  updatedCourier?: any;

  // Mensajes
  contactMessages?: any[];
  contactMessage?: any;
  contactUpdatedMessage?: any;

  // Otros
  imageId?: string;
  imagesId?: string[];
  data?: any;
}

/**
 * Modo de diálogo
 */
export type DialogMode = 'view' | 'add' | 'edit' | 'editPass';

