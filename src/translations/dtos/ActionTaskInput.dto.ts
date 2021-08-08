import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { TaskActions } from 'src/common/enums/TASK_ACTIONS.enum';

@InputType()
export class ActionTaskInput {
  @Field()
  taskId: number;

  @Field(() => TaskActions)
  action: TaskActions;
}
