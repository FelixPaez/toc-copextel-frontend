import { Vendor } from '../../features/vendors/vendors.types';

/**
 * Mock data for Vendors
 */
export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'TOC - Plaza',
    description: 'Tienda Online de Copextel - Plaza de la Revolución',
    email: 'plaza@copextel.com.cu',
    phone: '+53 7 5555555',
    address: 'Plaza de la Revolución, La Habana',
    state: 'La Habana',
    province: 'La Habana',
    city: 'Plaza de la Revolución',
    active: true,
    cupAccount: '1234567890',
    mlcAccount: '0987654321',
    eCollections: [{
      consumerKey: 'enzona-key-001',
      consumerSecret: 'enzona-secret-001',
      merchantUuid: 'merchant-uuid-001',
      currency: 'CUP'
    }],
    tCollections: [{
      source: 1,
      currency: 'CUP',
      transfermovilUserName: 'toc-plaza'
    }],
    createAt: new Date('2024-01-01')
  },
  {
    id: 'vendor-002',
    name: 'Guantánamo',
    description: 'Vendedor de Guantánamo especializado en servicios locales',
    email: 'guantanamo@copextel.com.cu',
    phone: '+53 21 1234567',
    address: 'Calle 1ra #123, Guantánamo',
    state: 'Guantánamo',
    province: 'Guantánamo',
    city: 'Guantánamo',
    active: true,
    cupAccount: '2345678901',
    mlcAccount: '1098765432',
    eCollections: [{
      consumerKey: 'enzona-key-002',
      consumerSecret: 'enzona-secret-002',
      merchantUuid: 'merchant-uuid-002',
      currency: 'CUP'
    }],
    tCollections: [{
      source: 2,
      currency: 'CUP',
      transfermovilUserName: 'toc-guantanamo'
    }],
    createAt: new Date('2024-01-05')
  },
  {
    id: 'vendor-003',
    name: 'Mundo Electrónico',
    description: 'Vendedor especializado en electrónicos y tecnología',
    email: 'mundo@copextel.com.cu',
    phone: '+53 7 9876543',
    address: 'Avenida 5ta #456, La Habana',
    state: 'La Habana',
    province: 'La Habana',
    city: 'Plaza',
    active: true,
    cupAccount: '3456789012',
    mlcAccount: '2109876543',
    eCollections: [{
      consumerKey: 'enzona-key-003',
      consumerSecret: 'enzona-secret-003',
      merchantUuid: 'merchant-uuid-003',
      currency: 'MLC'
    }],
    tCollections: [{
      source: 3,
      currency: 'MLC',
      transfermovilUserName: 'mundo-electronico'
    }],
    createAt: new Date('2024-01-10')
  },
  {
    id: 'vendor-004',
    name: 'Tecnostar Informática',
    description: 'Especialistas en informática y comunicaciones',
    email: 'tecnostar@copextel.com.cu',
    phone: '+53 7 4444444',
    address: 'Calle 17 #345, Vedado',
    state: 'La Habana',
    province: 'La Habana',
    city: 'Plaza de la Revolución',
    active: true,
    cupAccount: '4567890123',
    mlcAccount: '3210987654',
    eCollections: [{
      consumerKey: 'enzona-key-004',
      consumerSecret: 'enzona-secret-004',
      merchantUuid: 'merchant-uuid-004',
      currency: 'CUP'
    }],
    tCollections: [{
      source: 4,
      currency: 'CUP',
      transfermovilUserName: 'tecnostar'
    }],
    createAt: new Date('2024-01-15')
  },
  {
    id: 'vendor-005',
    name: 'Tienda Online Principal',
    description: 'Tienda Online principal de Copextel',
    email: 'online@copextel.com.cu',
    phone: '+53 7 3333333',
    address: 'Edificio Focsa, Calle 17 esquina M, Vedado',
    state: 'La Habana',
    province: 'La Habana',
    city: 'Plaza de la Revolución',
    active: false,
    cupAccount: '5678901234',
    mlcAccount: '4321098765',
    createAt: new Date('2024-01-20')
  }
];

