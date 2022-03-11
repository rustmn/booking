import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly db: DbService,
    private readonly config: ConfigService
  ) {}

  async getProductTarif(id: number) {
    return this.db.getProductTarif(id);
  }
}