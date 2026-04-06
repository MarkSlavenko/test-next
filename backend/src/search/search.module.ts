import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchHistory } from './entities/search-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchHistory]),
    HttpModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
