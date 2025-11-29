import { DialogMode } from '../../core/models/shared.types';

/**
 * Slide interface
 */
export interface Slide {
  id: string;
  userId?: number;
  active: boolean;
  createdAt?: Date;

  title: string;
  subtitle: string;
  imageId: string;
}

/**
 * Slide Dialog interface
 */
export interface SlideDialog {
  slide: Slide;
  dialogMode: DialogMode;
}

