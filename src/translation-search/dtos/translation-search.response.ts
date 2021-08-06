import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class TranslationResponse {
  @Field()
  en: string;

  @Field()
  fr: string;

  @Field()
  zh: string;

  @Field()
  es: string;

  @Field()
  pt: string;

  @Field()
  ko: string;

  @Field()
  ar: string;
}

@ObjectType()
export class TranslationSearchResponse {
  @Field()
  keyName: string;

  @Field()
  description: string;

  @Field(() => TranslationResponse)
  translation: TranslationResponse;
}
