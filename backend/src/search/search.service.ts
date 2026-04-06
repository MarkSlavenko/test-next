import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { SearchHistory } from './entities/search-history.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
    private readonly httpService: HttpService,
  ) {}

  async fetchFromDuckDuckGo(query: string) {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
      const response = await firstValueFrom(this.httpService.get(url));

      const topics = response.data.RelatedTopics || [];
      const results = topics.flatMap((topic: any) => {
        if (topic.Topics) {
          return topic.Topics.map((t: any) => ({
            title: t.Text,
            url: t.FirstURL,
          }));
        }
        if (topic.Text && topic.FirstURL) {
          return [{ title: topic.Text, url: topic.FirstURL }];
        }
        return [];
      });

      return {
        results,
        total: results.length,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch data from search provider');
    }
  }

  async saveQuery(query: string): Promise<void> {
    const history = this.searchHistoryRepository.create({ query });
    await this.searchHistoryRepository.save(history);
  }

  async getHistory() {
    const history = await this.searchHistoryRepository.find({
      order: { createdAt: 'DESC' },
    });

    return { history };
  }
}