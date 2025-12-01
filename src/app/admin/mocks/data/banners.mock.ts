import { Banner } from '../../features/banners/banners.types';

/**
 * Mock data for Banners
 */
export const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Computadoras',
    subtitle: 'Computadoras con componentes de ultima generacion',
    category: 'Tecnología',
    image: 'assets/images/products/headphone-1.jpg',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Aire acondicionado',
    subtitle: 'Disfruta del máximo confort en tu hogar u oficina, incluso en los días más calurosos.',
    category: 'Electrodomésticos',
    image: 'assets/images/products/headphone-2.jpg',
    isActive: true,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '3',
    title: 'Calentador solar',
    subtitle: 'Nuestros calentadores solares son eficientes, duraderos y ecológicos, brindándote agua caliente todo el día, incluso en días nublados.',
    category: 'Energía',
    image: 'assets/images/products/headphone-3.jpg',
    isActive: true,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '4',
    title: 'Smartphones',
    subtitle: 'Los últimos modelos de smartphones con tecnología de punta',
    category: 'Tecnología',
    image: 'assets/images/products/headphone-4.jpg',
    isActive: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    title: 'Tablets',
    subtitle: 'Tablets para trabajo y entretenimiento',
    category: 'Tecnología',
    image: 'assets/images/products/headphone-5.jpg',
    isActive: true,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  }
];

