import { Category } from '../../features/categories/categories.types';

/**
 * Mock data for Categories
 */
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Accesorios',
    active: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Electrodomésticos',
    active: true,
    createdAt: new Date('2024-01-02')
  },
  {
    id: 3,
    name: 'Ofimática',
    active: true,
    createdAt: new Date('2024-01-03')
  },
  {
    id: 4,
    name: 'Muebles',
    active: true,
    createdAt: new Date('2024-01-04')
  },
  {
    id: 5,
    name: 'Tecnología',
    active: true,
    createdAt: new Date('2024-01-05')
  },
  {
    id: 6,
    name: 'Hogar',
    active: false,
    createdAt: new Date('2024-01-06')
  }
];

