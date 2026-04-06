import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { GetSearchDto, PostSearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search without saving to history' })
  async searchGet(@Query() queryParams: GetSearchDto) {
    return this.searchService.fetchFromDuckDuckGo(queryParams.q, queryParams.page, queryParams.limit);
  }

  @Post()
  @ApiOperation({ summary: 'Search and save query to history' })
  async searchPost(@Body() body: PostSearchDto) {
    this.searchService.saveQuery(body.query).catch((error) => {
      this.logger.error('Background history save failed', error);
    });

    return this.searchService.fetchFromDuckDuckGo(body.query, body.page, body.limit);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get recent search history' })
  async getHistory() {
    return this.searchService.getHistory();
  }
}