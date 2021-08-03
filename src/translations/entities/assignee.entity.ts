import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Language } from './language.entity';
import { Task } from './task.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'assignees' })
export class Assignee extends CoreEntity {
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ name: 'assigned_language' })
  @Field()
  assignedLanguage: string;

  @ManyToOne(() => Task, (task) => task.assignees)
  @Field(() => Task)
  task: Task;
}
