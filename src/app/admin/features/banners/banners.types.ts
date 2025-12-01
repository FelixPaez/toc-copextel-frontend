/**
 * Banners Types
 * Tipos para gestión de banners
 */

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

