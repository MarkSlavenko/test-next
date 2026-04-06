import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';

import { SearchService } from './search.service';
import { GetSearchDto, PostSearchDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchGet(@Query() queryParams: GetSearchDto) {
    return this.searchService.fetchFromDuckDuckGo(queryParams.q, queryParams.page, queryParams.limit);
  }

  @Post()
  async searchPost(@Body() body: PostSearchDto) {
    this.searchService.saveQuery(body.query).catch((error) => {
      this.logger.error('Background history save failed', error);
    });

    return this.searchService.fetchFromDuckDuckGo(body.query, body.page, body.limit);
  }

  @Get('history')
  async getHistory() {
    return this.searchService.getHistory();
  }
}