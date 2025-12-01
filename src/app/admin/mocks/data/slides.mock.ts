import { Slide } from '../../features/slides/slides.types';

/**
 * Mock data for Slides
 */
export const MOCK_SLIDES: Slide[] = [
  {
    id: 'slide-001',
    title: 'Bienvenido a TOC',
    subtitle: 'Tu tienda online de confianza',
    imageId: 'img-001',
    active: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'slide-002',
    title: 'Ofertas Especiales',
    subtitle: 'Descuentos increíbles en tecnología',
    imageId: 'img-002',
    active: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'slide-003',
    title: 'Nuevos Productos',
    subtitle: 'Descubre nuestras últimas novedades',
    imageId: 'img-003',
    active: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'slide-004',
    title: 'Servicios Profesionales',
    subtitle: 'Instalación y mantenimiento de equipos',
    imageId: 'img-004',
    active: false,
    createdAt: new Date('2024-02-15')
  }
];

