import { Args, Query, Resolver } from '@nestjs/graphql';
import { TranslationSearchInput } from './dtos/translation-search.dto';
import { TranslationSearchResponse } from './dtos/translation-search.response';
import { TranslationSearchService } from './translation-search.service';

@Resolver()
export class TranslationSearchResolver {
  constructor(
    private readonly translationSearchService: TranslationSearchService,
  ) {}

  @Query(() => [TranslationSearchResponse], { nullable: true })
  async search(
    @Args('translationSearchInput')
    translationSearchInput: TranslationSearchInput,
  ): Promise<TranslationSearchResponse[]> {
    const result = await this.translationSearchService.search(
      translationSearchInput.queryText,
      translationSearchInput.fuzzy,
    );
    return result;
  }
}
