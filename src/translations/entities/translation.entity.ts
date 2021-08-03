import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Task } from './task.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'translations' })
export class Translation extends CoreEntity {
  @Field()
  @Column()
  keyName: string;

  @ManyToOne(() => Task, (task) => task.translationItems)
  @Field(() => Task)
  task: Task;
}
