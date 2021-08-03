import { Field, InputType, Int, PickType } from '@nestjs/graphql';

@InputType()
export class GetTranslationLanguageInput {
  @Field(() => Int)
  taskId: number;

  @Field({ nullable: true })
  myTaskLanguage?: string;
}
