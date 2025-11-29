/**
 * Dashboard Types
 * Tipos para el dashboard
 */

/**
 * Order Week or Month Statistics
 */
export class OrderWeekOrMonthStatistics {
  payed: number;
  canceled: number;
  delivered: number;
  ready: number;
  created: number;
  shipped: number;
  updated: number;
  outstanding: number;

  shippedOrdersByWeekDayValue: DC[];
  readyOrdersByWeekDayValue: DC[];
  newOrdersByWeekDayValue: DC[];
  deliveredOrdersByWeekDayValue: DC[];
  payedOrdersByWeekDayValue: DC[];
  canceledOrdersByWeekDayValue: DC[];

  /**
   * Getter for title
   */
  get shippedOrdersByWeekDayValues(): string {
    return '';
  }

  /**
   * Get week day values
   */
  public static getWeekValues(dc: DC[]): number[] {
    const arr: number[] = [];
    for (let i = 0; i < 7; i++) {
      arr.push(0);
    }

    for (const iterator of dc) {
      const index = iterator.day - 1;
      arr[index] = iterator.count;
    }
    return arr;
  }
}

/**
 * DC interface (Day Count)
 */
export interface DC {
  day: number;
  count: number;
}

