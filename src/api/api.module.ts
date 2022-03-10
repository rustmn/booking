import { Module } from '@nestjs/common';
import { API } from './api.controller';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { OrdersModule } from 'src/orders/orders.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
  ],
  providers: [
    OrdersService,
    ProductsService
  ],
  controllers: [
    API
  ]
})
export class ApiModule {
  
}
