import { Inject, Injectable, Global } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { EnvConfig } from './interfaces';

@Global()
@Injectable()
export class ConfigService {
  private readonly env_config: EnvConfig;

  constructor() {
    const file_path = `${process.env.NODE_ENV || 'development'}.env`;
    const env_file = path.resolve(__dirname, '../../src', file_path);

    this.env_config = dotenv.parse(fs.readFileSync(env_file));
  }

  getOrThrowException(key: string): string {
    if (!this.env_config[key]) {
      throw new Error(`key ${key} is not exist`);
    }
    return this.env_config[key];
  }
}