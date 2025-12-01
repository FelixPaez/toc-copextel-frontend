import { TablePagination } from '../core/models/shared.types';

/**
 * Mock Helpers
 * Funciones auxiliares para manejar datos mock
 */

/**
 * Aplica paginación, ordenamiento y búsqueda a un array de datos
 */
export function applyMockPagination<T>(
  data: T[],
  page: number = 0,
  size: number = 10,
  sort: string = 'id',
  order: 'asc' | 'desc' | '' = 'asc',
  search: string = '',
  searchFields: (keyof T)[] = []
): { data: T[]; pagination: TablePagination } {
  let filtered = [...data];

  // Apply search filter
  if (search && searchFields.length > 0) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      });
    });
  }

  // Apply sorting
  if (sort) {
    filtered.sort((a, b) => {
      const aVal: any = (a as any)[sort];
      const bVal: any = (b as any)[sort];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const aStr = aVal.toLowerCase();
        const bStr = bVal.toLowerCase();
        return order === 'desc' 
          ? bStr.localeCompare(aStr) 
          : aStr.localeCompare(bStr);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      }

      return 0;
    });
  }

  // Apply pagination
  const length = filtered.length;
  const startIndex = page * size;
  const endIndex = Math.min(startIndex + size, length);
  const lastPage = Math.max(Math.ceil(length / size) - 1, 0);
  const paginated = filtered.slice(startIndex, endIndex);

  const pagination: TablePagination = {
    length,
    size,
    page,
    lastPage,
    startIndex,
    endIndex: endIndex - 1
  };

  return { data: paginated, pagination };
}

