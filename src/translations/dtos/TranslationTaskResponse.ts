import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TranslationTaskResponse {
  @Field((of) => Int)
  languageId: number;

  @Field()
  keyName: string;

  @Field()
  assignedLanguageName: string;

  @Field()
  assignedLanguageValue: string;

  @Field()
  en: string;
}
