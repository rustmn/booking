import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { ProductsModule } from 'src/products/products.module';
import { ConfigModule } from 'src/config/config.module';
import { OrdersService } from './orders.service';
import { ConfigService } from 'src/config/config.service';
import { DbService } from 'src/db/db.service';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [
    ProductsModule,
  ],
  providers: [
    ProductsService,
    OrdersService
  ],
  exports: [
    OrdersService
  ]
})
export class OrdersModule {
  
}
