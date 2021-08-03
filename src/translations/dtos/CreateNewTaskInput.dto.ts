import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class Assignees {
  @Field()
  language: string;

  @Field()
  email: string;
}

@InputType()
export class TranslationKey {
  @Field()
  keyName: string;

  @Field()
  keyValue: string;
}

@InputType()
export class CreateNewTaskInput {
  @Field()
  taskName: string;

  @Field((type) => [TranslationKey])
  translationItems: TranslationKey[];

  @Field((type) => [Assignees])
  assignees: Assignees[];
}
