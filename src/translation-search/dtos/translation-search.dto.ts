import { Field, InputType, ObjectType } from '@nestjs/graphql';
@InputType()
export class TranslationSearchInput {
  @Field()
  queryText: string;

  @Field(() => Boolean, { nullable: true })
  fuzzy?: boolean;
}
