import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { AfterLoad, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Translation } from './translation.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'languages' })
export class Language extends CoreEntity {
  @OneToOne(() => Translation, (translation) => translation.language)
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

  @Field(() => Boolean)
  hasComplete: boolean;

  @AfterLoad()
  checkIfComplete() {
    this.hasComplete =
      !!this.en &&
      !!this.fr &&
      !!this.zh &&
      !!this.pt &&
      !!this.es &&
      !!this.ar &&
      !!this.ko;
  }
}
