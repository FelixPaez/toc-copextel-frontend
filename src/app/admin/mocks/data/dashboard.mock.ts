import { OrderWeekOrMonthStatistics, DC } from '../../features/dashboard/dashboard.types';

/**
 * Mock data for Dashboard Statistics
 * Se crea una instancia de la clase para incluir el getter
 */
export const MOCK_DASHBOARD_STATS: OrderWeekOrMonthStatistics = Object.assign(
  new OrderWeekOrMonthStatistics(),
  {
    payed: 45,
    canceled: 5,
    delivered: 38,
    ready: 12,
    created: 50,
    shipped: 25,
    updated: 50,
    outstanding: 7,
    shippedOrdersByWeekDayValue: [
      { day: 1, count: 5 },
      { day: 2, count: 8 },
      { day: 3, count: 4 },
      { day: 4, count: 3 },
      { day: 5, count: 5 }
    ] as DC[],
    readyOrdersByWeekDayValue: [
      { day: 1, count: 2 },
      { day: 2, count: 3 },
      { day: 3, count: 2 },
      { day: 4, count: 3 },
      { day: 5, count: 2 }
    ] as DC[],
    newOrdersByWeekDayValue: [
      { day: 1, count: 10 },
      { day: 2, count: 12 },
      { day: 3, count: 8 },
      { day: 4, count: 10 },
      { day: 5, count: 10 }
    ] as DC[],
    deliveredOrdersByWeekDayValue: [
      { day: 1, count: 8 },
      { day: 2, count: 7 },
      { day: 3, count: 9 },
      { day: 4, count: 8 },
      { day: 5, count: 6 }
    ] as DC[],
    payedOrdersByWeekDayValue: [
      { day: 1, count: 9 },
      { day: 2, count: 10 },
      { day: 3, count: 8 },
      { day: 4, count: 9 },
      { day: 5, count: 9 }
    ] as DC[],
    canceledOrdersByWeekDayValue: [
      { day: 1, count: 1 },
      { day: 2, count: 1 },
      { day: 3, count: 1 },
      { day: 4, count: 1 },
      { day: 5, count: 1 }
    ] as DC[]
  }
);

