import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { TaskStatus } from 'src/common/enums/TASK_STATUS.enum';
import {
  AfterLoad,
  Column,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Assignee } from './assignee.entity';
import { Translation } from './translation.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'tasks' })
export class Task extends CoreEntity {
  @Column()
  @Field()
  name: string;

  @UpdateDateColumn({ name: 'saved_on', nullable: true })
  @Field()
  savedOn: Date;

  @Column()
  @Field((type) => TaskStatus)
  status: TaskStatus;

  @Column({ name: 'updated_by', nullable: true })
  @Field({ nullable: true })
  updatedBy?: string;

  @OneToMany(() => Translation, (translation) => translation.task)
  @Field((type) => [Translation])
  translationItems: Translation[];

  @OneToMany(() => Assignee, (assignee) => assignee.task)
  @Field(() => [Assignee])
  assignees: Assignee[];

  @Field(() => Boolean, { nullable: true })
  hasCompleted?: boolean;

  @Field(() => Int, { nullable: true })
  totalKeysCount?: number;

  @Field(() => Int, { nullable: true })
  pendingKeysCount?: number;

  @AfterLoad()
  checkTaskComplete() {
    this.hasCompleted = this.translationItems?.every(
      (item) => item.hasComplete,
    );

    this.totalKeysCount = this.translationItems?.length;

    this.pendingKeysCount = this.translationItems?.filter(
      (item) => !item.hasComplete,
    ).length;
  }
}
