import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServerMessage {
  @Field()
  functionName: string;

  @Field()
  payload: string;
}
