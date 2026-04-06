import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { dataSourceOptions } from './config/data-source';
import { SearchModule } from './search/search.module';
import { CACHE_TTL_MS } from './common/constants';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule.register({ isGlobal: true, ttl: CACHE_TTL_MS }),
    SearchModule,
  ],
})
export class AppModule {}
