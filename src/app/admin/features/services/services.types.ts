import { DialogMode } from '../../core/models/shared.types';

/**
 * Copextel Service interface
 */
export interface CopextelService {
  id: number;
  userId?: string;
  createdAt?: Date;
  active: boolean;

  name: string;
  code?: string;
  description: string;
  cupPrice: number;
  mlcPrice: number;
}

/**
 * Service Dialog interface
 */
export interface ServiceDialog {
  service: CopextelService;
  dialogMode: DialogMode;
}

