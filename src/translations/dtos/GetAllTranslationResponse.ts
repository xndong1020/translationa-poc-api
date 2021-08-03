import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetAllTranslationResponse {
  @Field()
  key: string;

  @Field()
  en: string;

  @Field()
  fr: string;

  @Field()
  zh: string;

  @Field()
  ar: string;

  @Field()
  pt: string;

  @Field()
  es: string;

  @Field()
  ko: string;
}
