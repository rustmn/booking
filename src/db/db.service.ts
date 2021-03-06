import { Injectable } from '@nestjs/common';
import * as pgp from 'pg-promise';
import {
  IClient,
} from 'pg-promise/typescript/pg-subset';
import {
  IEventContext
} from 'pg-promise/typescript/pg-promise';
import { DbConnectionOptions } from '../config/interfaces';
import { ConfigService } from 'src/config/config.service';
import {
  DiscountPoint,
  Order,
  Product
} from '../orders/interfaces';
import { nanoid } from 'nanoid';
import {
  Tarif
} from './interfaces';
import connect from './db.connection';

@Injectable()
export class DbService {
  connection_options: DbConnectionOptions;
  _connection: IClient;
  connecting: boolean = false;
  constructor(
    private readonly config: ConfigService
  ) {
    if (!this.connection && !this.connecting) {
      this.connect();
    }
  }
  async connect() {
    this.connecting = true;

    return connect().then(con => {
      //@ts-ignore
      this.connection = con;
      this.connecting = false;
    })

  }

  async query(query: string, values: any[]) {
    return this.connection.query(query, values);
  }

  get connection(): IClient {
    return this._connection;
  }
  set connection(con: IClient) {
    this._connection = con;
  }

  errorHandler(event: IEventContext) {
    const rels = {
      cn: 'connection-related',
      ctx: 'transaction/query'
    }

    for (const key of Object.keys(rels)) {
      if (event.hasOwnProperty(key) && event[key]) {
        throw new Error(`${rels[key]} error`);
      }
    }
    throw new Error('unexpeted error');
  }

  async getLastOrderDate(product_id: number): Promise<Date | boolean> {
    const orders = await this.getOrders('last_month', product_id);
    if (!orders.length) {
      return false;
    }
    const last_order = orders.sort((a, b) => {
      //@ts-ignore
      return new Date(a.start_date) - new Date(b.start_date);
    }).slice(-1)[0];
    const dt = new Date(last_order.start_date);
    dt.setDate(dt.getDate() + last_order.period);
    return dt;
  }

  async getProducts(id?: number): Promise<Product[] | Product> {
    const db_name = this.config.getOrThrowException('DB_NAME');
    let query = `SELECT * FROM ${db_name}.products`;
    const values = [];
    if (id) {
      query += ' WHERE id=$1';
      values.push(id);
    }
    return this.query(query, values).then(res => {
      if (id) {
        return res[0];
      }
      return res;
    });
  }

  async getOrders(filter?: 'last_month' | 'last_quarter', id?: number): Promise<Order[]> {
    const db_name = this.config.getOrThrowException('DB_NAME');
    let query = `SELECT * FROM ${db_name}.orders`;
    const values = [];
    if (filter === 'last_month') {
      query += ` WHERE start_date >= date_trunc('month', current_date - interval '1' month)
      and start_date < date_trunc('month', current_date)`
    }
    if (id) {
      query += ' AND product_id=$1'
      values.push(id);
    }
    //@ts-ignore
    return this.query(query, values).then(res => {
      return res;
    });
  }

  async getDiscountPoints(): Promise<DiscountPoint[]> {
    const query = `SELECT * FROM ${this.config.getOrThrowException('DB_NAME')}.discounts`;
    //@ts-ignore
    return this.query(query, []).then(res => res);
  }

  async getProductTarif(id: number): Promise<Tarif> {
    const db_name = this.config.getOrThrowException('DB_NAME');
    const tarif = await this.query(`SELECT tarif FROM ${db_name}.products WHERE id=$1`, [id]).then(res => {
      return res[0].tarif;
    });
    return this.query(`SELECT * FROM ${db_name}.tarifs WHERE denotation=$1`, [tarif]).then(res => {
      return res[0];
    });
  }

  async saveOrder({
    period,
    created_at,
    user_id,
    start_date,
    price,
    product_id,
    tarif
  }: Order) {
    const db_name = this.config.getOrThrowException('DB_NAME');
    const query = `INSERT INTO ${db_name}.orders (id, product_id, price, user_id, period, start_date, tarif ${created_at ? ', created_at' : ''}) VALUES($1, $2, $3, $4, $5, $6, $7 ${created_at ? ', $8' : ''})`;
    const values = [nanoid(), product_id, price, user_id, period, start_date || new Date(), tarif];
    if (created_at) {
      //@ts-ignore
      values.push(created_at);
    }
    await this.query(`UPDATE ${db_name}.products SET in_use=$1 WHERE id=$2`, [true, product_id]);
    await this.query(query, values);
    return this.query(query.replace('.orders', '.active_orders'), values)
  }
  /**
   * Check if product is in use rn
   * @param id of the product
   */
  async checkAvailability(id: number): Promise<boolean> {
    const db_name = this.config.getOrThrowException('DB_NAME');
    const query = `SELECT in_use FROM ${db_name}.products WHERE id=$1`;
    return this.query(query, [id]).then(res =>{
      return res[0].in_use;
    });
  }
}