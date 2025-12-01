import { Injectable } from '@angular/core';
import { Icons, getIcon, getIconByPath, IconCategory } from '../constants/icons.constants';

/**
 * Servicio centralizado para gestión de iconos
 * 
 * Proporciona acceso a los iconos centralizados y permite
 * obtener iconos de forma type-safe y con validación.
 * 
 * Uso:
 *   constructor(private iconService: IconService) {}
 *   icon = this.iconService.get('ACTIONS', 'EDIT');
 */
@Injectable({
  providedIn: 'root'
})
export class IconService {
  /**
   * Obtiene un icono de una categoría específica
   * @param category - Categoría del icono (ej: 'ACTIONS', 'STATUS')
   * @param name - Nombre del icono dentro de la categoría
   * @returns El nombre del icono de Material Icons
   */
  get<T extends IconCategory>(category: T, name: keyof typeof Icons[T]): string {
    return getIcon(category, name as any);
  }

  /**
   * Obtiene un icono por ruta completa (categoría.nombre)
   * @param category - Categoría del icono
   * @param iconKey - Clave del icono como string
   * @returns El nombre del icono de Material Icons
   */
  getByPath(category: IconCategory, iconKey: string): string {
    return getIconByPath(category, iconKey);
  }

  /**
   * Obtiene todos los iconos de una categoría
   * @param category - Categoría de iconos
   * @returns Objeto con todos los iconos de la categoría
   */
  getCategory<T extends IconCategory>(category: T): typeof Icons[T] {
    return Icons[category];
  }

  /**
   * Obtiene el objeto completo de iconos
   * @returns Todas las categorías de iconos
   */
  getAll(): typeof Icons {
    return Icons;
  }

  /**
   * Verifica si un icono existe en una categoría
   * @param category - Categoría del icono
   * @param name - Nombre del icono
   * @returns true si el icono existe, false en caso contrario
   */
  exists<T extends IconCategory>(category: T, name: keyof typeof Icons[T]): boolean {
    return category in Icons && name in Icons[category];
  }

  /**
   * Obtiene un icono con fallback a un icono por defecto
   * @param category - Categoría del icono
   * @param name - Nombre del icono
   * @param fallback - Icono por defecto si no se encuentra
   * @returns El icono solicitado o el fallback
   */
  getWithFallback<T extends IconCategory>(
    category: T,
    name: keyof typeof Icons[T],
    fallback: string = Icons.STATUS.INFO
  ): string {
    if (this.exists(category, name)) {
      return this.get(category, name);
    }
    return fallback;
  }
}

