import { NaturalCustomer, LegalCustomer } from '../../features/customers/customers.types';

/**
 * Mock data for Customers
 */
export const MOCK_NATURAL_CUSTOMERS: NaturalCustomer[] = [
  {
    id: 1,
    name: 'Juan',
    lastname1: 'Pérez',
    lastname2: 'González',
    email: 'juan.perez@email.com',
    phone: '5351234567',
    gender: 'masculino',
    idNumber: '85010112345',
    birthDate: '1985-01-01',
    age: '39',
    address: 'Calle 23 #456, Vedado',
    state: 'La Habana',
    city: 'La Habana',
    imageUrl: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'María',
    lastname1: 'García',
    lastname2: 'López',
    email: 'maria.garcia@email.com',
    phone: '5352345678',
    gender: 'femenino',
    idNumber: '85020223456',
    birthDate: '1990-02-02',
    age: '34',
    address: 'Avenida 5ta #789, Miramar',
    state: 'La Habana',
    city: 'La Habana',
    imageUrl: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 3,
    name: 'Carlos',
    lastname1: 'Rodríguez',
    lastname2: 'Martínez',
    email: 'carlos.rodriguez@email.com',
    phone: '5353456789',
    gender: 'masculino',
    idNumber: '85030334567',
    birthDate: '1988-03-03',
    age: '36',
    address: 'Calle 17 #234, Centro',
    state: 'Guantánamo',
    city: 'Guantánamo',
    imageUrl: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 4,
    name: 'Ana',
    lastname1: 'Fernández',
    lastname2: 'Sánchez',
    email: 'ana.fernandez@email.com',
    phone: '5354567890',
    gender: 'femenino',
    idNumber: '85040445678',
    birthDate: '1992-04-04',
    age: '32',
    address: 'Calle 42 #567, Nuevo Vedado',
    state: 'La Habana',
    city: 'La Habana',
    imageUrl: 'https://i.pravatar.cc/150?img=9'
  },
  {
    id: 5,
    name: 'Luis',
    lastname1: 'Torres',
    lastname2: 'Hernández',
    email: 'luis.torres@email.com',
    phone: '5355678901',
    gender: 'masculino',
    idNumber: '85050556789',
    birthDate: '1987-05-05',
    age: '37',
    address: 'Calle 1ra #123, Centro',
    state: 'Guantánamo',
    city: 'Guantánamo',
    imageUrl: 'https://i.pravatar.cc/150?img=15'
  }
];

export const MOCK_LEGAL_CUSTOMERS: LegalCustomer[] = [
  {
    _id: 'legal-001',
    user: 'user-001',
    code: 'LEG-001',
    name: 'Empresa ABC S.A.',
    organism: 'Ministerio de Comunicaciones',
    email: 'contacto@empresaabc.cu',
    webSite: 'www.empresaabc.cu',
    rep: 'Juan Representante',
    nit: '12345678901',
    cupCount: '500000',
    recipientCUPCount: '100000',
    branchOfficeCUPCount: '50000',
    mlcCount: '5000',
    recipientmlcCount: '1000',
    branchOfficemlcCount: '500',
    address: 'Calle Principal #100',
    country: 'Cuba',
    state: 'La Habana',
    city: 'La Habana',
    postalCode: '10400',
    ceoName: 'CEO Nombre',
    ceoIdNumber: '85010111111',
    ceoPhone: '72111111',
    cfoName: 'CFO Nombre',
    cfoIdNumber: '85020222222',
    cfoPhone: '72222222',
    logo: 'logo-001',
    logoUrl: 'https://via.placeholder.com/200x100?text=Empresa+ABC'
  }
];

