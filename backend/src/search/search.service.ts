import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { SearchHistory } from './entities/search-history.entity';

interface DdgTopic {
  Text?: string;
  FirstURL?: string;
  Topics?: DdgTopic[];
}

interface DdgResponse {
  RelatedTopics: DdgTopic[];
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchFromDuckDuckGo(query: string, page: number = 1, limit: number = 10) {
    try {
      const baseUrl = this.configService.get<string>('DDG_API_URL');
      const url = `${baseUrl}?q=${encodeURIComponent(query)}&format=json`;

      const response = await firstValueFrom(this.httpService.get<DdgResponse>(url));
      const topics = response.data.RelatedTopics || [];

      // 2. Generate IDs during mapping on the backend
      const results = topics.flatMap((topic: DdgTopic) => {
        if (topic.Topics) {
          return topic.Topics.map((t) => ({
            id: randomUUID(),
            title: t.Text,
            url: t.FirstURL,
          }));
        }
        if (topic.Text && topic.FirstURL) {
          return [{ id: randomUUID(), title: topic.Text, url: topic.FirstURL }];
        }
        return [];
      });

      const startIndex = (page - 1) * limit;
      const paginatedResults = results.slice(startIndex, startIndex + limit);

      return {
        results: paginatedResults,
        total: results.length,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`DuckDuckGo API failed for query: ${query}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to fetch data from search provider');
    }
  }

  async saveQuery(query: string): Promise<void> {
    try {
      const history = this.searchHistoryRepository.create({ query });
      await this.searchHistoryRepository.save(history);
    } catch (error) {
      this.logger.error(`Failed to save query to history: ${query}`, error instanceof Error ? error.stack : error);
    }
  }

  async getHistory() {
    const history = await this.searchHistoryRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return { history };
  }
}