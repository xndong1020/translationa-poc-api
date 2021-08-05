import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { AfterLoad, Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Language } from './language.entity';
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

  @OneToOne(() => Language, (language) => language.translation)
  language: Language;

  @Field(() => Boolean, { nullable: true })
  hasComplete?: boolean;

  @AfterLoad()
  checkComplete() {
    this.hasComplete = this.language?.hasComplete;
  }
}
