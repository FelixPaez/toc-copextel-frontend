import { Courier } from '../../features/orders/couriers.types';

/**
 * Mock data for Couriers
 */
export const MOCK_COURIERS: Courier[] = [
  {
    id: 'courier-001',
    name: 'Transporte Rápido',
    contact: 'Juan Transportista',
    email: 'transporte@copextel.com.cu',
    phone: '+53 7 1111111',
    address: 'Calle 1ra #100, La Habana',
    city: 'La Habana',
    state: 'La Habana',
    vendorId: 'vendor-001',
    active: true,
    destinations: [
      {
        name: 'La Habana',
        cities: [
          { name: 'Plaza de la Revolución', costCup: 200, costMlc: 2 },
          { name: 'Centro Habana', costCup: 250, costMlc: 2.5 },
          { name: 'Vedado', costCup: 300, costMlc: 3 }
        ]
      }
    ],
    createdAt: '2024-01-01',
    obs: 'Servicio disponible de lunes a viernes'
  },
  {
    id: 'courier-002',
    name: 'Envíos Guantánamo',
    contact: 'Carlos Envíos',
    email: 'envios@copextel.com.cu',
    phone: '+53 21 2222222',
    address: 'Calle Principal #200, Guantánamo',
    city: 'Guantánamo',
    state: 'Guantánamo',
    vendorId: 'vendor-002',
    active: true,
    destinations: [
      {
        name: 'Guantánamo',
        cities: [
          { name: 'Guantánamo', costCup: 150, costMlc: 1.5 },
          { name: 'Baracoa', costCup: 500, costMlc: 5 },
          { name: 'Santiago de Cuba', costCup: 800, costMlc: 8 }
        ]
      }
    ],
    createdAt: '2024-01-05',
    obs: 'Cobertura en toda la provincia'
  },
  {
    id: 'courier-003',
    name: 'Logística Nacional',
    contact: 'Ana Logística',
    email: 'logistica@copextel.com.cu',
    phone: '+53 7 3333333',
    address: 'Avenida Principal #300',
    city: 'La Habana',
    state: 'La Habana',
    vendorId: 'vendor-003',
    active: true,
    destinations: [
      {
        name: 'La Habana',
        cities: [
          { name: 'Todas las zonas', costCup: 300, costMlc: 3 }
        ]
      },
      {
        name: 'Pinar del Río',
        cities: [
          { name: 'Pinar del Río', costCup: 1000, costMlc: 10 }
        ]
      }
    ],
    createdAt: '2024-01-10',
    obs: 'Servicio nacional disponible'
  }
];

