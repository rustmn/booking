import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ApiModule } from './api/api.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { ConfigService } from './config/config.service';
import { API } from './api/api.controller';
import { ProductsService } from './products/products.service';
import { OrdersService } from './orders/orders.service';

@Module({
  imports: [
    ConfigModule.register({
      folder: './src/config'
    }),
    DbModule.forRoot(),
    ApiModule,
    OrdersModule,
    ProductsModule
  ],
  controllers: [AppController, API],
  providers: [
    AppService,
    ConfigService,
    DbService,
    ProductsService,
    OrdersService,
  ],
})
export class AppModule {}
