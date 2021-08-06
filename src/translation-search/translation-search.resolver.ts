import { Args, Query, Resolver } from '@nestjs/graphql';
import { TranslationSearchResponse } from './dtos/translation-search.response';
import { TranslationSearchService } from './translation-search.service';

@Resolver()
export class TranslationSearchResolver {
  constructor(
    private readonly translationSearchService: TranslationSearchService,
  ) {}

  @Query(() => [TranslationSearchResponse], { nullable: true })
  async search(
    @Args('queryText') queryText: string,
  ): Promise<TranslationSearchResponse[]> {
    const result = await this.translationSearchService.search(queryText);
    console.log(result);
    return result;
  }
}
