import { Field, InputType, PickType } from '@nestjs/graphql';
import { Task } from '../entities/task.entity';

@InputType()
export class CreateTaskInput extends PickType(Task, ['name'] as const) {}
