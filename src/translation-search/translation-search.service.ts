import { ApiResponse } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TranslationSearchResponse } from './dtos/translation-search.response';

export interface ITranslateProps {
  keyName: string;
  description: string;
  translation: ITranslation;
}

export interface ITranslation {
  en: string;
  fr: string;
  zh: string;
  es: string;
  pt: string;
  ko: string;
  ar: string;
}

@Injectable()
export class TranslationSearchService {
  private readonly _index = 'translation_data';
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexRecord(
    payload: ITranslateProps,
  ): Promise<ApiResponse<Record<string, any>, unknown>> {
    return this.elasticsearchService.index({
      index: this._index,
      body: payload,
    });
  }

  async indexRecordsBulk(
    dataset: ITranslateProps[],
  ): Promise<ApiResponse<Record<string, any>, unknown>> {
    const body = dataset.flatMap((doc) => [
      { index: { _index: this._index } },
      doc,
    ]);
    console.log('body', body);
    return this.elasticsearchService.bulk({
      index: this._index,
      body,
    });
  }

  async search(queryText: string): Promise<TranslationSearchResponse[]> {
    const { body } = await this.elasticsearchService.search({
      index: this._index,
      body: {
        query: {
          match: {
            description: {
              query: queryText,
              fuzziness: 2,
            },
          },
        },
      },
    });
    const {
      hits: { hits, max_score, total },
    } = body;
    return hits.map((item) => item._source);
  }
}
