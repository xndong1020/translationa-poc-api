import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Translation } from './translation.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'languages' })
export class Language extends CoreEntity {
  @OneToOne(() => Translation)
  @JoinColumn()
  translation: Translation;

  @Column({ nullable: true })
  @Field()
  en: string;

  @Column({ nullable: true })
  @Field()
  fr: string;

  @Column({ nullable: true })
  @Field()
  zh: string;

  @Column({ nullable: true })
  @Field()
  pt: string;

  @Column({ nullable: true })
  @Field()
  es: string;

  @Column({ nullable: true })
  @Field()
  ar: string;

  @Column({ nullable: true })
  @Field()
  ko: string;
}
