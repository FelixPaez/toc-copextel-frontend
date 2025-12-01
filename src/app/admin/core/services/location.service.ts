import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MockService } from './mock.service';
import { environment } from '../../../../environments/environment';

export interface City {
  city: string;
  state: string;
}

export interface State {
  name: string;
  cities: string[];
}

/**
 * Location Service
 * Servicio para gestión de ubicaciones (estados y ciudades)
 */
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _states: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private _cities: BehaviorSubject<City[]> = new BehaviorSubject<City[]>([]);

  // Datos estáticos de provincias y ciudades de Cuba
  private readonly CUBAN_STATES = [
    'La Habana', 'Artemisa', 'Mayabeque', 'Pinar del Río', 'Matanzas',
    'Cienfuegos', 'Villa Clara', 'Sancti Spíritus', 'Ciego de Ávila',
    'Camagüey', 'Las Tunas', 'Holguín', 'Granma', 'Santiago de Cuba',
    'Guantánamo', 'Isla de la Juventud'
  ];

  private readonly CUBAN_CITIES_BY_STATE: { [key: string]: string[] } = {
    'La Habana': ['La Habana Vieja', 'Centro Habana', 'Plaza de la Revolución', 'Cerro', 'Diez de Octubre', 'Marianao', 'Playa', 'Boyeros', 'Arroyo Naranjo', 'San Miguel del Padrón', 'Cotorro', 'Habana del Este'],
    'Artemisa': ['Artemisa', 'Mariel', 'Guanajay', 'Caimito', 'Bauta', 'San Antonio de los Baños', 'Güira de Melena', 'Alquízar', 'Bahía Honda', 'Candelaria', 'San Cristóbal'],
    'Mayabeque': ['San José de las Lajas', 'Batabanó', 'Güines', 'Melena del Sur', 'Quivicán', 'Santa Cruz del Norte', 'Jaruco', 'Madruga', 'Nueva Paz', 'San Nicolás', 'Bejucal'],
    'Pinar del Río': ['Pinar del Río', 'Consolación del Sur', 'San Luis', 'San Juan y Martínez', 'Mantua', 'Minas de Matahambre', 'Viñales', 'La Palma', 'Los Palacios', 'Sandino', 'Guane'],
    'Matanzas': ['Matanzas', 'Cárdenas', 'Colón', 'Jagüey Grande', 'Perico', 'Jovellanos', 'Pedro Betancourt', 'Limonar', 'Unión de Reyes', 'Calimete', 'Los Arabos'],
    'Cienfuegos': ['Cienfuegos', 'Aguada de Pasajeros', 'Rodas', 'Palmira', 'Cruces', 'Cumanayagua', 'Lajas', 'Abreus'],
    'Villa Clara': ['Santa Clara', 'Placetas', 'Sagua la Grande', 'Remedios', 'Caibarién', 'Camajuaní', 'Encrucijada', 'Manicaragua', 'Ranchuelo', 'Santo Domingo', 'Corralillo', 'Quemado de Güines', 'Cifuentes'],
    'Sancti Spíritus': ['Sancti Spíritus', 'Trinidad', 'Cabaiguán', 'Fomento', 'Yaguajay', 'Jatibonico', 'Taguasco', 'La Sierpe'],
    'Ciego de Ávila': ['Ciego de Ávila', 'Morón', 'Chambas', 'Majagua', 'Florencia', 'Venezuela', 'Baraguá', 'Primero de Enero', 'Bolivia'],
    'Camagüey': ['Camagüey', 'Florida', 'Vertientes', 'Sibanicú', 'Nuevitas', 'Guáimaro', 'Minas', 'Esmeralda', 'Sierra de Cubitas', 'Najasa', 'Santa Cruz del Sur', 'Jimaguayú'],
    'Las Tunas': ['Las Tunas', 'Puerto Padre', 'Majibacoa', 'Jobabo', 'Amancio', 'Colombia', 'Jesús Menéndez', 'Manatí'],
    'Holguín': ['Holguín', 'Banes', 'Gibara', 'Moa', 'Sagua de Tánamo', 'Frank País', 'Mayarí', 'Cueto', 'Rafael Freyre', 'Báguanos', 'Calixto García', 'Urbano Noris', 'Antilla'],
    'Granma': ['Bayamo', 'Manzanillo', 'Yara', 'Campechuela', 'Media Luna', 'Niquero', 'Pilón', 'Bartolomé Masó', 'Buey Arriba', 'Guisa', 'Jiguaní', 'Río Cauto'],
    'Santiago de Cuba': ['Santiago de Cuba', 'Contramaestre', 'Mella', 'San Luis', 'Palma Soriano', 'Songo-La Maya', 'Segundo Frente', 'Tercer Frente', 'Guamá'],
    'Guantánamo': ['Guantánamo', 'Baracoa', 'Imías', 'Maisí', 'San Antonio del Sur', 'Yateras', 'El Salvador', 'Manuel Tames', 'Caimanera', 'Niceto Pérez'],
    'Isla de la Juventud': ['Nueva Gerona', 'La Fe', 'Punta de Este', 'Cayo Largo del Sur']
  };

  constructor(private _mockService: MockService) {
    this._initializeData();
  }

  private _initializeData(): void {
    this._states.next([...this.CUBAN_STATES]);
    
    const allCities: City[] = [];
    this.CUBAN_STATES.forEach(state => {
      const cities = this.CUBAN_CITIES_BY_STATE[state] || [];
      cities.forEach(city => {
        allCities.push({ city, state });
      });
    });
    this._cities.next(allCities);
  }

  get states$(): Observable<string[]> {
    return this._states.asObservable();
  }

  get cities$(): Observable<City[]> {
    return this._cities.asObservable();
  }

  getCitiesByState(state: string): Observable<string[]> {
    const cities = this.CUBAN_CITIES_BY_STATE[state] || [];
    
    if (this._mockService.isMockMode) {
      return of(cities).pipe(delay(100));
    }
    
    // En modo real, haría una llamada HTTP
    return of(cities);
  }

  getStates(): string[] {
    return [...this.CUBAN_STATES];
  }

  getCitiesByStateSync(state: string): string[] {
    return this.CUBAN_CITIES_BY_STATE[state] || [];
  }
}

