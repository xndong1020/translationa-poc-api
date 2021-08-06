import { Module } from '@nestjs/common';
import { TranslationSearchResolver } from './translation-search.resolver';
import { TranslationSearchService } from './translation-search.service';

@Module({
  exports: [TranslationSearchService],
  providers: [TranslationSearchService, TranslationSearchResolver],
})
export class TranslationSearchModule {}
