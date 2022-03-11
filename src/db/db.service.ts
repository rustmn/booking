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
  DiscountPoint, Order
} from '../orders/interfaces';
import { nanoid } from 'nanoid';
import {
  Tarif
} from './interfaces';

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
  async connect(): Promise<IClient> {
    this.connecting = true;
    const _con: IClient = await new Promise(async (resolve, reject) => {
      const connection_options = {
        host: this.config.getOrThrowException('DB_HOST'),
        user: this.config.getOrThrowException('DB_USER'),
        password: this.config.getOrThrowException('DB_PASSWORD'),
        port: parseInt('5432' || this.config.getOrThrowException('DB_PORT')),
        db: 'booking'
      }
      const p = pgp({
      error: (error, e) => {
        this.errorHandler(e);
        this.connecting = false;
      }
      });
      const db = p(connection_options);
      //@ts-ignore
      await db.connect(connection_options).then(con => {
      //@ts-ignore
      this.connection = con;
      this.connecting = false;
      });
    });
    return _con;
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
        console.log(event[key]);
        throw new Error(`${rels[key]} error`);
      }
    }
    throw new Error('unexpeted error');
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
    id,
    tarif
  }: Order) {
    const db_name = this.config.getOrThrowException('DB_NAME');
    const query = `INSERT INTO ${db_name}.orders (id, product_id, price, user_id, period, start_date, tarif ${created_at ? ', created_at' : ''}) VALUES($1, $2, $3, $4, $5, $6, $7 ${created_at ? ', $8' : ''})`;
    const values = [nanoid(), id, price, user_id, period, start_date || new Date(), tarif];
    if (created_at) {
      //@ts-ignore
      values.push(created_at);
    }
    await this.query(`UPDATE ${db_name}.products SET in_use=$1`, [true]);
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