import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly db: DbService,
    private readonly config: ConfigService
  ) {}

  async checkAvailability(id: number) {
    const db_name = this.config.getOrThrowException('DB_NAME');
    const product = await this.db.query(`SELECT in_use FROM ${db_name}.booking WHERE id=$1`, [id]);
    console.log('product: ', product);
  }

  async getProductTarif(id: number) {
    return this.db.getProductTarif(id);
  }
}