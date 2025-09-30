import { Injectable } from '@angular/core';

export type StorageType = 'localStorage' | 'sessionStorage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly defaultStorage: StorageType = 'localStorage';

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T, storageType: StorageType = this.defaultStorage): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.getStorage(storageType).setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  }

  /**
   * Get item from storage
   */
  getItem<T>(key: string, storageType: StorageType = this.defaultStorage): T | null {
    try {
      const item = this.getStorage(storageType).getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string, storageType: StorageType = this.defaultStorage): void {
    try {
      this.getStorage(storageType).removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(storageType: StorageType = this.defaultStorage): void {
    try {
      this.getStorage(storageType).clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get storage size
   */
  getSize(storageType: StorageType = this.defaultStorage): number {
    try {
      return this.getStorage(storageType).length;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }

  /**
   * Check if key exists in storage
   */
  hasKey(key: string, storageType: StorageType = this.defaultStorage): boolean {
    try {
      return this.getStorage(storageType).hasOwnProperty(key);
    } catch (error) {
      console.error('Error checking key in storage:', error);
      return false;
    }
  }

  /**
   * Get all keys from storage
   */
  getKeys(storageType: StorageType = this.defaultStorage): string[] {
    try {
      const storage = this.getStorage(storageType);
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }

  /**
   * Get storage object
   */
  private getStorage(storageType: StorageType): Storage {
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  /**
   * Set item with expiration
   */
  setItemWithExpiration<T>(
    key: string, 
    value: T, 
    expirationMinutes: number,
    storageType: StorageType = this.defaultStorage
  ): void {
    const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
    const itemWithExpiration = {
      value,
      expirationTime
    };
    
    this.setItem(key, itemWithExpiration, storageType);
  }

  /**
   * Get item with expiration check
   */
  getItemWithExpiration<T>(key: string, storageType: StorageType = this.defaultStorage): T | null {
    const item = this.getItem<{ value: T; expirationTime: number }>(key, storageType);
    
    if (!item) {
      return null;
    }

    const currentTime = new Date().getTime();
    if (currentTime > item.expirationTime) {
      // Item has expired, remove it
      this.removeItem(key, storageType);
      return null;
    }

    return item.value;
  }

  /**
   * Set multiple items at once
   */
  setMultipleItems(items: Record<string, any>, storageType: StorageType = this.defaultStorage): void {
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value, storageType);
    });
  }

  /**
   * Get multiple items at once
   */
  getMultipleItems<T>(keys: string[], storageType: StorageType = this.defaultStorage): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.getItem<T>(key, storageType);
    });

    return result;
  }
}
