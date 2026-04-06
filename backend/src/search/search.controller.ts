import { Controller, Get, Post, Query, Body } from '@nestjs/common';

import { SearchService } from './search.service';
import { GetSearchDto, PostSearchDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchGet(@Query() queryParams: GetSearchDto) {
    return this.searchService.fetchFromDuckDuckGo(queryParams.q);
  }

  @Post()
  async searchPost(@Body() body: PostSearchDto) {
    this.searchService.saveQuery(body.query).catch(console.error);

    return this.searchService.fetchFromDuckDuckGo(body.query);
  }

  @Get('history')
  async getHistory() {
    return this.searchService.getHistory();
  }
}