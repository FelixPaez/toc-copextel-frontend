import { CopextelService } from '../../features/services/services.types';

/**
 * Mock data for Copextel Services
 */
export const MOCK_SERVICES: CopextelService[] = [
  {
    id: 1,
    name: 'Instalación de Software',
    code: 'SRV-INST-001',
    description: 'Servicio de instalación y configuración de software en equipos informáticos',
    cupPrice: 5000,
    mlcPrice: 50,
    active: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 2,
    name: 'Mantenimiento de Equipos',
    code: 'SRV-MANT-001',
    description: 'Servicio de mantenimiento preventivo y correctivo de equipos informáticos',
    cupPrice: 8000,
    mlcPrice: 80,
    active: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 3,
    name: 'Reparación de Impresoras',
    code: 'SRV-REP-001',
    description: 'Servicio de reparación y mantenimiento de impresoras de todas las marcas',
    cupPrice: 3000,
    mlcPrice: 30,
    active: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: 4,
    name: 'Configuración de Redes',
    code: 'SRV-RED-001',
    description: 'Servicio de configuración e instalación de redes locales',
    cupPrice: 10000,
    mlcPrice: 100,
    active: true,
    createdAt: new Date('2024-02-10')
  },
  {
    id: 5,
    name: 'Consultoría Técnica',
    code: 'SRV-CONS-001',
    description: 'Servicio de consultoría técnica en tecnologías de la información',
    cupPrice: 15000,
    mlcPrice: 150,
    active: false,
    createdAt: new Date('2024-03-01')
  }
];

