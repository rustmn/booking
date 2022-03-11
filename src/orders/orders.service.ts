import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Order } from './interfaces';
import { Tarif } from '../db/interfaces';

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: DbService,
  ) {}

  /**
   * Calculates the price of the order
   * @param id of the product
   * @param period number of days
   * @returns price
   */
   async calcPrice(id: number, period: number): Promise<number> {
    const { price } = await this.db.getProductTarif(id);
    const discount_points = await this.db.getDiscountPoints();
    const relevant_discount_points = discount_points.filter(point => point.clause < period);
    let total = price * period;
    let days = 0;

    for (const point of relevant_discount_points) {
      days = point.clause;
      let actual_active_days =  period - days;
      if (actual_active_days > point.active_days) {
        actual_active_days = point.active_days
      }
      if (actual_active_days <= 0) {
        actual_active_days = 1;
      }
      const raw_amount = price * actual_active_days;
      const decrease_amount = raw_amount / 100 * point.percent;
      total -= decrease_amount;
    }
    return total;
  }

  async orderProduct(options: {
    id: number;
    period: number;
    user_id: number;
    start_date: Date;
    created_at?: Date;
    price?: number;
    tarif?: string;
  }) {
    const price = await this.calcPrice(options.id, options.period);
    const { denotation } = await this.db.getProductTarif(options.id);

    const order: Order = {
      id: options.id,
      period: options.period,
      user_id: options.user_id,
      start_date: options.start_date,
      created_at: options.created_at,
      price: price,
      tarif: denotation
    }
    await this.db.saveOrder(order);
    return order;
  }
}