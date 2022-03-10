import { DynamicModule, Module, Global } from '@nestjs/common';
import { DbService } from './db.service';
import { DB_CONNECTION } from './constants';
import { DbConnectionOptions } from '../config/interfaces';
import { ConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';

@Global()
@Module({})
export class DbModule {
  static forRoot(): DynamicModule {
    return {
      module: DbModule,
      providers: [
        DbService
      ],
      imports: [],
      exports: [DbService],
    };
  }
}