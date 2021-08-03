import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { Assignee } from './assignee.entity';
import { Translation } from './translation.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'tasks' })
export class Task extends CoreEntity {
  @Column()
  @Field()
  name: string;

  // @Column({ name: 'assignee_email' })
  // @Field()
  // assigneeEmail: string;

  @UpdateDateColumn({ name: 'saved_on', nullable: true })
  @Field()
  savedOn: Date;

  @Column({ name: 'is_complete' })
  @Field((type) => Boolean)
  isComplete: boolean;

  @OneToMany(() => Translation, (translation) => translation.task)
  @Field((type) => [Translation])
  translationItems: Translation[];

  @OneToMany(() => Assignee, (assignee) => assignee.task)
  @Field(() => [Assignee])
  assignees: Assignee[];
}
