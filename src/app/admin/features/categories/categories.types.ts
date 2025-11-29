import { DialogMode } from '../../core/models/shared.types';

/**
 * Category interface
 */
export interface Category {
  id: number;
  userId?: number;
  active: boolean;
  name: string;
  createdAt?: Date;
}

/**
 * Category Dialog interface
 */
export interface CategoryDialog {
  category: Category;
  dialogMode: DialogMode;
}

